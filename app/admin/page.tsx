import { createServiceSupabase } from "@/lib/supabase/server";
import { signedVerificationUrl, toggleReviewHidden } from "@/actions/admin";
import RequestCard from "./RequestCard";
import type { Review, VerificationRequest } from "@/lib/types";

type RequestWithArtisan = VerificationRequest & { artisans: { shop_name: string; slug: string } };
type ReviewWithNames = Review & { profiles: { display_name: string }; artisans: { shop_name: string } };

export default async function AdminPage() {
  // El layout ya validó el rol; usamos service client para ver todo.
  const service = createServiceSupabase();
  const [{ data: requests }, { data: reviews }] = await Promise.all([
    service.from("verification_requests")
      .select("*, artisans(shop_name, slug)").eq("status", "pendiente")
      .order("created_at").returns<RequestWithArtisan[]>(),
    service.from("reviews")
      .select("*, profiles(display_name), artisans(shop_name)")
      .order("created_at", { ascending: false }).limit(50).returns<ReviewWithNames[]>(),
  ]);

  const requestsWithUrls = await Promise.all(
    (requests ?? []).map(async (r) => ({
      request: r,
      stallUrl: await signedVerificationUrl(r.stall_photo_path),
      makingUrl: await signedVerificationUrl(r.making_photo_path),
      videoUrl: r.video_path ? await signedVerificationUrl(r.video_path) : r.video_url,
    }))
  );

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 font-display text-3xl">Solicitudes de verificación</h1>
        {!requestsWithUrls.length && <p className="text-cafe/60">No hay solicitudes pendientes. 🎉</p>}
        <div className="flex flex-col gap-4">
          {requestsWithUrls.map(({ request, stallUrl, makingUrl, videoUrl }) => (
            <RequestCard key={request.id} request={request} stallUrl={stallUrl} makingUrl={makingUrl} videoUrl={videoUrl} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Últimas reseñas</h2>
        <div className="flex flex-col gap-2">
          {reviews?.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewRow({ review }: { review: ReviewWithNames }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-beige bg-white/60 px-3 py-2 text-sm">
      <p className={review.hidden ? "line-through opacity-50" : ""}>
        <strong>{review.profiles.display_name}</strong> → {review.artisans.shop_name}: ★{review.stars} "{review.comment}"
      </p>
      <form action={toggleReviewHidden.bind(null, review.id, !review.hidden)}>
        <button className="rounded px-1 py-1 text-terracota underline hover:text-cafe">{review.hidden ? "Mostrar" : "Ocultar"}</button>
      </form>
    </div>
  );
}
