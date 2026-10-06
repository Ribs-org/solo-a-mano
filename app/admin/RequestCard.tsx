"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { approveRequest, rejectRequest } from "@/actions/admin";
import type { VerificationRequest } from "@/lib/types";

type Props = {
  request: VerificationRequest & { artisans: { shop_name: string; slug: string } };
  stallUrl: string | null;
  makingUrl: string | null;
  videoUrl: string | null;
};

export default function RequestCard({ request, stallUrl, makingUrl, videoUrl }: Props) {
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl border border-sage/50 bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          {request.artisans.shop_name}{" "}
          <Link href={`/artesano/${request.artisans.slug}`} className="rounded px-1 py-1 text-sm underline hover:bg-lime" target="_blank">ver perfil</Link>
        </p>
        <p className="text-xs text-ink/60">{new Date(request.created_at).toLocaleDateString("es-CL")}</p>
      </div>
      {request.message && <p className="mt-2 text-sm">"{request.message}"</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {stallUrl && <a href={stallUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stallUrl} alt="Foto del puesto" className="h-40 rounded-lg object-cover" /></a>}
        {makingUrl && <a href={makingUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={makingUrl} alt="Haciendo el producto" className="h-40 rounded-lg object-cover" /></a>}
      </div>
      {videoUrl && <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline hover:bg-lime">Ver video</a>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button disabled={pending} onClick={() => start(() => approveRequest(request.id))}
          className="rounded-full bg-fern px-5 py-1.5 text-sm text-bone hover:opacity-90 disabled:opacity-50">Aprobar sello</button>
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Motivo del rechazo"
          className="rounded-lg border border-sage/50 bg-paper px-3 py-1.5 text-sm" />
        <button disabled={pending || !comment.trim()} onClick={() => start(() => rejectRequest(request.id, comment.trim()))}
          className="rounded-full border border-copihue px-5 py-1.5 text-sm text-ink hover:bg-copihue hover:text-paper disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink">Rechazar</button>
      </div>
    </div>
  );
}
