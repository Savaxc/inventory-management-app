import Sidebar from "@/components/sidebar";
import { SubmitButton } from "@/components/submit-button";
import { ActionForm } from "@/components/action-form";
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
import {
  SKU_EXAMPLE,
  SKU_FORMAT_HINT,
  SKU_PATTERN_HTML,
  SKU_VALIDATION_MESSAGE,
} from "@/lib/sku";

export default async function AddProductPage() {
  const user = await getCurrentUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <Sidebar currentPath="/add-product" />

      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        <div className="mx-auto mb-6 max-w-3xl sm:mb-8">
          <Link
            href="/inventory"
            className="group mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Inventory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create New Product
          </h1>
          <p className="mt-1 text-gray-500">
            Fill in the details below to add a new item to your catalog.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <ActionForm action={createProduct} className="space-y-5 sm:space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                  General Information
                </h2>
              </div>

              <div className="space-y-6 p-5 sm:p-8">
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

                  <div className="flex min-w-0 gap-2">
                    <div className="relative min-w-0 flex-1">
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                  Inventory Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 md:grid-cols-2">
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
                      placeholder={SKU_EXAMPLE}
                      pattern={SKU_PATTERN_HTML}
                      title={SKU_VALIDATION_MESSAGE}
                      maxLength={8}
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Optional. Format: {SKU_EXAMPLE} ({SKU_FORMAT_HINT}).
                  </p>
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

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <Link
                href="/inventory"
                className="w-full rounded-xl border border-gray-200 bg-white px-8 py-3 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
              >
                Discard
              </Link>
              <SubmitButton text="Create Product" loadingText="Creating..." />
            </div>
          </ActionForm>
        </div>
      </main>
    </div>
  );
}