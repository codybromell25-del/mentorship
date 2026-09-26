import Link from "next/link";
import { findValidAuthToken } from "@/lib/tokens";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata = { title: "Set your password", robots: { index: false } };

export default async function SetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await findValidAuthToken(token);

  if (!row) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-2xl text-ink">Link expired</h1>
        <p className="text-sm text-muted">This link has expired or was already used.</p>
        <Link href="/forgot-password" className="btn btn-primary mt-6">Get a new link</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="mb-2 text-2xl text-ink">
        {row.purpose === "ACCOUNT_SETUP" ? `Welcome, ${row.user.name.split(" ")[0]}` : "Choose a new password"}
      </h1>
      <p className="mb-6 text-sm text-muted">Signing in as {row.user.email}</p>
      <SetPasswordForm token={token} />
    </div>
  );
}
