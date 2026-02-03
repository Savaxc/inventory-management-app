/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, Tag } from "lucide-react";
import { updateProduct } from "@/lib/actions/products";

export function EditProductModal({
  product,
  categories = [],
  open,
  onOpenChange,
}: {
  product: any;
  categories?: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    price: 0,
    quantity: 0,
    lowStockAt: 5,
    categoryId: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        price: Number(product.price),
        quantity: Number(product.quantity),
        lowStockAt: product.lowStockAt ?? 5,
        categoryId: product.categoryId ?? "",
      });
    }
  }, [product]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateProduct({
        id: product.id,
        ...formData,
      });

      if (!result.success) throw new Error();

      toast.success(`${product.name} updated successfully!`);
      onOpenChange(false);
      router.refresh(); 
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Product Details
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            <hr/><br/>
            <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-6">
          {/* Category Select Field */}
          <div className="grid gap-2">
            <Label
              htmlFor="category"
              className="font-bold text-xs uppercase tracking-wider text-gray-500"
            >
              Category
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full pl-10 pr-4 h-12 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-gray-900 font-medium transition-all hover:cursor-pointer"
              >
                <option value="">No Category (General)</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="price"
                className="font-bold text-xs uppercase tracking-wider text-gray-500"
              >
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 h-12 text-lg font-medium"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="quantity"
                className="font-bold text-xs uppercase tracking-wider text-gray-500"
              >
                Stock
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) })
                }
                className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 h-12 text-lg font-medium"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="lowStock"
              className="font-bold text-xs uppercase tracking-wider text-gray-500"
            >
              Low Stock Alert Threshold
            </Label>
            <Input
              id="lowStock"
              type="number"
              value={formData.lowStockAt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lowStockAt: parseInt(e.target.value),
                })
              }
              className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 h-12 text-lg font-medium"
            />
            <p className="text-[10px] text-gray-500 font-semibold italic">
              Status:{" "}
              <span
                className={
                  formData.quantity <= formData.lowStockAt
                    ? "text-red-500 font-bold"
                    : "text-green-500"
                }
              >
                {formData.quantity <= formData.lowStockAt
                  ? "Low Stock Triggered"
                  : "Healthy Stock"}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-purple-100 transition-all gap-2 hover:cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}