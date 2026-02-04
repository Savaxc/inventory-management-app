import Sidebar from "@/components/sidebar";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Tag, Trash2 } from "lucide-react";
import { CreateCategoryModal } from "@/components/create-category-modal";
import { CategoryGrid } from "@/components/category-grid";

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const totalCategories = categories.length;
  const emptyCategories = categories.filter(
    (cat) => cat._count.products === 0,
  ).length;

  const mostUsed =
    categories.length > 0
      ? [...categories].sort((a, b) => b._count.products - a._count.products)[0]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPath="/categories" />
      <main className="flex-1 ml-64 p-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Categories
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and organize your product labels for better inventory
              tracking.
            </p>
          </div>
          <CreateCategoryModal />
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Categories
            </p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-3xl font-bold text-gray-900">
                {totalCategories}
              </p>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Tag className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Most Used
            </p>
            <div className="flex items-end justify-between mt-2">
              <div className="max-w-[70%]">
                <p className="text-xl font-bold text-gray-900 truncate">
                  {mostUsed ? mostUsed.name : "N/A"}
                </p>
                <p className="text-xs text-purple-600 font-medium mt-1">
                  {mostUsed
                    ? `${mostUsed._count.products} active products`
                    : "No products linked"}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Tag className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Empty Categories
            </p>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {emptyCategories}
                </p>
                <p className="text-xs text-gray-400 mt-1">Optimizable items</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Separation */}
        <div className="relative my-10">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-start">
            <span className="bg-gray-50 pr-4 text-sm font-medium text-gray-500 uppercase tracking-widest">
              All Categories
            </span>
          </div>
        </div>

        {/* Grid Categories */}
        <CategoryGrid initialCategories={categories} />
      </main>
    </div>
  );
}
