"use client";

import * as React from "react";
import { Scissors, Plus, Clock, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function ServicosPage() {
  const { showToast } = useToast();
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("BANHO_E_TOSA");
  const [basePrice, setBasePrice] = React.useState(6000);
  const [durationMinutes, setDurationMinutes] = React.useState(45);
  const [commissionRate, setCommissionRate] = React.useState(15);
  const [priceSmall, setPriceSmall] = React.useState(5000);
  const [priceMedium, setPriceMedium] = React.useState(6000);
  const [priceLarge, setPriceLarge] = React.useState(8000);
  const [priceGiant, setPriceGiant] = React.useState(11000);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadServices = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          basePrice: Number(basePrice),
          durationMinutes: Number(durationMinutes),
          commissionRate: Number(commissionRate),
          priceSmall: Number(priceSmall),
          priceMedium: Number(priceMedium),
          priceLarge: Number(priceLarge),
          priceGiant: Number(priceGiant),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar serviço");

      showToast({
        title: "Serviço Adicionado!",
        description: `${name} já está disponível para agendamento.`,
        type: "success",
      });

      setModalOpen(false);
      setName("");
      setDescription("");
      loadServices();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Catálogo de Serviços
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preços diferenciados por porte, tempos de execução e comissões da equipe
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Carregando serviços...
            </div>
          ) : services.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Nenhum serviço cadastrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço Base</TableHead>
                  <TableHead>Preços por Porte (P / M / G / GG)</TableHead>
                  <TableHead>Comissão Padrão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{s.name}</p>
                        {s.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">{s.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.durationMinutes} min
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-black text-slate-900">
                      {formatCurrency(s.basePrice)}
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-600">
                      {s.priceSmall ? (
                        <div className="flex gap-2 font-medium">
                          <span>P: {formatCurrency(s.priceSmall)}</span>
                          <span>M: {formatCurrency(s.priceMedium || s.basePrice)}</span>
                          <span>G: {formatCurrency(s.priceLarge || s.basePrice)}</span>
                          <span>GG: {formatCurrency(s.priceGiant || s.basePrice)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Preço único</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-700">
                      {s.commissionRate}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Novo Serviço */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
          <DialogDescription>
            Defina preços e durações para alimentar a agenda inteligente.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateService} className="space-y-3 pt-2">
          <Input
            label="Nome do Serviço"
            placeholder="Ex: Tosa na Tesoura, Banho Medicinal..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Descrição"
            placeholder="Ex: Banho relaxante com tosa artesanal detalhada"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Preço Base (Centavos)"
              type="number"
              placeholder="6000 para R$ 60"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              required
            />
            <Input
              label="Duração (min)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
            <Input
              label="Comissão (%)"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700">Preços Opcionais por Porte:</span>
            <div className="grid grid-cols-4 gap-2">
              <Input
                label="Pequeno (P)"
                type="number"
                value={priceSmall}
                onChange={(e) => setPriceSmall(Number(e.target.value))}
              />
              <Input
                label="Médio (M)"
                type="number"
                value={priceMedium}
                onChange={(e) => setPriceMedium(Number(e.target.value))}
              />
              <Input
                label="Grande (G)"
                type="number"
                value={priceLarge}
                onChange={(e) => setPriceLarge(Number(e.target.value))}
              />
              <Input
                label="Gigante (GG)"
                type="number"
                value={priceGiant}
                onChange={(e) => setPriceGiant(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-md shadow-emerald-500/20"
              disabled={submitting}
            >
              {submitting ? "Cadastrando..." : "Salvar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
