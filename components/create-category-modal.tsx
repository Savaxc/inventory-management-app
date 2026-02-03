/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, Plus } from "lucide-react";
import { createCategory } from "@/lib/actions/categories";
import { toast } from "sonner";

interface CreateCategoryModalProps {
  isIconButton?: boolean;
}

export function CreateCategoryModal({ isIconButton }: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createCategory(name);
      toast.success("Category created!");
      setName("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isIconButton ? (
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-[52px] w-[52px] rounded-xl border-gray-200 bg-gray-50 hover:bg-gray-100 hover:text-purple-600 shrink-0 hover:cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2 hover:cursor-pointer">
            <PlusCircle className="w-4 h-4" /> New Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 py-4">
          <Input 
            placeholder="e.g. Electronics, Food..." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={loading} className="hover:cursor-pointer">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}