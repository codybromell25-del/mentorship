"use client";

import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <SubmitButton className="btn btn-primary w-full" pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}
