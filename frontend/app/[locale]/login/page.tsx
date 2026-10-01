"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, AuthResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Erreur de connexion. Verifiez vos identifiants.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Connexion" subtitle="Accedez a votre tableau de bord">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Se connecter
        </Button>

        <p className="text-center text-sm text-slate-600 pt-2">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Creer un compte
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
