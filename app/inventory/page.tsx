import Sidebar from "@/components/sidebar";
import InventoryTable from "@/components/inventory-table";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";
import { InventoryTableSkeleton } from "@/components/skeletons/inventory-skeleton";
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
      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Inventory
            </h1>
            <p className="text-sm text-gray-500">
              Manage your product stock levels and categories.
            </p>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex gap-3">
              <SearchInput />
            </div>
            
            <hr className="border-gray-100" />
            
            <CategoryFilter categories={categories} />
          </div>

          <Suspense key={`${v}-${params.categories}`} fallback={<InventoryTableSkeleton />}>
            <InventoryTable products={products} categories={categories} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}