"use client";

import * as React from "react";
import { UserCog, Plus, Clock, Percent, Phone, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatPhone } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function ProfissionaisPage() {
  const { showToast } = useToast();
  const [professionals, setProfessionals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [roleTitle, setRoleTitle] = React.useState("Tosador(a)");
  const [commissionRate, setCommissionRate] = React.useState(18);
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("18:00");
  const [colorHex, setColorHex] = React.useState("#10B981");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadProfessionals = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/professionals");
      const data = await res.json();
      if (data.professionals) setProfessionals(data.professionals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          roleTitle,
          commissionRate: Number(commissionRate),
          startTime,
          endTime,
          colorHex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar profissional");

      showToast({
        title: "Profissional Cadastrado!",
        description: `${name} foi adicionado à equipe com sucesso.`,
        type: "success",
      });

      setModalOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      loadProfessionals();
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
            Gestão da Equipe & Profissionais
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Escalas de trabalho, jornada, taxas de comissão e vínculo de agenda
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Adicionar Profissional
        </Button>
      </div>

      {/* Grid de Profissionais */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Carregando equipe...
        </div>
      ) : professionals.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Nenhum profissional cadastrado.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((p) => (
            <Card key={p.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm"
                      style={{ backgroundColor: p.colorHex || "#10B981" }}
                    >
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">{p.name}</CardTitle>
                      <p className="text-xs font-semibold text-slate-500">{p.roleTitle}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {p.commissionRate}% Comiss.
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Jornada:
                    </span>
                    <span className="font-bold text-slate-800">{p.startTime} às {p.endTime}</span>
                  </div>
                  {p.phone && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Contato:
                      </span>
                      <span className="font-medium text-slate-700">{formatPhone(p.phone)}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail:
                      </span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{p.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Atendimentos agendados:</span>
                  <span className="font-bold text-slate-800">
                    {p.appointments?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Novo Profissional */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Cadastrar Profissional</DialogTitle>
          <DialogDescription>
            Configuração da jornada e comissionamento. O limite do plano é validado pelo servidor.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateProfessional} className="space-y-3 pt-2">
          <Input
            label="Nome Completo"
            placeholder="Ex: Gabriel Moreira"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cargo / Função"
              placeholder="Ex: Tosador Especialista, Banhista..."
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              required
            />
            <Input
              label="Comissão Padrão (%)"
              type="number"
              placeholder="Ex: 20"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone / Celular"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="gabriel@petflowdemo.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Início Expediente"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Fim Expediente"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Cor na Agenda</label>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 cursor-pointer p-1"
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
              {submitting ? "Salvando..." : "Salvar Profissional"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
