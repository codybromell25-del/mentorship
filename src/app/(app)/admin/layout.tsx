import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["ADMIN"]);
  return (
    <AppShell
      area="Admin"
      userName={user.name}
      nav={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/applications", label: "Applications" },
        { href: "/admin/enrollments", label: "Enrollments" },
        { href: "/admin/cohorts", label: "Intakes" },
        { href: "/admin/mentors", label: "Mentors" },
      ]}
    >
      {children}
    </AppShell>
  );
}
