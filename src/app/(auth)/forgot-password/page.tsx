import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="card">
      <h1 className="mb-2 text-2xl text-ink">Reset your password</h1>
      <p className="mb-6 text-sm text-muted">We&apos;ll email you a link to choose a new one.</p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-muted underline hover:text-ink">Back to sign in</Link>
      </p>
    </div>
  );
}
