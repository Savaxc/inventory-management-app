"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "../db";

export async function createCategory(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const category = await prisma.category.create({
    data: {
      name,
      userId,
    },
  });

  revalidatePath("/inventory");
  return category;
}

export async function getCategories() {
  const { userId } = await auth();
  if (!userId) return [];

  return await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function updateCategory(id: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.category.update({
    where: { id, userId },
    data: { name },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.category.delete({
    where: { id, userId },
  });

  revalidatePath("/categories");
  return { success: true };
}