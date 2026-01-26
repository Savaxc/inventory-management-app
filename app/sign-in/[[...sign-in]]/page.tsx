/* eslint-disable react/no-unescaped-entities */
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-[400px]">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{
            variables: {
              colorPrimary: "#18181b",
            },
            elements: {
              card: "shadow-none border border-zinc-200",
              footer: "hidden",
            },
          }}
        />

        <p className="mt-4 text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-zinc-900 font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-1 transition-transform"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Go Back Home
      </Link>
    </div>
  );
}
