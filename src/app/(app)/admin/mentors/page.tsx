import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { createMentor, updateMentorProfile } from "../actions";

export const metadata = { title: "Mentors" };

export default async function MentorsPage() {
  const mentors = await prisma.user.findMany({
    where: { role: "MENTOR" },
    orderBy: { name: "asc" },
    include: { _count: { select: { mentoring: { where: { status: "ACTIVE" } } } } },
  });

  return (
    <>
      <PageHeader eyebrow="Admin" title="Mentors" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {mentors.length === 0 ? (
            <EmptyState title="No mentors yet">Add your first mentor — they&apos;ll get an email to set a password.</EmptyState>
          ) : (
            <div className="space-y-4">
              {mentors.map((m) => (
                <div key={m.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl text-ink">{m.name}</h2>
                      <p className="text-sm text-muted">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.passwordHash && <Badge tone="warning">Invite pending</Badge>}
                      <Badge tone="accent">{m._count.mentoring} active mentees</Badge>
                    </div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-muted hover:text-ink">Edit profile shown to mentees</summary>
                    <ActionForm action={updateMentorProfile.bind(null, m.id)} submitLabel="Save profile" submitClassName="btn btn-primary btn-sm" className="mt-3 space-y-3">
                      <input name="headline" defaultValue={m.headline ?? ""} placeholder="Headline" className="input" />
                      <textarea name="bio" rows={4} defaultValue={m.bio ?? ""} placeholder="Short bio" className="input" />
                    </ActionForm>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="card h-fit">
          <h2 className="mb-5 text-xl text-ink">Add a mentor</h2>
          <ActionForm action={createMentor} submitLabel="Add & send invite" resetOnSuccess>
            <div>
              <label className="label" htmlFor="m-name">Name</label>
              <input id="m-name" name="name" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="m-email">Email</label>
              <input id="m-email" name="email" type="email" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="m-headline">Headline</label>
              <input id="m-headline" name="headline" placeholder="e.g. Engineering manager, 12 years in fintech" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="m-bio">Bio</label>
              <textarea id="m-bio" name="bio" rows={4} className="input" />
            </div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
