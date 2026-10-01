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

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>("/api/auth/register", {
        email,
        password,
        full_name: fullName || null,
      });

      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Erreur lors de la creation du compte.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Creer un compte"
      subtitle="Commencez gratuitement avec 1 pack offert"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="Nom complet"
          type="text"
          name="fullName"
          placeholder="Jean Dupont"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />

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
          autoComplete="new-password"
          hint="Au moins 8 caracteres"
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Creer mon compte
        </Button>

        <p className="text-center text-sm text-slate-600 pt-2">
          Deja un compte ?{" "}
          <Link href="/login" className="font-semibold text-primary-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
