"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().transform(val => val.trim() === "" ? null : val).optional(),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  lowStockAt: z.coerce.number().int().min(0).optional().default(5),
});

async function syncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized");

  return await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}

export async function createProduct(formData: FormData) {
  const dbUser = await syncUser();

  const validatedFields = ProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten());
    throw new Error("Validation failed");
  }

  try {
    await prisma.product.create({
      data: {
        ...validatedFields.data,
        userId: dbUser.id,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("DETALJNA GREŠKA PRI KREIRANJU:", error);
    throw new Error("Failed to create product in database.");
  }
  redirect("/inventory");
}

export async function deleteProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const id = String(formData.get("id") || "");

  await prisma.product.deleteMany({
    where: { 
        id: id, 
        userId: userId
    },
  });
  
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function deleteManyProducts(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  await prisma.product.deleteMany({
    where: {
      id: { in: ids },
      userId: userId
    }
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}