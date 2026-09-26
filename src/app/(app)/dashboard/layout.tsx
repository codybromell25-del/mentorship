import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function MenteeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell
      area="Mentee"
      userName={user.name}
      nav={[
        { href: "/dashboard", label: "Overview" },
        { href: "/dashboard/sessions", label: "Video calls" },
      ]}
    >
      {children}
    </AppShell>
  );
}
