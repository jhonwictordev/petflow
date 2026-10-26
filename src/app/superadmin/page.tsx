"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Ban,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function SuperAdminPage() {
  const { showToast } = useToast();
  const [tenants, setTenants] = React.useState<any[]>([]);
  const [platform, setPlatform] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/tenants");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Acesso negado");
      if (data.tenants) setTenants(data.tenants);
      if (data.platform) setPlatform(data.platform);
    } catch (err: any) {
      showToast({ title: "Acesso Negado", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (tenantId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "UPDATE_STATUS",
          status: newStatus,
          reason: "Ação executada pelo SuperAdmin",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");

      showToast({
        title: "Status Atualizado!",
        description: `Empresa agora está ${newStatus}.`,
        type: "success",
      });
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  const handleUpdatePlan = async (tenantId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "UPDATE_PLAN",
          plan: newPlan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar plano");

      showToast({
        title: "Plano Atualizado!",
        description: `Empresa alterada para o plano ${newPlan}.`,
        type: "success",
      });
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-purple-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  PetFlow Super Admin
                </h1>
                <Badge variant="purple" className="text-[10px]">
                  Plataforma SaaS
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Gestão global de pet shops, planos SaaS, limites operacionais e métricas de receita
              </p>
            </div>
          </div>

          <Link href="/app">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold border-slate-700 text-slate-200 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Meu Pet Shop
            </Button>
          </Link>
        </div>

        {/* Métricas Agregadas da Plataforma */}
        {platform && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/80 border-slate-700 text-white">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" /> Total Empresas
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-white">{platform.totalTenants}</div>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">
                  {platform.activeTenants} ativas no sistema
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 text-white">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> MRR Estimado
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-emerald-400">
                  {formatCurrency(platform.estimatedMRR)}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  receita mensal recorrente
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 text-white">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Volume Transacionado
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-white">
                  {formatCurrency(platform.totalPlatformVolume)}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {platform.totalAppointments} atendimentos realizados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 text-white">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" /> Mix de Assinaturas
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Starter (R$79):</span>
                  <span className="font-bold text-white">{platform.planDistribution.STARTER}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pro (R$149):</span>
                  <span className="font-bold text-emerald-400">{platform.planDistribution.PRO}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Business (R$299):</span>
                  <span className="font-bold text-purple-400">{platform.planDistribution.BUSINESS}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Empresas Cadastradas (Tenants) */}
        <Card className="bg-slate-800/90 border-slate-700 text-white">
          <CardHeader className="p-4 border-b border-slate-700">
            <CardTitle className="text-base font-bold text-white">
              Empresas Cadastradas & Status de Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Carregando tenants...
              </div>
            ) : tenants.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Nenhum pet shop cadastrado ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Empresa (Tenant)</TableHead>
                    <TableHead className="text-slate-400">Plano SaaS</TableHead>
                    <TableHead className="text-slate-400">Limites</TableHead>
                    <TableHead className="text-slate-400">Métricas</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t) => (
                    <TableRow key={t.id} className="border-slate-700/60 hover:bg-slate-750">
                      <TableCell>
                        <div>
                          <p className="font-bold text-white text-xs">{t.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Slug: <span className="font-mono text-purple-300">{t.slug}</span> • Criado em {formatDate(t.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={t.plan}
                          onChange={(e) => handleUpdatePlan(t.id, e.target.value)}
                          className="h-8 rounded bg-slate-900 border border-slate-700 px-2 text-xs font-bold text-slate-200 focus:outline-none"
                        >
                          <option value="STARTER">STARTER (R$79)</option>
                          <option value="PRO">PRO (R$149)</option>
                          <option value="BUSINESS">BUSINESS (R$299)</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {t._count.professionals} de {t.maxProfessionals} profs
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {t._count.customers} clientes • {t._count.appointments} agendamentos
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            t.status === "ACTIVE"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(t.id, "SUSPENDED")}
                            className="h-7 text-xs font-bold gap-1"
                          >
                            <Ban className="w-3 h-3" /> Suspender
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(t.id, "ACTIVE")}
                            className="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Reativar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
