"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PawPrint, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "PRO";

  const [companyName, setCompanyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [plan, setPlan] = React.useState(initialPlan);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          phone,
          userName,
          email,
          password,
          plan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar empresa");
      }

      router.push(data.redirect || "/app");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-xl bg-white">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Criar Conta da Empresa</CardTitle>
        <CardDescription className="text-xs">
          Configuração rápida do seu ambiente isolado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome do Pet Shop / Clínica"
              placeholder="Ex: Pet Center Bela Vista"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="WhatsApp / Telefone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Seu Nome Completo (Administrador)"
            placeholder="Ex: Mariana Silva"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="E-mail de Acesso"
              type="email"
              placeholder="mariana@petcenter.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Criar Senha"
              type="password"
              placeholder="Mínimo 6 dígitos"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Seletor de Plano */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Plano Escolhido
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlan("STARTER")}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  plan === "STARTER"
                    ? "border-primary bg-emerald-50/50 text-slate-900 font-bold ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs">Starter</p>
                <p className="text-sm font-black text-slate-900">R$ 79<span className="text-[10px] font-normal">/mês</span></p>
                <p className="text-[10px] text-slate-400">Até 2 profs</p>
              </button>

              <button
                type="button"
                onClick={() => setPlan("PRO")}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  plan === "PRO"
                    ? "border-primary bg-emerald-50/50 text-slate-900 font-bold ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs">Pro</p>
                <p className="text-sm font-black text-emerald-600">R$ 149<span className="text-[10px] font-normal">/mês</span></p>
                <p className="text-[10px] text-slate-400">Até 10 profs</p>
              </button>

              <button
                type="button"
                onClick={() => setPlan("BUSINESS")}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  plan === "BUSINESS"
                    ? "border-primary bg-emerald-50/50 text-slate-900 font-bold ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs">Business</p>
                <p className="text-sm font-black text-slate-900">R$ 299<span className="text-[10px] font-normal">/mês</span></p>
                <p className="text-[10px] text-slate-400">Multi-loja</p>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full font-bold h-11 text-base shadow-lg shadow-emerald-500/20"
              disabled={loading}
            >
              {loading ? "Criando ambiente da sua empresa..." : "Iniciar Teste Gratuito"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 text-xs text-slate-500 py-3">
        <Link href="/" className="hover:text-primary transition-colors">← Início</Link>
        <Link href="/login" className="font-semibold text-primary hover:underline">Já tenho uma conta cadastrada</Link>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Pet<span className="text-primary">Flow</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500">Cadastre seu pet shop e comece com 14 dias de teste grátis</p>
        </div>

        <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando formulário...</div>}>
          <RegisterForm />
        </React.Suspense>
      </div>
    </div>
  );
}
