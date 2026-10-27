'use server'

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

const STALE_QUANTITY = "STALE_QUANTITY"

class StaleQuantityError extends Error {
  constructor() {
    super(STALE_QUANTITY)
    this.name = "StaleQuantityError"
  }
}

export async function confirmStockUpdate(
  productId: string,
  newQuantity: number,
  reason: string,
  expectedOldQuantity?: number,
) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: "Nisi prijavljen." }

  const id = typeof productId === "string" ? productId.trim() : ""
  if (!id) return { success: false as const, error: "Neispravan proizvod." }

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return {
      success: false as const,
      error: "Količina mora biti ceo broj veći ili jednak 0.",
    }
  }

  if (
    expectedOldQuantity !== undefined &&
    (!Number.isInteger(expectedOldQuantity) || expectedOldQuantity < 0)
  ) {
    return { success: false as const, error: "Neispravno početno stanje zaliha." }
  }

  const normalizedReason =
    typeof reason === "string" && reason.trim()
      ? reason.trim().slice(0, 500)
      : "Bez razloga"

  const product = await prisma.product.findUnique({
    where: { id, userId },
  })

  if (!product) {
    return { success: false as const, error: "Proizvod nije pronađen." }
  }

  const oldQuantity = product.quantity

  if (expectedOldQuantity !== undefined && oldQuantity !== expectedOldQuantity) {
    return {
      success: false as const,
      error:
        "Zaliha se promenila od trenutka predloga. Zamoli asistenta za novi predlog.",
    }
  }

  if (oldQuantity === newQuantity) {
    return { success: true as const, oldQuantity, newQuantity }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: {
          id,
          userId,
          ...(expectedOldQuantity !== undefined
            ? { quantity: expectedOldQuantity }
            : {}),
        },
        data: { quantity: newQuantity },
      })

      if (updated.count === 0) throw new StaleQuantityError()

      await tx.activity.create({
        data: {
          userId,
          action: "UPDATE",
          entityType: "Product",
          entityName: product.name,
          details: `Količina promenjena sa ${oldQuantity} na ${newQuantity}. Razlog: ${normalizedReason}`,
        },
      })
    })
  } catch (err) {
    if (err instanceof StaleQuantityError) {
      return {
        success: false as const,
        error:
          "Zaliha se promenila od trenutka predloga. Zamoli asistenta za novi predlog.",
      }
    }

    console.error("Greška pri potvrdi izmene zaliha:", err)
    return {
      success: false as const,
      error: "Izmena nije primenjena. Pokušaj ponovo.",
    }
  }

  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/inventory")
  return { success: true as const, oldQuantity, newQuantity }
}
