import Sidebar from "@/components/sidebar";
import { SubmitButton } from "@/components/submit-button";
import { createProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth"; 
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Package,
  DollarSign,
  Hash,
  AlertCircle,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { CreateCategoryModal } from "@/components/create-category-modal";

export default async function AddProductPage() {
  const user = await getCurrentUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <Sidebar currentPath="/add-product" />

      <main className="flex-1 ml-64 p-10">
        <div className="max-w-3xl mx-auto mb-8">
          <Link
            href="/inventory"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create New Product
          </h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to add a new item to your catalog.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <form action={createProduct} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  General Information
                </h2>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Wireless Headphones"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Category Section */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Category
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="categoryId"
                        name="categoryId"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none appearance-none hover:cursor-pointer"
                      >
                        <option value="">No Category (General)</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <CreateCategoryModal isIconButton={true} />
                  </div>

                  <p className="mt-2 text-[11px] text-gray-400">
                    Organize your items for easier filtering.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Initial Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="0"
                      required
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Settings Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Inventory Settings
                </h2>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    SKU / Barcode
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      placeholder="SKU-001"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lowStockAt"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Low Stock Alert Limit
                  </label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="lowStockAt"
                      name="lowStockAt"
                      min="0"
                      placeholder="Default is 5"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400 italic">{`We'll notify you when stock falls below this level.`}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                href="/inventory"
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Discard
              </Link>
              <SubmitButton text="Create Product" loadingText="Creating..." />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}