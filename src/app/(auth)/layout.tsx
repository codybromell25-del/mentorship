import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 font-heading text-3xl text-ink">{site.name}</Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
