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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Sort by:</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-purple-300 hover:ring-4 hover:ring-purple-50 transition-all cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                  {cat._count.products} products
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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