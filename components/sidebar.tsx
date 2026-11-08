import { UserButton } from "@clerk/nextjs";
import { BarChart3, Grid2x2Plus, Package, Plus, Settings } from "lucide-react";
import Link from "next/link";

const navigation = [
  {
    name: "Dashboard",
    shortName: "Home",
    href: "/dashboard",
    icon: BarChart3,
  },
  { name: "Inventory", shortName: "Stock", href: "/inventory", icon: Package },
  { name: "Add Product", shortName: "Add", href: "/add-product", icon: Plus },
  {
    name: "Categories",
    shortName: "Tags",
    href: "/categories",
    icon: Grid2x2Plus,
  },
  { name: "Settings", shortName: "Settings", href: "/settings", icon: Settings },
];

const userButtonAppearance = {
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
};

export default function Sidebar({
  currentPath = "/dashboard",
}: {
  currentPath: string;
}) {
  const activeItem =
    navigation.find((item) => item.href === currentPath) ?? navigation[0];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-100 bg-white p-6 shadow-sm lg:flex">
        <div className="mb-10">
          <Link href="/dashboard" className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-purple-600 p-1.5">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Stock.app
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <div className="mb-2 ml-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Main Menu
          </div>
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center space-x-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-purple-50 font-semibold text-purple-700 shadow-sm ring-1 ring-purple-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-400"}`}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-gray-50 pt-4">
          <div className="flex items-center justify-start pl-2">
            <UserButton
              appearance={userButtonAppearance}
              showName={true}
            />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <div className="shrink-0 rounded-lg bg-purple-600 p-1.5">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="truncate text-lg font-bold tracking-tight text-gray-900">
            Stock.app
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[8rem] truncate text-xs font-medium text-gray-500 min-[380px]:block">
            {activeItem.name}
          </span>
          <UserButton
            appearance={userButtonAppearance}
            showName={false}
          />
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="grid h-16 grid-cols-5">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 transition-colors ${
                  isActive
                    ? "text-purple-700"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 ${isActive ? "text-purple-600" : ""}`}
                />
                <span className="max-w-full truncate text-[10px] font-medium leading-none">
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
