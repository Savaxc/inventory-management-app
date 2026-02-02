"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [value, setValue] = useState(searchParams.get("v") ?? "");
  const [isPending, setIsPending] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPending(true);

    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("v", value);
    } else {
      params.delete("v");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    setTimeout(() => setIsPending(false), 300);
  };

  const handleClear = () => {
    setValue("");
    router.push(pathname);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by product name..."
          className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm outline-none"
        />
        {value && !isPending && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 hover:cursor-pointer" />
          </button>
        )}
        {isPending && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 animate-spin" />
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium text-sm shadow-sm active:scale-95 disabled:opacity-70 hover:cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}