export function isUrl(s: string | null | undefined): s is string {
  return !!s && /^https?:\/\//.test(s);
}

export function joinLabel(link: string): string {
  if (/meet\.google\.com/.test(link)) return "Join Google Meet";
  if (/zoom\.us/.test(link)) return "Join Zoom";
  return "Join video call";
}
