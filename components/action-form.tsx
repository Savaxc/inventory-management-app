"use client";

import {
  createContext,
  startTransition,
  useContext,
  useActionState,
  type FormEvent,
  type ReactNode,
} from "react";

export type FormState = { error?: string };

export type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;

const FormPendingContext = createContext<boolean | null>(null);

export function useActionFormPending() {
  return useContext(FormPendingContext);
}

interface ActionFormProps {
  action: FormAction;
  children: ReactNode;
  className?: string;
}

/**
 * Form wrapper for server actions that return `{ error }` instead of throwing.
 *
 * The action is dispatched from onSubmit rather than through the form `action`
 * prop so React does not reset all fields when the action returns an error.
 */
export function ActionForm({ action, children, className }: ActionFormProps) {
  const [state, dispatchAction, isPending] = useActionState(action, {});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      dispatchAction(formData);
    });
  }

  return (
    <FormPendingContext.Provider value={isPending}>
      <form onSubmit={handleSubmit} className={className}>
        {state.error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {state.error}
          </div>
        ) : null}
        {children}
      </form>
    </FormPendingContext.Provider>
  );
}
