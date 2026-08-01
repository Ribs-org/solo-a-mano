import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScheduleWeek from "@/components/ScheduleWeek";
import type { MarketSchedule } from "@/lib/types";

const base = { id: "1", artisan_id: "a", comuna: "", time_range: "", notes: "" };

describe("ScheduleWeek", () => {
  it("ordena por día de la semana", () => {
    const schedules: MarketSchedule[] = [
      { ...base, id: "1", day_of_week: 6, place_name: "Feria del Parque" },
      { ...base, id: "2", day_of_week: 2, place_name: "Plaza Ñuñoa" },
    ];
    render(<ScheduleWeek schedules={schedules} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].textContent).toContain("Martes");
    expect(items[1].textContent).toContain("Sábado");
  });
  it("mensaje vacío cuando no hay ubicaciones", () => {
    render(<ScheduleWeek schedules={[]} />);
    expect(screen.getByText(/sin ubicaciones/i)).toBeDefined();
  });
});
