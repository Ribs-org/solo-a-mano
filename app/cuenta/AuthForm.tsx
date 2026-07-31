"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function withGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/cuenta/callback` },
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "registro") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError("No pudimos crear tu cuenta: " + error.message);
      else setNotice("Revisa tu correo para confirmar tu cuenta.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
      else location.href = "/panel";
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl border border-beige bg-white/60 p-6">
      <h1 className="font-display text-2xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <button onClick={withGoogle} className="mt-4 w-full rounded-full border border-cafe py-2 hover:bg-beige">
        Continuar con Google
      </button>
      <div className="my-4 text-center text-xs text-cafe/60">o con tu correo</div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === "registro" && (
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
            className="rounded-lg border border-beige bg-crema px-3 py-2" />
        )}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo"
          className="rounded-lg border border-beige bg-crema px-3 py-2" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mínimo 8)" className="rounded-lg border border-beige bg-crema px-3 py-2" />
        {error && <p className="text-sm text-terracota">{error}</p>}
        {notice && <p className="text-sm text-verde">{notice}</p>}
        <button disabled={loading} className="rounded-full bg-terracota py-2 text-crema hover:bg-cafe disabled:opacity-50">
          {mode === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "registro" : "login")}
        className="mt-4 w-full text-center text-sm underline">
        {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}
      </button>
    </div>
  );
}
