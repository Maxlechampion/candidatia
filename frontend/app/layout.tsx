import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CandidatIA - Générez votre pack de candidature en 1 clic",
  description:
    "CV optimisé, lettre de motivation et guide d'entretien générés par IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}