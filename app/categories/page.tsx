import Sidebar from "@/components/sidebar";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Tag, Trash2 } from "lucide-react";
import { CreateCategoryModal } from "@/components/create-category-modal";

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPath="/categories" />
      <main className="flex-1 ml-64 p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500">Manage your product organization labels.</p>
          </div>
          <CreateCategoryModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-500">{cat._count.products} products</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4 hover:cursor-pointer" />
              </button>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{`You haven't created any categories yet.`}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}