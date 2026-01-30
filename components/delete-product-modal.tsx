"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2, Trash2, AlertCircle } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteProductModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[380px] rounded-3xl p-6 border-none shadow-2xl">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
          </div>

          <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center">
            Delete Product?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-gray-500 text-sm leading-relaxed">
            {productName.includes("selected products") ? (
              <>
                {`You're about to remove`}{" "}
                <span className="font-semibold text-gray-900">
                  {productName}
                </span>
                .
              </>
            ) : (
              <>
                {`You're about to remove`}{" "}
                <span className="font-semibold text-gray-900">
                  {productName}
                </span>
                .
              </>
            )}{" "}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-6">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold shadow-md shadow-red-100 transition-all order-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Confirm Delete
          </AlertDialogAction>

          <AlertDialogCancel className="w-full border-none hover:bg-gray-100 text-gray-500 font-medium h-12 rounded-xl transition-colors order-2">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
