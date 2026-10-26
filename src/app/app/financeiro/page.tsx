"use client";

import * as React from "react";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function FinanceiroPage() {
  const { showToast } = useToast();
  const [summary, setSummary] = React.useState<any>(null);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [period, setPeriod] = React.useState("30d");
  const [loading, setLoading] = React.useState(true);

  // Modal Despesa
  const [modalExpenseOpen, setModalExpenseOpen] = React.useState(false);
  const [expenseDesc, setExpenseDesc] = React.useState("");
  const [expenseCat, setExpenseCat] = React.useState("PRODUTOS");
  const [expenseAmount, setExpenseAmount] = React.useState(15000); // R$ 150
  const [expenseDueDate, setExpenseDueDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [expenseNotes, setExpenseNotes] = React.useState("");
  const [submittingExpense, setSubmittingExpense] = React.useState(false);

  const loadFinancialData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, payRes, expRes] = await Promise.all([
        fetch(`/api/financial/summary?period=${period}`),
        fetch("/api/financial/payments"),
        fetch("/api/financial/expenses"),
      ]);

      const sumData = await sumRes.json();
      const payData = await payRes.json();
      const expData = await expRes.json();

      if (sumData.summary) setSummary(sumData.summary);
      if (payData.payments) setPayments(payData.payments);
      if (expData.expenses) setExpenses(expData.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExpense(true);

    try {
      const res = await fetch("/api/financial/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: expenseDesc,
          category: expenseCat,
          amount: Number(expenseAmount),
          dueDate: expenseDueDate,
          notes: expenseNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar despesa");

      showToast({
        title: "Despesa Lançada!",
        description: `${expenseDesc} foi adicionada ao contas a pagar.`,
        type: "success",
      });

      setModalExpenseOpen(false);
      setExpenseDesc("");
      loadFinancialData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handlePayExpense = async (expenseId: string) => {
    try {
      const res = await fetch("/api/financial/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, paymentMethod: "PIX" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao liquidar despesa");

      showToast({
        title: "Despesa Liquidada!",
        description: "Pagamento de conta registrado no fluxo de caixa.",
        type: "success",
      });
      loadFinancialData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão Financeira & Fluxo de Caixa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Receitas realizadas, valores a receber, despesas pagas e conciliação por método
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>

          <Button
            onClick={() => setModalExpenseOpen(true)}
            size="sm"
            className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro (Valores em Centavos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Realizada */}
        <Card className="border-slate-200 bg-emerald-50/40">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Receita Recebida
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-950">
              {summary ? formatCurrency(summary.totalRevenue) : "..."}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">liquidado no período</p>
          </CardContent>
        </Card>

        {/* Valores a Receber */}
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-amber-500" /> A Receber
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">
              {summary ? formatCurrency(summary.pendingReceivables) : "..."}
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">agendamentos pendentes</p>
          </CardContent>
        </Card>

        {/* Despesas Pagas */}
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-500" /> Despesas Pagas
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900">
              {summary ? formatCurrency(summary.totalPaidExpenses) : "..."}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              +{summary ? formatCurrency(summary.totalPendingExpenses) : "..."} a pagar
            </p>
          </CardContent>
        </Card>

        {/* Saldo Líquido Operacional */}
        <Card className="border-slate-200 bg-slate-900 text-white">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-bold text-slate-300">Saldo Líquido</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-white">
              {summary ? formatCurrency(summary.netCashFlow) : "..."}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">receitas menos despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid com Tabela de Receitas e Contas a Pagar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Entradas / Pagamentos Recebidos */}
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Últimos Pagamentos Recebidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Nenhum pagamento registrado.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {payments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">
                        {p.appointment
                          ? `${p.appointment.pet?.name} (${p.appointment.service?.name})`
                          : "Recebimento Avulso"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.appointment?.customer?.name} • {formatDate(p.paidAt || p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(p.amount)}</p>
                      <Badge variant="success" className="text-[9px]">{p.method}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas & Contas a Pagar */}
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> Contas a Pagar & Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Nenhuma despesa cadastrada.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {expenses.map((e) => (
                  <div key={e.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{e.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Venc: {formatDate(e.dueDate)} • {e.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-slate-900">{formatCurrency(e.amount)}</p>
                        <span className={`text-[10px] font-bold ${e.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                          {e.status === "PAID" ? "PAGO" : "PENDENTE"}
                        </span>
                      </div>
                      {e.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayExpense(e.id)}
                          className="h-7 text-[10px] font-bold"
                        >
                          Liquidar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Nova Despesa */}
      <Dialog open={modalExpenseOpen} onOpenChange={setModalExpenseOpen}>
        <DialogHeader>
          <DialogTitle>Lançar Nova Despesa</DialogTitle>
          <DialogDescription>
            Registre custos fixos, compra de produtos ou despesas operacionais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateExpense} className="space-y-3 pt-2">
          <Input
            label="Descrição da Despesa"
            placeholder="Ex: Compra de toalhas e shampoos, Conta de Luz..."
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Categoria</label>
              <select
                value={expenseCat}
                onChange={(e) => setExpenseCat(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="PRODUTOS">Produtos & Cosméticos</option>
                <option value="ALUGUEL">Aluguel do Espaço</option>
                <option value="ENERGIA">Energia Elétrica</option>
                <option value="AGUA">Água & Saneamento</option>
                <option value="SALARIOS">Salários & Pró-labore</option>
                <option value="MANUTENCAO">Manutenção & Softwares</option>
                <option value="OUTROS">Outros Custos</option>
              </select>
            </div>

            <Input
              label="Valor (Centavos)"
              type="number"
              placeholder="15000 para R$ 150"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Data de Vencimento"
            type="date"
            value={expenseDueDate}
            onChange={(e) => setExpenseDueDate(e.target.value)}
            required
          />

          <Input
            label="Observações"
            placeholder="Ex: Nota fiscal 4821"
            value={expenseNotes}
            onChange={(e) => setExpenseNotes(e.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalExpenseOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-md shadow-emerald-500/20"
              disabled={submittingExpense}
            >
              {submittingExpense ? "Salvando..." : "Registrar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
