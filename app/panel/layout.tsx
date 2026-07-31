import Link from "next/link";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/panel" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Resumen</Link>
        <Link href="/panel/perfil" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Mi perfil</Link>
        <Link href="/panel/productos" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Productos</Link>
        <Link href="/panel/ubicaciones" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Ubicaciones</Link>
        <Link href="/panel/verificacion" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Verificación</Link>
      </nav>
      {children}
    </div>
  );
}
