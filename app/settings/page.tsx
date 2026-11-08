import Sidebar from "@/components/sidebar";
import { UserProfile } from "@clerk/nextjs";
import { Settings as SettingsIcon, ShieldCheck, User } from "lucide-react";

export default async function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <Sidebar currentPath="/settings" />

      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        {/* Header */}
        <div className="mx-auto mb-7 max-w-5xl sm:mb-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-500 sm:ml-12">
            Manage your personal information, security preferences, and
            connected accounts.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full !max-w-none !m-0 !block",
                  card: "w-full !max-w-none !shadow-none !border-none bg-transparent",
                  navbar:
                    "bg-gray-50/50 border-r border-gray-100 p-4 shrink-0 sm:p-8",
                  navbarMobileMenuButton: "text-purple-600",
                  scrollBox: "w-full !max-w-none !rounded-none",
                  pageScrollBox: "w-full !max-w-none !rounded-none !p-2 sm:!p-8",
                  contentBox: "w-full !max-w-none !block",
                  footer: "hidden !h-0 !p-0 !m-0 !border-none",
                  footerAction: "hidden",
                  headerTitle:
                    "text-xl font-bold tracking-tight text-gray-900 sm:text-2xl",
                  headerSubtitle: "text-gray-500",
                },
                variables: {
                  colorPrimary: "#9333ea",
                  borderRadius: "0.75rem",
                },
              }}
            />
        </div>

        {/*Additional Section */}
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-2xl border border-purple-100 bg-purple-50 p-5 sm:p-6">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-purple-600" />
            <div className="min-w-0">
              <h3 className="font-semibold text-purple-900">Security Audit</h3>
              <p className="mt-1 text-sm text-purple-700">
                Your account is currently secured with Two-Factor Authentication
                via Clerk.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
            <User className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
            <div className="min-w-0">
              <h3 className="font-semibold text-blue-900">Subscription Plan</h3>
              <p className="mt-1 text-sm text-blue-700">
                You are on the <span className="font-bold">Pro Free Tier</span>.
                Everything is unlocked.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
