"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface Relance {
  id: string;
  company_name: string;
  job_title: string;
  wait_days: number;
  scheduled_date: string;
  email_draft: string;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-blue-100 text-blue-700" },
  reminded: { label: "Rappel envoye", color: "bg-amber-100 text-amber-700" },
  sent: { label: "Envoyee", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulee", color: "bg-slate-100 text-slate-500" },
};

export function RelanceCard({
  relance,
  onCancel,
  onMarkSent,
}: {
  relance: Relance;
  onCancel: (id: string) => void;
  onMarkSent: (id: string) => void;
}) {
  const [showDraft, setShowDraft] = useState(false);
  const statusInfo = STATUS_LABELS[relance.status] || STATUS_LABELS.pending;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-dark truncate">{relance.job_title}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              {relance.company_name}
            </p>
            <p className="text-xs text-slate-500">
              Relance prevue le {new Date(relance.scheduled_date).toLocaleDateString("fr-FR")} 
              ({relance.wait_days} jours)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDraft((v) => !v)}
          >
            {showDraft ? "Masquer" : "Voir"} le brouillon
          </Button>

          {relance.status === "pending" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(relance.id)}
            >
              Annuler
            </Button>
          )}

          {(relance.status === "pending" || relance.status === "reminded") && (
            <Button
              size="sm"
              onClick={() => onMarkSent(relance.id)}
            >
              Marquer comme envoyee
            </Button>
          )}
        </div>

        {showDraft && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-2">
              Brouillon genere par IA :
            </p>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
              {relance.email_draft}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
