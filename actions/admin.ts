"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

async function requireAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

export async function approveRequest(id: string): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("verification_requests")
    .update({ status: "aprobada", reviewed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
}

export async function rejectRequest(id: string, comment: string): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("verification_requests")
    .update({ status: "rechazada", admin_comment: comment, reviewed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
}

export async function toggleReviewHidden(id: string, hidden: boolean): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("reviews").update({ hidden }).eq("id", id);
  revalidatePath("/admin");
}

export async function signedVerificationUrl(path: string): Promise<string | null> {
  if (!(await requireAdmin())) return null;
  const service = createServiceSupabase();
  const { data } = await service.storage.from("verification").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
