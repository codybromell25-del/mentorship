import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 flex flex-col items-center gap-3 text-3xl font-light tracking-wide text-ink">
        <Image src="/images/balance-logo.jpg" alt="" width={56} height={56} className="rounded-full" />
        <span>
          balance <span className="text-muted">mentorship</span>
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
