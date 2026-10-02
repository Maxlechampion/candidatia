"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface Plan {
  code: string;
  name: string;
  price_eur: number;
  price_xof: number;
  credits: number;
  features: string[];
}

export function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  highlighted = false,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (code: string) => void;
  highlighted?: boolean;
}) {
  const t = useTranslations("billing");

  return (
    <div
      className={cn(
        "relative bg-white rounded-xl border p-6 transition",
        highlighted
          ? "border-primary-500 shadow-lg shadow-primary-500/20"
          : "border-slate-200 hover:border-primary-300"
      )}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">
          {t("popular")}
        </span>
      )}

      <h3 className="text-lg font-bold text-dark mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-dark">{plan.price_eur}</span>
        <span className="text-slate-500 text-sm ml-1">EUR</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {plan.credits} {t("packs_count")}
      </p>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 shrink-0 mt-0.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.code)}
        disabled={isCurrentPlan}
        className={cn(
          "w-full py-2.5 rounded-lg font-semibold text-sm transition",
          isCurrentPlan
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : highlighted
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        )}
      >
        {isCurrentPlan ? t("current_plan") : t("choose_plan")}
      </button>
    </div>
  );
}
