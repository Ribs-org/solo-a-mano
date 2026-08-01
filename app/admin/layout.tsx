import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");
  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
