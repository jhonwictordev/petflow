"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha na autenticação");
      }

      router.push(data.redirect || "/app");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    handleLogin(undefined, userEmail, userPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Pet<span className="text-primary">Flow</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500">Entre para gerenciar seu negócio pet ou realizar demonstração</p>
        </div>

        {/* Card de Login */}
        <Card className="border-slate-200 shadow-xl bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Acessar a Plataforma</CardTitle>
            <CardDescription className="text-xs">
              Informe seu e-mail e senha cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="E-mail"
                id="email"
                type="email"
                placeholder="seu.email@petflowdemo.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Senha"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full font-bold h-10 shadow-md shadow-emerald-500/20"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>

            {/* Acesso Rápido para Avaliação e Demonstração */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" /> Acesso Rápido Demonstrativo:
                </span>
                <Badge variant="secondary" className="text-[10px]">1 Clique</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickLogin("owner@petflowdemo.com.br", "demoPassword123!")}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2 text-left transition-colors"
                >
                  <p className="font-bold text-slate-800">👑 Carlos (Owner)</p>
                  <p className="text-[10px] text-slate-500">Acesso Total Demo</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin("gerente@petflowdemo.com.br", "demoPassword123!")}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2 text-left transition-colors"
                >
                  <p className="font-bold text-slate-800">💼 Fernanda (Gerente)</p>
                  <p className="text-[10px] text-slate-500">Operacional & Equipe</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin("recepcao@petflowdemo.com.br", "demoPassword123!")}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2 text-left transition-colors"
                >
                  <p className="font-bold text-slate-800">🛎️ Mariana (Recepção)</p>
                  <p className="text-[10px] text-slate-500">Agenda & Clientes</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin("owner@auaupet.com.br", "demoPassword123!")}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 p-2 text-left transition-colors"
                >
                  <p className="font-bold text-slate-800">🔒 Tenant Isolado (AuAu)</p>
                  <p className="text-[10px] text-slate-500">Teste de Multi-Tenant</p>
                </button>
              </div>

              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => quickLogin("admin@petflow.com.br", "adminPassword123!")}
                  className="w-full rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 p-2 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-purple-900">🛡️ Super Admin da Plataforma</p>
                    <p className="text-[10px] text-purple-700">Painel Geral de Empresas e Assinaturas SaaS</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 text-xs text-slate-500 py-3">
            <Link href="/" className="hover:text-primary transition-colors">← Voltar à página inicial</Link>
            <Link href="/register" className="font-semibold text-primary hover:underline">Criar conta da minha empresa</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
