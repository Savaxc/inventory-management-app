import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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