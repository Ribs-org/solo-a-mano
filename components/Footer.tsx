import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-fern text-bone">
      <div className="flex flex-col gap-2 px-4 md:px-10 lg:px-16 py-8 text-sm sm:flex-row sm:justify-between">
        <p className="font-display">Sólo A Mano — hecho a mano, hecho con sentido.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/explorar" className="rounded px-1 py-1 hover:text-lime">Explorar</Link>
          <Link href="/verificacion" className="rounded px-1 py-1 hover:text-lime">El sello</Link>
          <Link href="/cuenta" className="rounded px-1 py-1 hover:text-lime">¿Eres artesano? Súmate</Link>
        </nav>
      </div>
    </footer>
  );
}
