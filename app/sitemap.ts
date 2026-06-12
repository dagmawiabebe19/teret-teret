import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://teretstories.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: APP_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/faq`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/account`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
