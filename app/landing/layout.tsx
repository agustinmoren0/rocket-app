import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habika - Equilibra tu mente, crea tus hábitos con calma",
  description: "Un espacio tranquilo para tus hábitos, reflexiones y autoconocimiento. Disponible como web, PWA, y próximamente en iOS y Android. Sin prisa, sin presión, solo intención.",
  keywords: "hábitos, bienestar, salud mental, app, PWA, productividad, meditación, autoconocimiento",
  authors: [{ name: "Habika" }],
  openGraph: {
    title: "Habika - Equilibra tu mente, crea tus hábitos con calma",
    description: "Un espacio tranquilo para tus hábitos, reflexiones y autoconocimiento.",
    type: "website",
    locale: "es_ES",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
