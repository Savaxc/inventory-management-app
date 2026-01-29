import { UserButton } from "@clerk/nextjs";
import { BarChart3, Package, Plus, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar({
  currentPath = "/dashboard",
}: {
  currentPath: string;
}) {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Add Product", href: "/add-product", icon: Plus },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 bg-white text-gray-900 w-64 min-h-screen p-6 z-10 border-r border-gray-100 shadow-sm">
      <div className="mb-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-purple-600 p-1.5 rounded-lg">
             <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Stock.app</span>
        </div>
      </div>

      <nav className="space-y-1.5">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-3">
          Main Menu
        </div>
        {navigation.map((item, key) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              href={item.href}
              key={key}
              className={`flex items-center space-x-3 py-2.5 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-purple-50 text-purple-700 font-semibold shadow-sm ring-1 ring-purple-100"
                  : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center justify-start pl-2">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 border border-gray-200 shadow-sm",
                userButtonOuterIdentifier: "text-gray-700 font-semibold",
                userButtonPopoverActionButtonLabel: "text-gray-700",
                userButtonPopoverActionButtonIcon: "text-gray-500",
                userButtonPopoverFooter: "hidden",
                footer: "hidden",
              },
              variables: {
                colorPrimary: "#9333ea",
                colorText: "#1f2937",
                colorBackground: "#ffffff",
              },
            }}
            showName={true}
          />
        </div>
      </div>
    </div>
  );
}