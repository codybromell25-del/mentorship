import { software } from "@/lib/software";
import { EnquiryForm } from "./EnquiryForm";

export const metadata = { title: "balanceHQ studio software" };

export default async function BalanceHQPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow mb-3">balanceHQ · sold separately</p>
      <h1 className="text-4xl text-ink">Run your studio on the tools that run balance</h1>
      <p className="mt-4 mb-10 leading-relaxed text-muted">
        Tell us about your studio and which tools you&apos;d like. We&apos;ll be in touch with pricing and a demo. You
        don&apos;t need to be on the mentorship programme.
      </p>
      <EnquiryForm tools={software.map(({ key, name, status }) => ({ key, name, status }))} preselect={tool} />
    </div>
  );
}
