"use client";

import { useActionState } from "react";
import { setPassword, type FormState } from "../../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(setPassword.bind(null, token), null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
        <p className="hint">At least 8 characters.</p>
      </div>
      <div>
        <label className="label" htmlFor="confirm">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="input" />
      </div>
      <SubmitButton className="btn btn-primary w-full">Save password</SubmitButton>
    </form>
  );
}
