"use client";
import { useAuthStore } from "@/lib/store";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

const LANGUAGES = [
  { code: "fr", label: "Francais" },
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Portugues" },
  { code: "ar", label: "Arabic" },
];

export default function GeneratePage() {
  const router = useRouter();

  const [profilTexte, setProfilTexte] = useState("");
  const [offreTexte, setOffreTexte] = useState("");
  const [profilFile, setProfilFile] = useState<File | null>(null);
  const [offreFile, setOffreFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleProfilFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setProfilFile(e.target.files[0]);
  }

  function handleOffreFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setOffreFile(e.target.files[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!profilFile && !profilTexte) {
      setError("Fournissez votre profil (fichier ou texte).");
      return;
    }
    if (!offreFile && !offreTexte) {
      setError("Fournissez l'offre d'emploi (fichier ou texte).");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (profilFile) formData.append("fichier_profil", profilFile);
      if (profilTexte) formData.append("texte_profil", profilTexte);
      if (offreFile) formData.append("fichier_offre", offreFile);
      if (offreTexte) formData.append("texte_offre", offreTexte);

      formData.append("output_language", language);
      formData.append("inclure_relance", "false");

      const response = await api.post("/api/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      // Telecharger le ZIP
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pack_Candidature_IA.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
        // Rafraichir les infos utilisateur (credits)
      const { data: userData } = await api.get("/api/auth/me");
      useAuthStore.getState().setUser(userData);
      router.push("/dashboard/history");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Erreur lors de la generation.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Generer un pack</h1>
        <p className="text-slate-600">
          Uploadez votre profil et l'offre d'emploi pour generer un pack complet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}

        <Card>
          <CardHeader>
            <CardTitle>1. Votre profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fichier (PDF, DOCX, TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleProfilFile}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {profilFile && (
                <p className="mt-2 text-xs text-emerald-600">
                  Fichier selectionne : {profilFile.name}
                </p>
              )}
            </div>

            <div className="text-center text-sm text-slate-400">OU</div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Texte brut
              </label>
              <textarea
                value={profilTexte}
                onChange={(e) => setProfilTexte(e.target.value)}
                placeholder="Collez ici votre CV ou profil..."
                rows={6}
                className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. L'offre d'emploi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fichier (PDF, DOCX, TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleOffreFile}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {offreFile && (
                <p className="mt-2 text-xs text-emerald-600">
                  Fichier selectionne : {offreFile.name}
                </p>
              )}
            </div>

            <div className="text-center text-sm text-slate-400">OU</div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Texte brut
              </label>
              <textarea
                value={offreTexte}
                onChange={(e) => setOffreTexte(e.target.value)}
                placeholder="Collez ici l'offre d'emploi..."
                rows={6}
                className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Langue de generation</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={loading} size="lg">
            {loading ? "Generation en cours..." : "Generer mon pack"}
          </Button>
        </div>

        {loading && (
          <Alert variant="info">
            Generation IA en cours... Cela peut prendre 30 a 60 secondes.
          </Alert>
        )}
      </form>
    </div>
  );
}
