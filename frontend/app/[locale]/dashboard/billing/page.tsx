"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Loader2,
  Check,
  AlertCircle,
  History,
  Sparkles,
  ArrowRight,
  Wallet,
} from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================
// Types (alignés avec le backend)
// ============================================================
interface Plan {
  code: string;
  name: string;
  credits: number;
  price_eur: number;
  description: string;
  features: string[];
  highlight?: boolean;
}

interface CheckoutResponse {
  payment_id: string;
  checkout_url: string;
  provider: string;
  provider_transaction_id: string;
  amount: number;
  currency: string;
  plan_code: string;
  plan_name: string;
  credits_to_add: number;
}

interface Payment {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  credits_added: number;
  plan_purchased: string;
  status: string;
  created_at: string;
}

// ============================================================
// Prix FedaPay (doit correspondre à backend/plans.py)
// ============================================================
const FEDAPAY_PRICES: Record<string, { amount: number; currency: string }> = {
  essentiel: { amount: 5000, currency: "XOF" },
  pro: { amount: 12000, currency: "XOF" },
  carriere: { amount: 25000, currency: "XOF" },
};

// ============================================================
// Helpers
// ============================================================
function formatPrice(amount: number, currency: string): string {
  if (currency === "XOF") return `${amount.toLocaleString("fr-FR")} FCFA`;
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  if (currency === "EUR") return `${amount.toFixed(2)} €`;
  return `${amount.toFixed(2)} ${currency}`;
}

function getStatusConfig(status: string): { color: string; label: string } {
  const map: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-100 text-amber-700", label: "En attente" },
    success: { color: "bg-emerald-100 text-emerald-700", label: "Réussi" },
    failed: { color: "bg-red-100 text-red-700", label: "Échoué" },
    cancelled: { color: "bg-slate-100 text-slate-700", label: "Annulé" },
    refunded: { color: "bg-blue-100 text-blue-700", label: "Remboursé" },
  };
  return map[status] || map.pending;
}

// ============================================================
// Page principale
// ============================================================
export default function BillingPage() {
  const t = useTranslations("billing");
  const params = useParams<{ locale: string }>();
  const router = useRouter();

  const [credits, setCredits] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH INITIAL DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Plans
        const { data: plansData } = await api.get<{ plans: Plan[] }>("/billing/plans");
        setPlans(plansData.plans);

        // 2. Historique paiements
        const { data: paymentsData } = await api.get<{ payments: Payment[] }>(
          "/billing/payments"
        );
        setPayments(paymentsData.payments);

        // 3. Sélection par défaut : plan "Pro" (highlight) ou premier
        if (plansData.plans.length > 0) {
          const highlighted = plansData.plans.find((p) => p.highlight);
          setSelectedPlan(highlighted || plansData.plans[0]);
        }

        // 4. Crédits utilisateur
        try {
          const { data: userData } = await api.get("/api/auth/me");
          setCredits(userData?.credits || 0);
        } catch {
          setCredits(0);
        }
      } catch (err: any) {
        console.error("billing_fetch_error", err);
        setError(t("page.load_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // ============================================================
  // CHECKOUT (FedaPay par défaut)
  // ============================================================
  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError(t("page.select_plan"));
      return;
    }

    try {
      setCheckingOut(true);
      setError(null);

      const { data } = await api.post<CheckoutResponse>("/billing/checkout", {
        plan_code: selectedPlan.code,
        provider: "fedapay", // ← FedaPay par défaut (propose Mobile Money + Carte)
        locale: params.locale,
      });

      // Redirection vers la page de paiement FedaPay
      window.location.href = data.checkout_url;
    } catch (err: any) {
      console.error("checkout_error", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        t("page.checkout_error");
      setError(msg);
      setCheckingOut(false);
    }
  };

  // Prix du plan sélectionné
  const currentPrice = selectedPlan
    ? FEDAPAY_PRICES[selectedPlan.code] || { amount: selectedPlan.price_eur, currency: "EUR" }
    : null;

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("page.title")}</h1>
          <p className="text-slate-600 mt-1">{t("page.description")}</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <Wallet className="h-6 w-6" />
          <div>
            <p className="text-xs opacity-90">{t("page.current_credits")}</p>
            <p className="text-2xl font-bold">{credits}</p>
          </div>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              ✕
            </button>
          </CardContent>
        </Card>
      )}

      {/* PLANS */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{t("page.choose_plan")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.code === plan.code;
            const price = FEDAPAY_PRICES[plan.code] || {
              amount: plan.price_eur,
              currency: "EUR",
            };

            return (
              <Card
                key={plan.code}
                className={cn(
                  "relative cursor-pointer transition-all hover:shadow-lg",
                  isSelected
                    ? "border-primary-500 border-2 shadow-md"
                    : "border-slate-200 hover:border-primary-300",
                  plan.highlight && !isSelected && "ring-2 ring-primary-500 ring-offset-2"
                )}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white shadow">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {t("page.most_popular")}
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(price.amount, price.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-primary-600 font-semibold">
                    <CreditCard className="h-5 w-5" />
                    <span>
                      {plan.credits} {t("page.credits")}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="w-full flex items-center justify-center gap-2 text-primary-600 font-medium pt-2 border-t border-slate-100">
                      <Check className="h-5 w-5" />
                      {t("page.selected")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* RÉSUMÉ + BOUTON PAYER */}
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">{t("page.total_to_pay")}</p>
              <p className="text-3xl font-bold text-slate-900">
                {currentPrice ? formatPrice(currentPrice.amount, currentPrice.currency) : "—"}
              </p>
              {selectedPlan && (
                <p className="text-sm text-slate-600 mt-1">
                  {selectedPlan.credits} {t("page.credits")} • {selectedPlan.name}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                💳 Paiement sécurisé via FedaPay (Mobile Money + Carte bancaire)
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={!selectedPlan || checkingOut}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg shadow-lg"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("page.processing")}
                </>
              ) : (
                <>
                  {t("page.pay_now")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HISTORIQUE */}
      {payments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("page.payment_history")}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {t("history.date")}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {t("history.plan")}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {t("history.amount")}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {t("history.credits")}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {t("history.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      return (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {new Date(payment.created_at).toLocaleDateString(
                              params.locale === "fr" ? "fr-FR" : "en-US",
                              { day: "2-digit", month: "short", year: "numeric" }
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                            {payment.plan_purchased}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {formatPrice(payment.amount, payment.currency)}
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-600 font-medium">
                            +{payment.credits_added}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                statusConfig.color
                              )}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}