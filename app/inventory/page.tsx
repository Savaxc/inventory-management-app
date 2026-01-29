import Sidebar from "@/components/sidebar";
import InventoryTable from "@/components/inventory-table";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Search } from "lucide-react";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const user = await getCurrentUser();
  const userId = user.id;

  const params = await searchParams;
  const v = (params.v ?? "").trim();

  const rawProducts = await prisma.product.findMany({
    where: { userId, name: { contains: v, mode: "insensitive" } },
    orderBy: { createdAt: 'desc' }
  });

const products = rawProducts.map(p => ({
  ...p,
  price: p.price.toString(),
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
}));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPath="/inventory" />
      <main className="flex-1 ml-64 p-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-500">Manage your product stock levels.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Serch Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <form className="flex gap-3" action="/inventory" method="GET">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="v"
                  defaultValue={v}
                  placeholder="Search by product name..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                />
              </div>
              <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-shadow font-medium text-sm shadow-sm">
                Search
              </button>
            </form>
          </div>

          <InventoryTable key={v} products={products} />
        </div>
      </main>
    </div>
  );
}