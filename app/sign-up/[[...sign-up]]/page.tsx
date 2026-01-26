import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-[400px]">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "#18181b",
            },
            elements: {
              card: "shadow-none border border-zinc-200",
              formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 transition-all",
              footer: "hidden",
            },
          }}
        />
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-zinc-900 font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

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
