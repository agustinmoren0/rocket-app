import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habika - Tu compañero en mejores hábitos",
  description: "Transforma tu vida registrando hábitos y actividades. Visualiza tu progreso, mantén tu racha y celebra cada logro.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
