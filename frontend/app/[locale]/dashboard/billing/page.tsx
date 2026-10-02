"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { PlanCard, Plan } from "@/components/billing/PlanCard";
import { PaymentMethods } from "@/components/billing/PaymentMethods";

interface Payment {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  plan_purchased: string;
  status: string;
  created_at: string;
}

export default function BillingPage() {
  const t = useTranslations("billing");
  const { user } = useAuthStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, providersRes, paymentsRes, meRes] = await Promise.all([
          api.get("/api/billing/plans"),
          api.get("/api/billing/providers"),
          api.get("/api/billing/payments"),
          api.get("/api/auth/me"),
        ]);
        useAuthStore.getState().setUser(meRes.data);
        setPlans(plansRes.data.plans);
        setProviders(providersRes.data.providers);
        setPayments(paymentsRes.data);
        if (providersRes.data.providers.length > 0) {
          setSelectedProvider(providersRes.data.providers[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCheckout(planCode: string) {
    if (!selectedProvider) {
      setError(t("select_method"));
      return;
    }
    setError("");
    setCheckingOut(true);
    try {
      const { data } = await api.post("/api/billing/checkout", {
        plan_code: planCode,
        provider: selectedProvider,
      });
      window.location.href = data.checkout_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || t("error_payment"));
      setCheckingOut(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">{t("title")}</h1>
        <p className="text-slate-600">{t("subtitle")}</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <h2 className="text-xl font-bold text-dark mb-4">{t("plans_title")}</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">{t("plans_loading")}</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                isCurrentPlan={user?.plan === plan.code}
                onSelect={handleCheckout}
                highlighted={plan.code === "pro"}
              />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("payment_methods")}</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <Alert variant="info">{t("no_providers")}</Alert>
          ) : (
            <PaymentMethods
              availableProviders={providers}
              selected={selectedProvider}
              onSelect={setSelectedProvider}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("history_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              {t("no_payments")}
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-700">
                      Plan {p.plan_purchased}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">
                      {p.amount} {p.currency}
                    </p>
                    <p className="text-xs text-slate-500">{p.status}</p>
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
