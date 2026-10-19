'use server'

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function confirmStockUpdate(productId: string, newQuantity: number, reason: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const product = await prisma.product.findUnique({
    where: { id: productId, userId },
  })

  if (!product) throw new Error("Proizvod nije pronađen.")

  const oldQuantity = product.quantity

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    }),
    prisma.activity.create({
      data: {
        userId,
        action: "UPDATE",
        entityType: "Product",
        entityName: product.name,
        details: `Količina promenjena sa ${oldQuantity} na ${newQuantity}. Razlog: ${reason}`,
      },
    }),
  ])

  revalidatePath("/")
  revalidatePath("/dashboard")
  return { success: true }
}