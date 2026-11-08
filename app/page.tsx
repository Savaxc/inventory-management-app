import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { BarChart3, Shield, Bell, LayoutDashboard } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  const features = [
    {
      title: "Real-time Analytics",
      description:
        "Track your stock value and product growth with intuitive weekly charts.",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      title: "Smart Alerts",
      description:
        "Get notified immediately when products reach their low-stock threshold.",
      icon: <Bell className="w-6 h-6" />,
    },
    {
      title: "Minimalist Interface",
      description:
        "No clutter. Just the data you need to manage your business effectively.",
      icon: <LayoutDashboard className="w-6 h-6" />,
    },
    {
      title: "Fast & Secure",
      description:
        "Built on top of modern technology to ensure your data is safe and accessible.",
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-8">
        <span className="text-xl font-medium tracking-tighter">Stock.app</span>
        <Link
          href="/sign-in"
          className="text-sm font-medium transition-colors hover:text-zinc-500"
        >
          Sign In
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center px-5 pt-12 pb-24 text-center sm:px-6 sm:pt-20 sm:pb-32">
        {/* Hero Section */}
        <FadeIn>
          <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:mb-8 sm:text-5xl md:text-7xl">
            Inventory tracking, <br />
            <span className="text-zinc-400">simplified.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mb-9 max-w-lg text-base leading-relaxed text-zinc-500 sm:mb-12 sm:text-lg">
            Monitor stock levels and gain insights without the complexity of
            traditional systems. Built for modern teams.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} className="w-full sm:w-auto">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/sign-in"
              className="w-full rounded-full bg-zinc-900 px-10 py-4 text-center font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 sm:w-auto"
            >
              Get Started
            </Link>
            <button className="w-full rounded-full border border-zinc-200 bg-transparent px-10 py-4 font-medium text-zinc-900 transition-all hover:border-zinc-900 sm:w-auto">
              View Demo
            </button>
          </div>
        </FadeIn>

        {/* Dashboard Preview Image */}
        <FadeIn delay={0.6} className="w-full">
          <div className="group relative mx-auto mt-16 w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:mt-24">
            <div className="w-full h-8 bg-zinc-100/80 border-b border-zinc-200 flex items-center px-4 gap-1.5 z-10 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>

            <div className="relative p-1 bg-zinc-50">
              <Image
                src="/dashboard-preview-photo.png"
                alt="Stock.app Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg shadow-sm transition-transform duration-700 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div className="mx-auto mt-20 grid w-full max-w-6xl grid-cols-1 gap-8 text-left sm:mt-32 sm:gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 0.1} className="h-full">
              <div className="h-full space-y-4">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-900">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Call to Action Bottom */}
        <FadeIn className="w-full">
          <div className="mx-auto mt-20 w-full max-w-5xl rounded-3xl border border-zinc-100 bg-zinc-50 p-6 sm:mt-32 sm:p-12">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Ready to optimize your stock?
            </h2>
            <p className="mb-8 text-zinc-500">
              Join hundreds of teams managing their inventory the smart way.
            </p>
            <Link
              href="/sign-up"
              className="inline-block rounded-full bg-zinc-900 px-8 py-3 font-medium text-white transition-all hover:bg-zinc-800"
            >
              Create your account
            </Link>
          </div>
        </FadeIn>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 text-center text-zinc-400 text-sm">
        <p>© {new Date().getFullYear()} Stock.app. All rights reserved.</p>
      </footer>
    </div>
  );
}