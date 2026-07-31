import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";

export const metadata = { title: "Entrar" };

export default async function CuentaPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/panel");
  return <AuthForm />;
}
