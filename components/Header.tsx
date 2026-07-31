import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sólo A Mano" width={44} height={44} className="rounded-full" />
          <span className="font-display text-xl font-semibold text-cafe">Sólo A Mano</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/explorar" className="hover:text-terracota">Explorar</Link>
          <Link href="/verificacion" className="hover:text-terracota">El sello</Link>
          <Link href="/cuenta" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
