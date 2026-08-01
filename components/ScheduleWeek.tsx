import { dayLabel } from "@/lib/constants";
import type { MarketSchedule } from "@/lib/types";

export default function ScheduleWeek({ schedules }: { schedules: MarketSchedule[] }) {
  if (!schedules.length) return <p className="text-sm text-cafe/60">Sin ubicaciones frecuentes por ahora.</p>;
  const sorted = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week);
  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((s) => (
        <li key={s.id} className="flex flex-wrap items-baseline gap-x-2 rounded-lg bg-white/60 px-3 py-2">
          <span className="font-medium text-terracota">{dayLabel(s.day_of_week)}</span>
          <span>→ {s.place_name}</span>
          {s.comuna && <span className="text-sm text-cafe/70">({s.comuna})</span>}
          {s.time_range && <span className="text-sm text-cafe/70">· {s.time_range}</span>}
          {s.notes && <span className="w-full text-xs text-cafe/60">{s.notes}</span>}
        </li>
      ))}
    </ul>
  );
}
