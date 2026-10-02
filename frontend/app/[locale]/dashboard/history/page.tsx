"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

interface Generation {
  id: string;
  output_language: string;
  score_matching: number | null;
  status: string;
  created_at: string;
}

export default function HistoryPage() {
  const t = useTranslations("history");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Generation[]>("/api/generations");
        setGenerations(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">{t("title")}</h1>
        <p className="text-slate-600">{t("subtitle")}</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>{generations.length} {t("title").toLowerCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-sm">Chargement...</p>
          ) : generations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="mb-2">{t("empty")}</p>
              <p className="text-sm">{t("empty_hint")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-700">
                      {t("pack_label")} {gen.output_language.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(gen.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {gen.score_matching && (
                      <p className="text-sm font-bold text-primary-600">
                        {t("score_label")} : {gen.score_matching}/100
                      </p>
                    )}
                    <p className="text-xs text-slate-500">{gen.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
