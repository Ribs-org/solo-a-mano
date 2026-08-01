import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import { deleteReview } from "@/actions/reviews";
import type { Review } from "@/lib/types";

export default async function ReviewSection({ artisanId, slug }: { artisanId: string; slug: string }) {
  const supabase = await createServerSupabase();
  const [{ data: { user } }, { data: reviews }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reviews").select("*, profiles(display_name, avatar_url)")
      .eq("artisan_id", artisanId).eq("hidden", false)
      .order("created_at", { ascending: false }).returns<Review[]>(),
  ]);
  const mine = user ? reviews?.find((r) => r.author_id === user.id) ?? null : null;
  const { data: isOwner } = user
    ? await supabase.from("artisans").select("id").eq("id", artisanId).eq("owner_id", user.id).maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-4">
      {!reviews?.length && <p className="text-cafe/60">Aún no hay reseñas. ¡Sé la primera persona en dejar una!</p>}
      {reviews?.map((r) => (
        <div key={r.id} className="rounded-2xl border border-beige bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{r.profiles?.display_name ?? "Alguien"}</p>
            <StarRating value={r.stars} />
          </div>
          {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
          {user?.id === r.author_id && (
            <form action={deleteReview.bind(null, artisanId, slug)}>
              <button className="mt-1 rounded px-1 py-1 text-xs text-terracota underline hover:text-cafe">Eliminar mi reseña</button>
            </form>
          )}
        </div>
      ))}
      {user && !isOwner && <ReviewForm artisanId={artisanId} slug={slug} existing={mine} />}
      {!user && (
        <p className="text-sm text-cafe/70">
          <Link href="/cuenta" className="underline hover:text-terracota">Inicia sesión</Link> para dejar tu reseña.
        </p>
      )}
    </div>
  );
}
