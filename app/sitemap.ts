import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createServerSupabase();
  const { data: artisans } = await supabase.from("artisans").select("slug");
  return [
    { url: site, priority: 1 },
    { url: `${site}/explorar`, priority: 0.9 },
    { url: `${site}/verificacion`, priority: 0.5 },
    ...(artisans ?? []).map((a) => ({ url: `${site}/artesano/${a.slug}`, priority: 0.8 })),
  ];
}
