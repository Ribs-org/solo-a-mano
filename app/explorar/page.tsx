import { fetchProducts } from "@/actions/explore";
import { CATEGORIES } from "@/lib/constants";
import ExploreGrid from "./ExploreGrid";

export const metadata = { title: "Explorar" };

type Params = { q?: string; categoria?: string; comuna?: string; verificados?: string };

export default async function ExplorarPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const filters = {
    q: params.q || undefined,
    category: params.categoria || undefined,
    comuna: params.comuna || undefined,
    verifiedOnly: params.verificados === "1",
  };
  const initial = await fetchProducts({ ...filters, page: 0 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl">Explorar</h1>
      <form className="mb-6 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={params.q} placeholder="Buscar…"
          className="w-full rounded-full border border-beige bg-white/70 px-4 py-1.5 text-sm sm:w-56" />
        <select name="categoria" defaultValue={params.categoria ?? ""}
          className="w-full rounded-full border border-beige bg-white/70 px-3 py-1.5 text-sm sm:w-auto">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input name="comuna" defaultValue={params.comuna} placeholder="Comuna"
          className="w-full rounded-full border border-beige bg-white/70 px-4 py-1.5 text-sm sm:w-40" />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="verificados" value="1" defaultChecked={params.verificados === "1"} />
          Solo con sello
        </label>
        <button className="rounded-full bg-terracota px-4 py-1.5 text-sm text-crema hover:bg-cafe">Filtrar</button>
      </form>
      <ExploreGrid key={JSON.stringify(filters)} initial={initial} filters={filters} />
    </div>
  );
}
