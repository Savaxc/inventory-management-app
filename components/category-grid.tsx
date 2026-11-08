/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, Tag } from "lucide-react";
import { EditCategoryModal } from "./edit-category-modal";
import { DeleteCategoryModal } from "./delete-category-modal";

export function CategoryGrid({ initialCategories }: { initialCategories: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "products">("name");

  const filteredCategories = initialCategories
    .filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "products") return b._count.products - a._count.products;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Search and Sort */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <span className="mr-2 text-xs font-medium uppercase tracking-wider text-gray-500">Sort by:</span>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:cursor-pointer ${
              sortBy === "name" ? "bg-purple-100 text-purple-700" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            A-Z
          </button>
          <button
            onClick={() => setSortBy("products")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:cursor-pointer ${
              sortBy === "products" ? "bg-purple-100 text-purple-700" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Usage
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:ring-4 hover:ring-purple-50 sm:p-5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-bold text-gray-900 transition-colors group-hover:text-purple-700">
                  {cat.name}
                </h3>
                <p className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {cat._count.products} products
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 items-center gap-1 opacity-100 transition-all sm:opacity-0 sm:group-hover:opacity-100">
              <EditCategoryModal category={cat} />
              <DeleteCategoryModal id={cat.id} name={cat.name} />
            </div>
          </div>
        ))}

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No categories match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}