import { prisma } from "./db";

export async function logActivity(
  userId: string, 
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT", 
  entityType: "PRODUCT" | "CATEGORY",
  entityName: string,
  details: string
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        action,
        entityType,
        entityName,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}