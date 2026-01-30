/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Package,
  ArrowUpDown,
  SearchX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { deleteProduct, deleteManyProducts } from "@/lib/actions/products";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductModal } from "./delete-product-modal";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  quantity: number;
  lowStockAt: number | null;
}

export default function InventoryTable({ products }: { products: Product[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc" | null;
  }>({ key: "name", direction: "asc" });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [prevProductsLength, setPrevProductsLength] = useState(products.length);

  if (products.length !== prevProductsLength) {
    setPrevProductsLength(products.length);
    setCurrentPage(1);
  }

  const sortedProducts = useMemo(() => {
    const sortableItems = [...products];
    if (sortConfig.key && sortConfig.direction) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aValue: any = a[key];
        let bValue: any = b[key];

        if (key === "price" || key === "quantity") {
          aValue = Number(aValue);
          bValue = Number(bValue);
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig]);

  const stats = useMemo(() => {
    return {
      total: sortedProducts.length,
      inStock: sortedProducts.filter((p) => p.quantity > (p.lowStockAt ?? 5))
        .length,
      lowStock: sortedProducts.filter(
        (p) => p.quantity <= (p.lowStockAt ?? 5) && p.quantity > 0,
      ).length,
      outOfStock: sortedProducts.filter((p) => p.quantity === 0).length,
    };
  }, [sortedProducts]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const requestSort = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return (
      <ArrowUpDown
        className={`w-3 h-3 ${sortConfig.direction === "asc" ? "text-purple-600" : "text-purple-900"}`}
      />
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const paginatedIds = paginatedProducts.map((p) => p.id);
    const allCurrentSelected = paginatedIds.every((id) =>
      selectedIds.includes(id),
    );

    if (allCurrentSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedIds])]);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <SearchX className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-1">
          Try different keywords.
        </p>
      </div>
    );
  }

  const handleConfirmDelete = async () => {
    try {
      if (isBulkDelete) {
        // Group deletion
        const deletePromise = deleteManyProducts(selectedIds);
        toast.promise(deletePromise, {
          loading: `Deleting ${selectedIds.length} products...`,
          success: "Products deleted successfully",
          error: "Failed to delete products",
        });
        await deletePromise;
        setSelectedIds([]);
      } else if (productToDelete) {
        // Individual deletion
        const formData = new FormData();
        formData.append("id", productToDelete.id);

        const deletePromise = deleteProduct(formData);
        toast.promise(deletePromise, {
          loading: `Deleting ${productToDelete.name}...`,
          success: "Product deleted successfully",
          error: "Failed to delete product",
        });
        await deletePromise;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBulkDelete(false);
      setProductToDelete(null);
    }
  };

  const openBulkDeleteModal = () => {
    setIsBulkDelete(true);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            Results
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {stats.total}
            </span>
            <span className="text-xs text-gray-400">Products</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1">
            In Stock
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xl font-bold text-gray-900">
              {stats.inStock}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-yellow-600 font-medium uppercase tracking-wider mb-1">
            Low Stock
          </p>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900">
              {stats.lowStock}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wider mb-1">
            Out of Stock
          </p>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xl font-bold text-gray-900">
              {stats.outOfStock}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div
        className={`flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-lg transition-all ${selectedIds.length > 0 ? "opacity-100 visible" : "opacity-0 invisible h-0"}`}
      >
        <span className="text-sm font-medium text-purple-700">
          {selectedIds.length} selected
        </span>
        <button
          onClick={openBulkDeleteModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 font-medium transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    paginatedProducts.length > 0 &&
                    paginatedProducts.every((p) => selectedIds.includes(p.id))
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </th>
              {(
                [
                  { label: "Product", key: "name" },
                  { label: "SKU", key: "sku" },
                  { label: "Price", key: "price" },
                  { label: "Stock", key: "quantity" },
                ] as const
              ).map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key as keyof Product)}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {col.label} {getSortIcon(col.key as keyof Product)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const qty = Number(product.quantity);
              const threshold = product.lowStockAt ?? 5;

              let status = {
                label: "In Stock",
                css: "bg-green-50 text-green-700 border-green-100",
              };
              if (qty === 0)
                status = {
                  label: "Out of Stock",
                  css: "bg-red-50 text-red-700 border-red-100",
                };
              else if (qty <= threshold)
                status = {
                  label: "Low Stock",
                  css: "bg-yellow-50 text-yellow-700 border-yellow-100",
                };

              return (
                <tr
                  key={product.id}
                  className={`transition-colors group ${isSelected ? "bg-purple-50/30" : "hover:bg-gray-50/50"}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded bg-gray-100 flex items-center justify-center ${isSelected ? "text-purple-600 bg-purple-100" : "text-gray-400"}`}
                      >
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono">
                    {product.sku || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {qty} units
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                        Limit: {threshold}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${status.css}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setProductToDelete(product);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {sortedProducts.length}
              </span>{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === i + 1
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        <DeleteProductModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setIsBulkDelete(false);
          }}
          onConfirm={handleConfirmDelete}
          productName={
            isBulkDelete
              ? `${selectedIds.length} selected products`
              : productToDelete?.name || ""
          }
        />

        <EditProductModal
          product={selectedProduct}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </div>
  );
}
