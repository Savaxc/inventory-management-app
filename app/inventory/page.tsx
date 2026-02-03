import Sidebar from "@/components/sidebar";
import InventoryTable from "@/components/inventory-table";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";
import { InventorySkeleton } from "@/components/skeletons/inventory-skeleton";
import { CategoryFilter } from "@/components/CategoryFilter";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; categories?: string }>;
}) {
  const user = await getCurrentUser();
  const userId = user.id;

  const params = await searchParams;
  const v = (params.v ?? "").trim();
  
  const selectedCategories = params.categories ? params.categories.split(",") : [];

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  const rawProducts = await prisma.product.findMany({
    where: { 
      userId, 
      name: { contains: v, mode: "insensitive" },
      ...(selectedCategories.length > 0 && {
        categoryId: { in: selectedCategories }
      })
    },
    include: {
      category: true
    },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map((p) => ({
    ...p,
    price: p.price.toString(),
    categoryName: p.category?.name || "Uncategorized",
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
            <p className="text-sm text-gray-500">
              Manage your product stock levels and categories.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex gap-3">
              <SearchInput />
            </div>
            
            <hr className="border-gray-100" />
            
            <CategoryFilter categories={categories} />
          </div>

          <Suspense key={`${v}-${params.categories}`} fallback={<InventorySkeleton />}>
            <InventoryTable products={products} categories={categories} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}