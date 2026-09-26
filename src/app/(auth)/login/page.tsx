import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; password?: string }> }) {
  const { next, password } = await searchParams;
  return (
    <div className="card">
      <h1 className="mb-6 text-2xl text-ink">Sign in</h1>
      {password === "set" && (
        <p className="mb-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">Password saved. Sign in to continue.</p>
      )}
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm">
        <Link href="/forgot-password" className="text-muted underline hover:text-ink">Forgot your password?</Link>
      </p>
    </div>
  );
}
