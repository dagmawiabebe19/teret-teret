import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://teretstories.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
