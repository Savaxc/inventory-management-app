import Sidebar from "@/components/sidebar";
import { UserProfile } from "@clerk/nextjs";
import { Settings as SettingsIcon, ShieldCheck, User } from "lucide-react";

export default async function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <Sidebar currentPath="/settings" />

      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-500 ml-12">
            Manage your personal information, security preferences, and
            connected accounts.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full !max-w-none !m-0 !block",
                  card: "w-full !max-w-none !shadow-none !border-none bg-transparent !flex-row !min-h-[600px]",
                  navbar:
                    "bg-gray-50/50 border-r border-gray-100 p-8 shrink-0 !w-64",
                  navbarMobileMenuButton: "text-purple-600",
                  scrollBox: "w-full !max-w-none !rounded-none",
                  pageScrollBox: "w-full !max-w-none !p-8",
                  contentBox: "w-full !max-w-none !block",
                  footer: "hidden !h-0 !p-0 !m-0 !border-none",
                  footerAction: "hidden",
                  headerTitle:
                    "text-2xl font-bold tracking-tight text-gray-900",
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
        <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900">Security Audit</h3>
              <p className="text-sm text-purple-700 mt-1">
                Your account is currently secured with Two-Factor Authentication
                via Clerk.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
            <User className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">Subscription Plan</h3>
              <p className="text-sm text-blue-700 mt-1">
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
