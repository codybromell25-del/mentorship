"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export type ActionState = { error?: string; ok?: string } | null;

/**
 * Form wrapper for server actions shaped (prev, formData) => ActionState.
 * Shows the error/ok message and, with resetOnSuccess, clears the fields.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  submitClassName,
  pendingText,
  resetOnSuccess = false,
  className = "space-y-4",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
  submitClassName?: string;
  pendingText?: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      <FormMessage state={state} />
      {children}
      <SubmitButton className={submitClassName} pendingText={pendingText}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
