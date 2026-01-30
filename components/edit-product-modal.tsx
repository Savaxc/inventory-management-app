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
import { Loader2, Save } from "lucide-react";

export function EditProductModal({
  product,
  open,
  onOpenChange,
}: {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    price: 0,
    quantity: 0,
    lowStockAt: 5,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        price: Number(product.price),
        quantity: Number(product.quantity),
        lowStockAt: product.lowStockAt ?? 5,
      });
    }
  }, [product]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success(`${product.name} updated successfully!`);
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Stock Settings
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Modify price and inventory levels for{" "}
            <strong>{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
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
              Quantity In Stock
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
              Current status:{" "}
              <span
                className={
                  formData.quantity <= formData.lowStockAt
                    ? "text-yellow-400 animate-pulse font-bold text-[12px]"
                    : "text-green-400 text-[12px]"
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-purple-100 transition-all gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
