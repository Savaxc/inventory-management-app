/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function CategoryFilter({ categories }: { categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategories = searchParams.get("categories")?.split(",") || [];

  const toggleCategory = (id: string) => {
    let newFilters = [...activeCategories];
    if (newFilters.includes(id)) {
      newFilters = newFilters.filter((f) => f !== id);
    } else {
      newFilters.push(id);
    }

    const params = new URLSearchParams(searchParams);
    if (newFilters.length > 0) {
      params.set("categories", newFilters.join(","));
    } else {
      params.delete("categories");
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={activeCategories.length === 0 ? "default" : "outline"}
        className="cursor-pointer px-4 py-1 rounded-full text-sm hover:bg-purple-300"
        onClick={() => router.push("?")}
      >
        All Categories
      </Badge>
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={activeCategories.includes(cat.id) ? "default" : "outline"}
          className={`cursor-pointer px-4 py-1 rounded-full transition-all hover:bg-purple-100 ${
            activeCategories.includes(cat.id) ? "bg-purple-600" : ""
          }`}
          onClick={() => toggleCategory(cat.id)}
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  );
}