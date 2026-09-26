import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and one-off links have no business in search results.
      disallow: ["/admin", "/mentor", "/dashboard", "/home", "/api", "/pay", "/set-password", "/login", "/forgot-password"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
