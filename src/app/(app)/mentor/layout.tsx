import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["MENTOR", "ADMIN"]);
  const nav = [{ href: "/mentor", label: "My mentees" }];
  if (user.role === "ADMIN") nav.push({ href: "/admin", label: "Admin" });
  return (
    <AppShell area="Mentor" userName={user.name} nav={nav}>
      {children}
    </AppShell>
  );
}
