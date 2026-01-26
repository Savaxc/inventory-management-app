import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <span className="font-medium tracking-tighter text-xl">Stock.app</span>
        <Link href="/sign-in" className="text-sm font-medium hover:text-zinc-500 transition-colors">
          Sign In
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-3xl leading-[1.1]">
          Inventory tracking, <br />
          <span className="text-zinc-400">simplified.</span>
        </h1>

        <p className="text-lg text-zinc-500 mb-12 max-w-lg leading-relaxed">
          Monitor stock levels and gain insights without the complexity of traditional systems. 
          Built for modern teams.
        </p>

        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="bg-zinc-900 text-white px-10 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all active:scale-95"
          >
            Get Started
          </Link>
          <button className="bg-transparent text-zinc-900 px-10 py-4 rounded-full font-medium border border-zinc-200 hover:border-zinc-900 transition-all">
            View Demo
          </button>
        </div>

        {/* Placeholder for UI */}
        <div className="mt-24 w-full max-w-5xl aspect-video bg-zinc-50 rounded-2xl border border-zinc-100 shadow-2xl overflow-hidden relative">
             <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-mono text-sm">
                [ minimalist_interface_preview ]
             </div>
        </div>
      </main>
    </div>
  );
}