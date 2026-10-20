import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export async function getCurrentUser() {
  try {
    const user = await currentUser();

    if (!user) {
      redirect("/sign-in");
    }

    return user;
  } catch (error) {
    console.error("Clerk Auth Error:", error);
    redirect("/sign-in");
  }
}

/**
 * Returns the Clerk user's row in our database, creating it on first use.
 * Server actions that insert rows referencing User.id must call this first.
 */
export async function getDbUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("User has no email address");
  }

  return prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}