import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Dog,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/dashboardService";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireTenantSession();
  const metrics = await getDashboardMetrics(session.tenantId);

  const statusBadge = (status: string) => {
    switch (status) {
      case "EM_ATENDIMENTO":
        return <Badge variant="success">Em Atendimento</Badge>;
      case "CONFIRMADO":
        return <Badge variant="info">Confirmado</Badge>;
      case "AGENDADO":
        return <Badge variant="secondary">Agendado</Badge>;
      case "CONCLUIDO":
        return <Badge variant="purple">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Painel Geral
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indicadores e operações em tempo real de{" "}
            <span className="font-bold text-slate-700">{session.tenantName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/agenda">
            <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Novo Agendamento
            </Button>
          </Link>
          <Link href="/app/clientes">
            <Button size="sm" variant="outline" className="gap-1.5 font-semibold">
              <Users className="w-4 h-4" /> Cadastrar Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid com os 8 Principais Cards de Indicadores (KPIs Reais Persistidos) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Agendamentos de Hoje */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Agendamentos Hoje</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.todayAppointments}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">atendimentos no dia</p>
          </CardContent>
        </Card>

        {/* 2. Agendamentos Pendentes */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Fila Pendente</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.pendingAppointments}</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">aguardando realização</p>
          </CardContent>
        </Card>

        {/* 3. Concluídos no Mês */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Concluídos no Mês</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.completedMonthServices}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">serviços entregues</p>
          </CardContent>
        </Card>

        {/* 4. Receita Recebida Mês */}
        <Card className="border-slate-200/80 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-emerald-800">Receita Recebida</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-950">
              {formatCurrency(metrics.monthRevenue)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">liquidado no mês</p>
          </CardContent>
        </Card>

        {/* 5. Valores a Receber */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Valores a Receber</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(metrics.totalReceivables)}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">agendamentos pendentes</p>
          </CardContent>
        </Card>

        {/* 6. Clientes Ativos */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Clientes Ativos</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.activeCustomers}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">tutores cadastrados</p>
          </CardContent>
        </Card>

        {/* 7. Pets Cadastrados */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Pets Cadastrados</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Dog className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.totalPets}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">animais atendidos</p>
          </CardContent>
        </Card>

        {/* 8. Profissionais Ativos */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-xs font-bold text-slate-600">Equipe Ativa</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">{metrics.activeProfessionals}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">profissionais escalados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Faturamento & Serviços Mais Realizados */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Evolução do Faturamento (Últimos 7 Dias)
              </CardTitle>
              <p className="text-xs text-slate-500">Receitas diárias em reais (R$)</p>
            </div>
            <Link href="/app/financeiro">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-semibold">
                Ver Financeiro <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RevenueChart data={metrics.last7DaysChartData} />
          </CardContent>
        </Card>

        {/* Top Serviços Mais Realizados */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Serviços Mais Vendidos
            </CardTitle>
            <p className="text-xs text-slate-500">Ranking por volume de atendimentos</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {metrics.topServices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum serviço registrado ainda.</p>
            ) : (
              metrics.topServices.map((srv, idx) => (
                <div key={srv.name} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-600">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{srv.name}</p>
                      <p className="text-[10px] text-slate-400">{srv.count} atendimentos</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {formatCurrency(srv.totalRevenue)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Atendimentos de Hoje e Alertas de Estoque */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Atendimentos do Dia */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Fila de Atendimento de Hoje
              </CardTitle>
              <p className="text-xs text-slate-500">Animais agendados para a rotina de hoje</p>
            </div>
            <Link href="/app/agenda">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-semibold">
                Abrir Agenda <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.todayUpcoming.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum agendamento pendente para hoje. Horários livres disponíveis!
              </div>
            ) : (
              <div className="space-y-2.5">
                {metrics.todayUpcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50/80 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center h-10 w-14 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                        <span>{appt.startTime}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{appt.endTime}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{appt.pet.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({appt.pet.breed || "Pet"})</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {appt.service.name} • Tutor(a): {appt.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-semibold text-slate-600">
                        Prof: {appt.professional.name}
                      </span>
                      {statusBadge(appt.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Estoque Baixo */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-base font-bold text-slate-900">
                Alertas de Estoque
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">Produtos no limite mínimo configurado</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {metrics.actualLowStock.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-600 font-medium">
                ✅ Todos os produtos possuem estoque saudável.
              </div>
            ) : (
              metrics.actualLowStock.map((prod) => (
                <div key={prod.id} className="rounded-lg bg-amber-50/70 border border-amber-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-950">{prod.name}</p>
                    <Badge variant="warning" className="text-[10px]">
                      {prod.stockQuantity} {prod.unit}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-amber-800 mt-1">
                    Estoque mínimo recomendado: {prod.minStockAlert} {prod.unit}
                  </p>
                </div>
              ))
            )}
            <div className="pt-2">
              <Link href="/app/estoque">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                  Gerenciar Estoque & Compras
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
