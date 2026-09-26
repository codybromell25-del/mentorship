import { site } from "@/lib/site";

export function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wraps email body HTML in the shared shell. `paragraphs` are escaped;
 * pass a `cta` to render a button.
 */
export function renderEmail(args: {
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footer?: string;
}): string {
  const { heading, paragraphs, cta, footer } = args;
  const p = (t: string) =>
    `<p style="margin:0 0 16px;font-size:15px;color:#4A4A4A;line-height:1.6;">${escape(t)}</p>`;
  return `<!doctype html>
<html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8F6F1;color:#1e1a1a;">
  <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #E5E1D8;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#1E4D4A;">${escape(site.name)}</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:300;color:#1e1a1a;">${escape(heading)}</h1>
    ${paragraphs.map(p).join("\n    ")}
    ${
      cta
        ? `<a href="${escape(cta.url)}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#1e1a1a;color:#ffffff;text-decoration:none;border-radius:999px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">${escape(cta.label)}</a>`
        : ""
    }
    ${footer ? `<p style="margin:24px 0 0;font-size:13px;color:#777777;line-height:1.6;">${escape(footer)}</p>` : ""}
  </div>
</body></html>`;
}
