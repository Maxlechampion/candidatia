import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CandidatIA - Generez votre pack de candidature en 1 clic",
  description:
    "CV optimise, lettre de motivation et guide d'entretien generes par IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note : <html> et <body> sont fournis par app/[locale]/layout.tsx
  return children;
}
