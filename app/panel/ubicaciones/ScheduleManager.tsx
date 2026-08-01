"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { addSchedule, deleteSchedule } from "@/actions/schedules";
import { DAYS } from "@/lib/constants";
import ScheduleWeek from "@/components/ScheduleWeek";
import type { MarketSchedule } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ScheduleManager({ schedules, hasArtisan }: { schedules: MarketSchedule[]; hasArtisan: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!hasArtisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await addSchedule(formData);
      if (res.error) setError(res.error);
      else { setError(null); formRef.current?.reset(); }
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Mi semana de ferias</h1>
        <p className="text-sm text-cafe/70">Cuéntale a tus clientes dónde encontrarte cada semana.</p>
      </div>
      <div className="flex flex-col gap-2">
        <ScheduleWeek schedules={schedules} />
        {schedules.map((s) => (
          <form key={s.id} action={() => start(() => deleteSchedule(s.id))}>
            <button className="text-xs text-terracota underline">Quitar {s.place_name}</button>
          </form>
        ))}
      </div>
      <form ref={formRef} action={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-beige bg-white/60 p-4">
        <h2 className="font-medium">Agregar ubicación</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Día
            <select name="day_of_week" className={input}>
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Lugar *
            <input name="place_name" required placeholder="Plaza Ñuñoa" className={input} />
          </label>
          <label className="text-sm">Comuna
            <input name="comuna" placeholder="Ñuñoa" className={input} />
          </label>
          <label className="text-sm">Horario
            <input name="time_range" placeholder="10:00–14:00" className={input} />
          </label>
        </div>
        <label className="text-sm">Notas
          <input name="notes" placeholder="Solo la feria navideña de diciembre" className={input} />
        </label>
        {error && <p className="text-sm text-terracota">{error}</p>}
        <button disabled={pending} className="w-fit rounded-full bg-terracota px-5 py-1.5 text-sm text-crema disabled:opacity-50">
          Agregar
        </button>
      </form>
    </div>
  );
}
