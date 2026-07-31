import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-verde text-crema">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:justify-between">
        <p className="font-display">Sólo A Mano — hecho a mano, hecho con sentido.</p>
        <nav className="flex gap-4">
          <Link href="/explorar" className="hover:text-ambar">Explorar</Link>
          <Link href="/verificacion" className="hover:text-ambar">El sello</Link>
          <Link href="/cuenta" className="hover:text-ambar">¿Eres artesano? Súmate</Link>
        </nav>
      </div>
    </footer>
  );
}
