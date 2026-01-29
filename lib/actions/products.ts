"use server"

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import { prisma } from "../db";

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  await prisma.product.deleteMany({
    where: { id: id, userId: user.id },
  });
  
  revalidatePath("/inventory");
}

export async function deleteManyProducts(ids: string[]) {
  const user = await getCurrentUser();
  
  await prisma.product.deleteMany({
    where: {
      id: { in: ids },
      userId: user.id
    }
  });

  revalidatePath("/inventory");
}