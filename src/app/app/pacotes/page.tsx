"use client";

import * as React from "react";
import { Gift, Plus, CheckCircle2, User, Dog, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function PacotesPage() {
  const { showToast } = useToast();
  const [packages, setPackages] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal Novo Pacote
  const [modalNewOpen, setModalNewOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState(22000); // R$ 220
  const [totalUses, setTotalUses] = React.useState(4);
  const [validityDays, setValidityDays] = React.useState(30);
  const [serviceId, setServiceId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Modal Vender Pacote
  const [modalAssignOpen, setModalAssignOpen] = React.useState(false);
  const [assignPkgId, setAssignPkgId] = React.useState("");
  const [assignCustomerId, setAssignCustomerId] = React.useState("");
  const [assignPetId, setAssignPetId] = React.useState("");
  const [assigning, setAssigning] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, custRes, srvRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/customers"),
        fetch("/api/services"),
      ]);

      const pkgData = await pkgRes.json();
      const custData = await custRes.json();
      const srvData = await srvRes.json();

      if (pkgData.packages) setPackages(pkgData.packages);
      if (custData.customers) setCustomers(custData.customers);
      if (srvData.services) setServices(srvData.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          totalUses: Number(totalUses),
          validityDays: Number(validityDays),
          serviceId: serviceId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pacote");

      showToast({
        title: "Pacote Criado!",
        description: `${name} já pode ser comercializado aos clientes.`,
        type: "success",
      });

      setModalNewOpen(false);
      setName("");
      setDescription("");
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN",
          packageId: assignPkgId,
          customerId: assignCustomerId,
          petId: assignPetId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao vincular pacote");

      showToast({
        title: "Pacote Vendido com Sucesso!",
        description: `Créditos adicionados ao cliente e receita registrada no caixa.`,
        type: "success",
      });

      setModalAssignOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    } finally {
      setAssigning(false);
    }
  };

  const handleUseCredit = async (customerPackageId: string) => {
    try {
      const res = await fetch("/api/packages/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPackageId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao utilizar crédito");

      showToast({
        title: "Crédito Utilizado!",
        description: `1 atendimento debitado do saldo do pacote.`,
        type: "success",
      });
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  // Pets of selected customer in assign modal
  const selectedCustomerPets = React.useMemo(() => {
    if (!assignCustomerId) return [];
    const cust = customers.find((c) => c.id === assignCustomerId);
    return cust?.pets || [];
  }, [assignCustomerId, customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pacotes de Serviços & Assinaturas de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fidelização com planos periódicos (ex: 4 banhos/mês), débito automático de saldo e validade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (packages.length > 0) setAssignPkgId(packages[0].id);
              if (customers.length > 0) setAssignCustomerId(customers[0].id);
              setModalAssignOpen(true);
            }}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" /> Vender Pacote a Cliente
          </Button>

          <Button
            onClick={() => setModalNewOpen(true)}
            size="sm"
            className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Modelo de Pacote
          </Button>
        </div>
      </div>

      {/* Grid de Modelos de Pacotes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">{pkg.name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{pkg.description || "Plano recorrente"}</p>
                </div>
                <Badge variant="purple" className="text-xs font-bold">
                  {pkg.totalUses} utilizações
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs text-slate-500">Valor do Pacote:</span>
                <span className="text-lg font-black text-slate-900">{formatCurrency(pkg.price)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Validade:</span>
                <span className="font-bold text-slate-800">{pkg.validityDays} dias</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAssignPkgId(pkg.id);
                  if (customers.length > 0) setAssignCustomerId(customers[0].id);
                  setModalAssignOpen(true);
                }}
                className="w-full font-bold text-xs"
              >
                Vender Este Pacote
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Pacotes Ativos dos Clientes */}
      <Card className="border-slate-200 mt-8">
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Pacotes Ativos em Aberto (Controle de Saldos)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {customers.flatMap((c) => (c.customerPackages || []).map((cp: any) => (
              <div
                key={cp.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50 hover:bg-white transition-colors text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {c.name} • {cp.package?.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Expira em: {formatDate(cp.expiresAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                    {cp.remainingCredits} de {cp.totalCredits} créditos restantes
                  </span>
                  {cp.remainingCredits > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleUseCredit(cp.id)}
                      className="h-7 text-xs font-bold"
                    >
                      Debitar 1 Banho
                    </Button>
                  )}
                </div>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Novo Modelo de Pacote */}
      <Dialog open={modalNewOpen} onOpenChange={setModalNewOpen}>
        <DialogHeader>
          <DialogTitle>Criar Modelo de Pacote</DialogTitle>
          <DialogDescription>
            Defina a quantidade de utilizações e o prazo de validade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreatePackage} className="space-y-3 pt-2">
          <Input
            label="Nome do Pacote"
            placeholder="Ex: Pacote 4 Banhos Mensais (Médio)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Descrição dos Benefícios"
            placeholder="Ex: 4 banhos completos com hidratação inclusa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Preço Total (Centavos)"
              type="number"
              placeholder="22000 para R$ 220"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Nº de Utilizações"
              type="number"
              value={totalUses}
              onChange={(e) => setTotalUses(Number(e.target.value))}
              required
            />
            <Input
              label="Validade (Dias)"
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalNewOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="font-bold" disabled={submitting}>
              {submitting ? "Criando..." : "Salvar Modelo"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Modal: Vender Pacote */}
      <Dialog open={modalAssignOpen} onOpenChange={setModalAssignOpen}>
        <DialogHeader>
          <DialogTitle>Vender Pacote a Cliente</DialogTitle>
          <DialogDescription>
            Conceda créditos de serviços ao cliente e registre o pagamento no caixa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssignPackage} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Modelo de Pacote</label>
            <select
              value={assignPkgId}
              onChange={(e) => setAssignPkgId(e.target.value)}
              required
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} ({p.totalUses} usos)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Cliente / Tutor</label>
            <select
              value={assignCustomerId}
              onChange={(e) => setAssignCustomerId(e.target.value)}
              required
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Pet Beneficiário (Opcional)</label>
            <select
              value={assignPetId}
              onChange={(e) => setAssignPetId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
            >
              <option value="">Qualquer pet do tutor</option>
              {selectedCustomerPets.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.breed || "Pet"})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalAssignOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="font-bold" disabled={assigning}>
              {assigning ? "Processando..." : "Confirmar Venda"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
