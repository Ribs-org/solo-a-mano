"use client";
import { useState, useTransition } from "react";
import { submitReview } from "@/actions/reviews";
import StarRating from "@/components/StarRating";
import type { Review } from "@/lib/types";

export default function ReviewForm({ artisanId, slug, existing }: { artisanId: string; slug: string; existing: Review | null }) {
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    start(async () => {
      setSaved(false);
      const res = await submitReview(formData);
      if (res.error) setError(res.error);
      else { setError(null); setSaved(true); }
    });
  }

  return (
    <form action={onSubmit} className="rounded-2xl border border-beige bg-white/60 p-4">
      <p className="mb-2 font-medium">{existing ? "Editar mi reseña" : "Deja tu reseña"}</p>
      <input type="hidden" name="artisan_id" value={artisanId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="stars" value={stars} />
      <StarRating value={stars} onChange={setStars} />
      <textarea name="comment" rows={3} defaultValue={existing?.comment}
        placeholder="¿Cómo fue tu experiencia con este artesano?"
        className="mt-2 w-full rounded-lg border border-beige bg-crema px-3 py-2" />
      {error && <p className="text-sm text-terracota">{error}</p>}
      {saved && <p className="text-sm text-verde">¡Gracias por tu reseña!</p>}
      <button disabled={pending || stars === 0}
        className="mt-2 rounded-full bg-terracota px-5 py-1.5 text-sm text-crema disabled:opacity-50">
        {pending ? "Enviando…" : "Publicar"}
      </button>
    </form>
  );
}
