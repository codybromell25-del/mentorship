import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="text-3xl text-ink">Page not found</h1>
      <Link href="/" className="btn btn-ghost mt-6">Go home</Link>
    </div>
  );
}
