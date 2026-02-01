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
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <span className="font-medium tracking-tighter text-xl">Stock.app</span>
        <Link
          href="/sign-in"
          className="text-sm font-medium hover:text-zinc-500 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        {/* Hero Section */}
        <FadeIn>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-3xl leading-[1.1]">
            Inventory tracking, <br />
            <span className="text-zinc-400">simplified.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-lg text-zinc-500 mb-12 max-w-lg leading-relaxed">
            Monitor stock levels and gain insights without the complexity of
            traditional systems. Built for modern teams.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
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
        </FadeIn>

        {/* Dashboard Preview Image */}
        <FadeIn delay={0.6}>
          <div className="mt-24 w-full max-w-5xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden relative bg-white group">
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
        <div className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="space-y-4">
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
        <FadeIn>
          <div className="mt-32 p-12 bg-zinc-50 rounded-3xl border border-zinc-100 w-full max-w-5xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to optimize your stock?
            </h2>
            <p className="text-zinc-500 mb-8">
              Join hundreds of teams managing their inventory the smart way.
            </p>
            <Link
              href="/sign-up"
              className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all inline-block"
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