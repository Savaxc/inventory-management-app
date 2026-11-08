/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
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
  Tag,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { deleteProduct, deleteManyProducts } from "@/lib/actions/products";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductModal } from "./delete-product-modal";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { exportToCSV } from "@/lib/utils/export";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InventoryPDFReport } from "./inventory-pdf-report";
import { ImportCSVButton } from "./import-csv-button";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  quantity: number;
  lowStockAt: number | null;
  categoryName?: string;
}

export default function InventoryTable({
  products,
  categories,
}: {
  products: Product[];
  categories: any[];
}) {
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

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const firstPage = Math.max(
      1,
      Math.min(currentPage - 2, totalPages - 4),
    );
    return Array.from({ length: 5 }, (_, index) => firstPage + index);
  }, [currentPage, totalPages]);

  const getProductStatus = (product: Product) => {
    const qty = Number(product.quantity);
    const threshold = product.lowStockAt ?? 5;

    if (qty === 0) {
      return {
        label: "Out of Stock",
        css: "bg-red-50 text-red-700 border-red-100",
      };
    }

    if (qty <= threshold) {
      return {
        label: "Low Stock",
        css: "bg-yellow-50 text-yellow-700 border-yellow-100",
      };
    }

    return {
      label: "In Stock",
      css: "bg-green-50 text-green-700 border-green-100",
    };
  };

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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
        className={`items-center justify-between gap-3 rounded-lg border border-purple-100 bg-purple-50 p-3 ${
          selectedIds.length > 0 ? "flex" : "hidden"
        }`}
      >
        <span className="text-sm font-medium text-purple-700">
          {selectedIds.length} selected
        </span>
        <button
          onClick={openBulkDeleteModal}
          className="flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700 hover:cursor-pointer active:scale-95"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* CSV/PDF Buttons */}
      <div className="mb-3 flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ImportCSVButton />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            onClick={() => exportToCSV(products, "inventory-export")}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-purple-600" />
            Export CSV
          </button>

          <PDFDownloadLink
            document={<InventoryPDFReport products={products} />}
            fileName="inventory-report.pdf"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50"
          >
            {({ loading }) => (
              <>
                <FileText className="h-4 w-4 shrink-0 text-purple-600" />
                {loading ? "Preparing..." : "Download PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Mobile / tablet product cards */}
        <div className="divide-y divide-gray-100 xl:hidden">
          {paginatedProducts.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            const qty = Number(product.quantity);
            const threshold = product.lowStockAt ?? 5;
            const status = getProductStatus(product);

            return (
              <div
                key={product.id}
                className={`p-4 transition-colors ${
                  isSelected ? "bg-purple-50/40" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                            isSelected
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-semibold text-gray-900"
                            title={product.name}
                          >
                            {product.name}
                          </p>
                          <p
                            className="truncate font-mono text-[11px] text-gray-400"
                            title={product.sku || "No SKU"}
                          >
                            {product.sku || "No SKU"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${status.css}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2.5 text-xs">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Category
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate font-medium text-gray-700">
                          <Tag className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {product.categoryName || "General"}
                          </span>
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Price
                        </p>
                        <p className="mt-0.5 font-medium text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Stock
                        </p>
                        <p className="mt-0.5 font-medium text-gray-900">
                          {qty} units
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Low stock at
                        </p>
                        <p className="mt-0.5 font-medium text-gray-700">
                          {threshold} units
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:text-purple-600 hover:cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden xl:block">
        <table className="w-full border-collapse text-left text-sm table-fixed">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-4 w-[60px]">
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
              <th
                onClick={() => requestSort("name")}
                className="px-4 py-4 w-[20%] text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Product {getSortIcon("name")}
                </div>
              </th>
              <th
                onClick={() => requestSort("sku")}
                className="px-4 py-4 w-[12%] text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  SKU {getSortIcon("sku")}
                </div>
              </th>
              <th
                onClick={() => requestSort("categoryName")}
                className="px-4 py-4 w-[12%] text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Category {getSortIcon("categoryName")}
                </div>
              </th>
              <th
                onClick={() => requestSort("price")}
                className="px-4 py-4 w-[10%] text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Price {getSortIcon("price")}
                </div>
              </th>
              <th
                onClick={() => requestSort("quantity")}
                className="px-4 py-4 w-[10%] text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Stock {getSortIcon("quantity")}
                </div>
              </th>
              <th className="px-4 py-4 w-[13%] text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-4 w-[100px] text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const qty = Number(product.quantity);
              const threshold = product.lowStockAt ?? 5;
              const status = getProductStatus(product);

              return (
                <tr
                  key={product.id}
                  className={`transition-colors group ${isSelected ? "bg-purple-50/30" : "hover:bg-gray-50/50"}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center ${isSelected ? "text-purple-600 bg-purple-100" : "text-gray-400"}`}
                      >
                        <Package className="w-4 h-4" />
                      </div>
                      <span
                        className="font-semibold text-gray-900 truncate"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 font-mono truncate">
                    <span
                    className="text-gray-500 font-mono truncate"
                    title={product.sku || "N/A"}
                    >
                    {product.sku || "N/A"}

                    </span>
                    
                  </td>
                  <td className="px-4 py-4">
                    <div className="truncate">
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-700 border-none hover:bg-purple-100 flex items-center gap-1 w-fit font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">
                          {product.categoryName || "General"}
                        </span>
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900 font-medium truncate">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-gray-900">
                        {qty} units
                      </span>
                      <span className="truncate text-[10px] text-gray-400 uppercase tracking-tight">
                        Limit: {threshold}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${status.css}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Edit item"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors hover:cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete this item permanently"
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-xs text-gray-500 sm:text-left">
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
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="rounded-lg border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              <div className="hidden items-center gap-1 sm:flex">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-all hover:cursor-pointer ${
                      currentPage === page
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <span className="px-1 text-xs font-medium text-gray-500 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="rounded-lg border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
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
          categories={categories}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </div>
  );
}
