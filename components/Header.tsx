import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export default async function Header() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sólo A Mano" width={44} height={44} className="rounded-full" />
          <span className="font-display text-xl font-semibold text-cafe">Sólo A Mano</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Link href="/explorar" className="rounded px-1 py-2 hover:text-terracota">Explorar</Link>
          <Link href="/verificacion" className="rounded px-1 py-2 hover:text-terracota">El sello</Link>
          {user ? (
            <>
              <Link href="/panel" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
                Mi panel
              </Link>
              <form action={signOut}>
                <button className="rounded px-1 py-2 hover:text-terracota">Salir</button>
              </form>
            </>
          ) : (
            <Link href="/cuenta" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
