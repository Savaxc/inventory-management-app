import { ActivityFeed } from "@/components/activity-feed";
import ProductsChart from "@/components/products-chart";
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrendingUp, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const allProducts = await prisma.product.findMany({
    where: { userId },
    select: {
      price: true,
      quantity: true,
      createdAt: true,
      lowStockAt: true,
      name: true,
    },
  });

  const totalProducts = allProducts.length;

  const totalValue = allProducts.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0,
  );

  const outOfStockCount = allProducts.filter(
    (p) => Number(p.quantity) === 0
  ).length;

  const lowStockCount = allProducts.filter((p) => {
    const productQuantity = Number(p.quantity);
    const threshold = p.lowStockAt ?? 5;
    return productQuantity > 0 && productQuantity <= threshold;
  }).length;

  const inStockCount = allProducts.filter((p) => {
    const productQuantity = Number(p.quantity);
    const threshold = p.lowStockAt ?? 5;
    return productQuantity > threshold;
  }).length;

  const inStockPercentage =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPercentage =
    totalProducts > 0
      ? Math.max(0, 100 - (inStockPercentage + lowStockPercentage))
      : 0;

  const now = new Date();
  const weeklyProductsData = [];

  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekLabel = `${String(weekStart.getDate()).padStart(2, "0")}/${String(weekStart.getMonth() + 1).padStart(2, "0")}`;

    const weekProducts = allProducts.filter((product) => {
      const productDate = new Date(product.createdAt);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    });
  }

  const recent = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  let centerValue = `${inStockPercentage}%`;
  let centerLabel = "In Stock";

  if (lowStockPercentage === 100) {
    centerValue = "100%";
    centerLabel = "Low Stock";
  } else if (outOfStockPercentage === 100) {
    centerValue = "100%";
    centerLabel = "Out of Stock";
  } else if (inStockPercentage === 0 && lowStockPercentage > 0) {
    centerValue = `${lowStockPercentage}%`;
    centerLabel = "Low Stock";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPath="/dashboard" />

      {/* Main Content */}
      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back! Here is an overview of your inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-8 lg:grid-cols-2 lg:gap-8">
          {/* Key Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900 sm:mb-6">
              Key Metrics
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {totalProducts}
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mt-1 text-sm text-gray-600">Total Products</div>
                <div className="mt-2 flex items-center justify-center">
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                    Inventory Size
                  </span>
                </div>
              </div>

              <div className="border-y border-gray-100 py-5 text-center sm:border-x sm:border-y-0 sm:px-4 sm:py-0">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    $
                    {Number(totalValue).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="mt-1 text-sm text-gray-600">Total Value</div>
                <div className="mt-2 flex items-center justify-center">
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                    Net Asset
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {lowStockCount}
                  </div>

                  <div className="flex items-center space-x-1">
                    {lowStockCount > 0 && (
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    )}

                    {lowStockCount > 10 && (
                      <AlertCircle className="h-6 w-6 animate-pulse text-red-600" />
                    )}
                  </div>
                </div>

                <div className="mt-1 text-sm text-gray-600">Low Stock</div>

                <div className="mt-2 flex items-center justify-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      lowStockCount > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {lowStockCount > 0 ? "Action required" : "All good"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Over Time */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                New products per week
              </h2>
            </div>
            <div className="h-44 sm:h-48">
              <ProductsChart data={weeklyProductsData} />
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-8 lg:grid-cols-2 lg:gap-8">
          {/* Stock Levels */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Stock Levels <span className="text-sm">(5 most recent)</span>
              </h2>
            </div>
            <div className="space-y-3">
              {recent.map((product, key) => {
                const threshold = product.lowStockAt ?? 5;
                const stockLevel =
                  product.quantity === 0
                    ? 0
                    : product.quantity <= threshold
                      ? 1
                      : 2;

                const bgColors = [
                  "bg-red-600",
                  "bg-yellow-400",
                  "bg-green-600",
                ];
                const textColors = [
                  "text-red-600",
                  "text-yellow-400",
                  "text-green-600",
                ];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex min-w-0 items-center space-x-3">
                      <div
                        className={`h-3 w-3 shrink-0 rounded-full ${bgColors[stockLevel]}`}
                      />
                      <span className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div
                      className={`shrink-0 text-sm font-semibold ${textColors[stockLevel]}`}
                    >
                      {product.quantity} units
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efficiency */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Efficiency
              </h2>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-40 w-40 sm:h-48 sm:w-48">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #9333ea 0% ${inStockPercentage}%, 
                      #facc15 ${inStockPercentage}% ${inStockPercentage + lowStockPercentage}%, 
                      #dc2626 ${inStockPercentage + lowStockPercentage}% 100%
                    )`,
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #fff calc(100% - 7px))",
                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 8px), #fff calc(100% - 7px))",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="text-3xl font-bold text-gray-900 leading-tight">
                      {centerValue}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold whitespace-nowrap">
                      {centerLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[
                {
                  label: "In Stock",
                  val: inStockPercentage,
                  color: "bg-purple-600",
                },
                {
                  label: "Low Stock",
                  val: lowStockPercentage,
                  color: "bg-yellow-400",
                },
                {
                  label: "Out of Stock",
                  val: outOfStockPercentage,
                  color: "bg-red-600",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-gray-600 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-gray-900 font-bold">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mb-8">
          <ActivityFeed userId={user.id} />
        </div>
      </main>
    </div>
  );
}