import { createServerSupabase } from "@/lib/supabase/server";
import ScheduleManager from "./ScheduleManager";
import type { MarketSchedule } from "@/lib/types";

export const metadata = { title: "Mis ubicaciones" };

export default async function UbicacionesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user!.id).maybeSingle();
  const { data: schedules } = artisan
    ? await supabase.from("market_schedules").select("*").eq("artisan_id", artisan.id).returns<MarketSchedule[]>()
    : { data: [] as MarketSchedule[] };
  return <ScheduleManager schedules={schedules ?? []} hasArtisan={!!artisan} />;
}
