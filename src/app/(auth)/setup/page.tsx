import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SetupForm } from "./SetupForm";

export const metadata = { title: "Set up", robots: { index: false } };
export const dynamic = "force-dynamic";

/** One-time first-admin setup. The proxy hides it until accounts are configured. */
export default async function SetupPage() {
  if (!process.env.SETUP_CODE) {
    return (
      <div className="card">
        <h1 className="mb-2 text-2xl text-ink">Setup is switched off</h1>
        <p className="text-sm text-muted">
          Add a <code>SETUP_CODE</code> environment variable in Vercel and redeploy to create the first admin account.
        </p>
      </div>
    );
  }
  if ((await prisma.user.count({ where: { role: "ADMIN" } })) > 0) redirect("/login");

  return (
    <div className="card">
      <h1 className="mb-2 text-2xl text-ink">Create your admin account</h1>
      <p className="mb-6 text-sm text-muted">This page works once. After the first admin exists, it switches itself off.</p>
      <SetupForm />
    </div>
  );
}
