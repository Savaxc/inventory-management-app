/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef, useState } from "react";
import { FileUp, HelpCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { importProducts } from "@/lib/actions/products";
import { SKU_EXAMPLE } from "@/lib/sku";

export function ImportCSVButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const products = results.data;

        if (products.length === 0) {
          toast.error("The CSV file is empty.");
          setIsUploading(false);
          return;
        }

        const res = await importProducts(products);

        if (res.success) {
          toast.success(`Successfully imported ${res.count} products!`);
        } else {
          toast.error(
            res.error ?? "Failed to import products. Check CSV format."
          );
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.error("Error reading CSV file.");
        setIsUploading(false);
      },
    });
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Product Name": "Example Product",
        "SKU": SKU_EXAMPLE,
        "Category": "Electronics",
        "Price": "99.99",
        "Stock Quantity": "10",
        "Total Value": "999.90",
        "Status": "In Stock"
      },
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />

      <button 
        title="Download CSV Template"
        onClick={downloadTemplate}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-yellow-50 hover:cursor-pointer disabled:opacity-50 sm:w-auto"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-yellow-600" />
        Download Sample CSV
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:cursor-pointer disabled:opacity-50 sm:w-auto"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileUp className="w-4 h-4 text-purple-600" />
        )}
        Import CSV
      </button> 
    </div>
  );
}
