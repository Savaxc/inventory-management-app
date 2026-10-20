"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useActionFormPending } from "./action-form";

interface SubmitButtonProps {
  text: string;
  loadingText: string;
}

export function SubmitButton({ text, loadingText }: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const actionPending = useActionFormPending();
  const pending = actionPending ?? formPending;

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
}