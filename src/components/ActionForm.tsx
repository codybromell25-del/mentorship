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
  const submitted = useRef<FormData | null>(null);

  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    if (resetOnSuccess && state?.ok) form.reset();
    // React resets uncontrolled forms after every action; on an error,
    // put back what the user typed so they only have to fix one field.
    if (state?.error && submitted.current) {
      for (const [name, value] of submitted.current) {
        const el = form.elements.namedItem(name);
        if (typeof value === "string" && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) && el.type !== "hidden") {
          el.value = value;
        }
      }
    }
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      action={(fd) => {
        submitted.current = fd;
        formAction(fd);
      }}
      className={className}
    >
      <FormMessage state={state} />
      {children}
      <SubmitButton className={submitClassName} pendingText={pendingText}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
