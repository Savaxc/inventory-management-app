"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { logActivity } from "../logger";

export async function createCategory(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const category = await prisma.category.create({
    data: {
      name,
      userId,
    },
  });

  await logActivity(
    userId,
    "CREATE",
    "CATEGORY",
    category.name,
    "New category created for organizing products."
  );

  revalidatePath("/inventory");
  revalidatePath("/categories");
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

  const oldCategory = await prisma.category.findUnique({
    where: { id, userId },
  });

  const updatedCategory = await prisma.category.update({
    where: { id, userId },
    data: { name },
  });

  if (oldCategory) {
    await logActivity(
      userId,
      "UPDATE",
      "CATEGORY",
      updatedCategory.name,
      `Category renamed: "${oldCategory.name}" → "${updatedCategory.name}"`
    );
  }

  revalidatePath("/categories");
  revalidatePath("/inventory");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const categoryToDelete = await prisma.category.findUnique({
    where: { id, userId },
  });

  if (categoryToDelete) {
    await logActivity(
      userId,
      "DELETE",
      "CATEGORY",
      categoryToDelete.name,
      "Category deleted. Products assigned to this category may now be uncategorized."
    );
  }

  await prisma.category.delete({
    where: { id, userId },
  });

  revalidatePath("/categories");
  revalidatePath("/inventory");
  return { success: true };
}