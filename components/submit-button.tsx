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
      className="flex min-w-0 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition-all hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[140px]"
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