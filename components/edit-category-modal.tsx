/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { updateCategory } from "@/lib/actions/categories";
import { toast } from "sonner";

export function EditCategoryModal({ category }: { category: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateCategory(category.id, name);
    if (res.success) {
      toast.success("Category updated");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
          <Pencil className="w-4 h-4 hover:cursor-pointer" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Category name"
            required
          />
          <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 hover:cursor-pointer">
            Save Changes
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}