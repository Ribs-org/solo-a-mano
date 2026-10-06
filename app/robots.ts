import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Solo producción se indexa; dev y los previews de Vercel quedan fuera de Google.
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/admin", "/cuenta"] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
