import type { MetadataRoute } from "next";
import { toolSlugs } from "@quickconvert/shared";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/pricing", "/login", "/dashboard", "/faq", "/guides"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date()
    })),
    ...toolSlugs.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date()
    }))
  ];
}
