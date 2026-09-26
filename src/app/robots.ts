import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";
import { indexingAllowed } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  // Until ALLOW_INDEXING=true, keep the whole site out of search engines
  // (draft copy under review).
  if (!indexingAllowed()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and one-off links have no business in search results.
      disallow: ["/admin", "/mentor", "/dashboard", "/home", "/api", "/pay", "/set-password", "/login", "/forgot-password", "/setup", "/unavailable"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
