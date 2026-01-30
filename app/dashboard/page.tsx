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

    // Use lowStockAt from the database, if it doesn't exist, use 5
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

  //Weekly Products
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

  console.log("total value:", totalValue);
  console.log(weeklyProductsData.length);

  // Display the text in the center of the Efficiency circle
  let centerValue = `${inStockPercentage}%`;
  let centerLabel = "In Stock";

  if (lowStockPercentage === 100) {
    centerValue = "100%";
    centerLabel = "Low Stock";
  } else if (outOfStockPercentage === 100) {
    centerValue = "100%";
    centerLabel = "Out of Stock";
  } else if (inStockPercentage === 0 && lowStockPercentage > 0) {
    // If there is nothing in stock but there is Low Stock, show the Low Stock percentage
    centerValue = `${lowStockPercentage}%`;
    centerLabel = "Low Stock";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPath="/dashboard" />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back! Here is an overview of your inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Key Metrics
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Total Products */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {totalProducts}
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Products</div>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                    Inventory Size
                  </span>
                </div>
              </div>

              {/* Total Value */}
              <div className="text-center border-x border-gray-100 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-3xl font-bold text-gray-900">
                    $
                    {Number(totalValue).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Value</div>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                    Net Asset
                  </span>
                </div>
              </div>

              {/* Low Stock */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {lowStockCount}
                  </div>

                  <div className="flex items-center space-x-1">
                    {lowStockCount > 0 && (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}

                    {lowStockCount > 10 && (
                      <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mt-1">Low Stock</div>

                <div className="flex items-center justify-center mt-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
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

          {/* Iventory Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                New products per week
              </h2>
            </div>
            <div className="h-48">
              <ProductsChart data={weeklyProductsData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Levels */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
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
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${bgColors[stockLevel]}`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-semibold ${textColors[stockLevel]}`}
                    >
                      {product.quantity} units
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Efficiency
              </h2>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
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

                {/* Circle Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    {" "}
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

            {/* Colors Footer */}
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
      </main>
    </div>
  );
}
