"use client";

import { useActionState } from "react";
import { createFirstAdmin } from "./actions";
import type { FormState } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function SetupForm() {
  const [state, action] = useActionState<FormState, FormData>(createFirstAdmin, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="code">Setup code</label>
        <input id="code" name="code" type="password" required autoComplete="off" className="input" />
        <p className="hint">The SETUP_CODE value from your Vercel environment variables.</p>
      </div>
      <div>
        <label className="label" htmlFor="name">Your name</label>
        <input id="name" name="name" required autoComplete="name" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="input" />
        <p className="hint">At least 10 characters.</p>
      </div>
      <SubmitButton className="btn btn-primary w-full" pendingText="Creating…">Create admin account</SubmitButton>
    </form>
  );
}
