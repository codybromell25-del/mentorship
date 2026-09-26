import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const pages: [string, number][] = [
    ["/", 1],
    ["/instructors", 0.9],
    ["/balancehq", 0.8],
    ["/studio-health-check", 0.7],
    ["/teaching-confidence-check", 0.7],
    ["/apply", 0.6],
  ];
  return pages.map(([path, priority]) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority }));
}
