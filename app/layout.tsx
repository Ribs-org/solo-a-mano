import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono, Pinyon_Script } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Sistema de diseño (docs/sistema-diseno.md): grotesca para títulos, serif cursiva para
// frases, mono para rótulos y precios, Inter para texto y caligrafía solo en las polaroids.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-bricolage" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon" });

export const metadata: Metadata = {
  title: { default: "Sólo A Mano — Hecho a mano, hecho con sentido", template: "%s | Sólo A Mano" },
  description:
    "Vitrina de artesanos chilenos de feria: descubre productos hechos a mano, conoce a quienes los hacen y encuéntralos en su próxima feria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${bricolage.variable} ${instrument.variable} ${mono.variable} ${inter.variable} ${script.variable} font-sans flex min-h-screen flex-col antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
