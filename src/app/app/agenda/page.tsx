"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Clock,
  User,
  Dog,
  Scissors,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function AgendaPage() {
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [loading, setLoading] = React.useState(true);

  // Data lists
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [professionals, setProfessionals] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);

  // Modals state
  const [newModalOpen, setNewModalOpen] = React.useState(false);
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [selectedAppt, setSelectedAppt] = React.useState<any>(null);

  // New appointment form state
  const [formCustomerId, setFormCustomerId] = React.useState("");
  const [formPetId, setFormPetId] = React.useState("");
  const [formProfessionalId, setFormProfessionalId] = React.useState("");
  const [formServiceId, setFormServiceId] = React.useState("");
  const [formStartTime, setFormStartTime] = React.useState("09:00");
  const [formDuration, setFormDuration] = React.useState(60);
  const [formPrice, setFormPrice] = React.useState(6000);
  const [formNotes, setFormNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Load auxiliary data
  React.useEffect(() => {
    async function loadAux() {
      try {
        const [profRes, custRes, srvRes] = await Promise.all([
          fetch("/api/professionals"),
          fetch("/api/customers"),
          fetch("/api/services"),
        ]);
        const profData = await profRes.json();
        const custData = await custRes.json();
        const srvData = await srvRes.json();

        if (profData.professionals) setProfessionals(profData.professionals);
        if (custData.customers) setCustomers(custData.customers);
        if (srvData.services) setServices(srvData.services);
      } catch (err) {
        console.error("Erro ao carregar dados auxiliares:", err);
      }
    }
    loadAux();
  }, []);

  // Fetch appointments for current date
  const loadAppointments = React.useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split("T")[0];
      const start = `${dateStr}T00:00:00.000Z`;
      const end = `${dateStr}T23:59:59.999Z`;

      let url = `/api/appointments?startDate=${start}&endDate=${end}`;
      if (selectedProfessional !== "ALL") url += `&professionalId=${selectedProfessional}`;
      if (selectedStatus !== "ALL") url += `&status=${selectedStatus}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedProfessional, selectedStatus]);

  React.useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle service selection change to update default price and duration
  const handleServiceChange = (serviceId: string) => {
    setFormServiceId(serviceId);
    const srv = services.find((s) => s.id === serviceId);
    if (srv) {
      setFormDuration(srv.durationMinutes);
      setFormPrice(srv.basePrice);
    }
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, durationMin: number) => {
    const [h, m] = start.split(":").map(Number);
    const totalMinutes = h * 60 + m + durationMin;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const endTime = calculateEndTime(formStartTime, Number(formDuration));
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formCustomerId,
          petId: formPetId,
          professionalId: formProfessionalId,
          serviceId: formServiceId,
          date: currentDate.toISOString().split("T")[0],
          startTime: formStartTime,
          endTime,
          durationMinutes: Number(formDuration),
          price: Number(formPrice),
          notes: formNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao agendar horário");
      }

      showToast({
        title: "Agendamento Criado!",
        description: "Horário reservado com sucesso sem conflitos.",
        type: "success",
      });

      setNewModalOpen(false);
      // Reset form
      setFormNotes("");
      loadAppointments();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedAppt) return;
    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar status");

      showToast({
        title: "Status Atualizado!",
        description: `Agendamento alterado para ${newStatus}.`,
        type: "success",
      });
      setStatusModalOpen(false);
      loadAppointments();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  const handleQuickPayment = async (method: string) => {
    if (!selectedAppt) return;
    try {
      const res = await fetch(`/api/financial/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          amount: selectedAppt.price,
          method,
          notes: `Pagamento recebido na recepção`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao liquidar pagamento");

      showToast({
        title: "Pagamento Registrado!",
        description: `Recebimento de ${formatCurrency(selectedAppt.price)} efetuado via ${method}.`,
        type: "success",
      });
      setStatusModalOpen(false);
      loadAppointments();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    }
  };

  const navigateDay = (offset: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  };

  // Selected customer's pets
  const selectedCustomerPets = React.useMemo(() => {
    if (!formCustomerId) return [];
    const cust = customers.find((c) => c.id === formCustomerId);
    return cust?.pets || [];
  }, [formCustomerId, customers]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EM_ATENDIMENTO":
        return <Badge variant="success">Em Atendimento</Badge>;
      case "CONFIRMADO":
        return <Badge variant="info">Confirmado</Badge>;
      case "AGENDADO":
        return <Badge variant="secondary">Agendado</Badge>;
      case "CONCLUIDO":
        return <Badge variant="purple">Concluído</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "FALTOU":
        return <Badge variant="outline">Faltou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Navegação de Data e Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Agenda Inteligente
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prevenção atômica de sobreposição de horários e rastreamento da fila
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Navegador de Data */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm p-1">
            <button
              onClick={() => navigateDay(-1)}
              className="p-1 text-slate-600 hover:bg-slate-100 rounded"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-0.5 text-xs font-bold text-slate-800 hover:text-primary transition-colors"
            >
              Hoje ({formatDate(currentDate)})
            </button>
            <button
              onClick={() => navigateDay(1)}
              className="p-1 text-slate-600 hover:bg-slate-100 rounded"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => {
              if (customers.length > 0 && !formCustomerId) {
                setFormCustomerId(customers[0].id);
                if (customers[0].pets?.length > 0) {
                  setFormPetId(customers[0].pets[0].id);
                }
              }
              if (professionals.length > 0 && !formProfessionalId) {
                setFormProfessionalId(professionals[0].id);
              }
              if (services.length > 0 && !formServiceId) {
                handleServiceChange(services[0].id);
              }
              setNewModalOpen(true);
            }}
            className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-primary" /> Filtrar Por:
        </div>

        {/* Filtro Profissional */}
        <select
          value={selectedProfessional}
          onChange={(e) => setSelectedProfessional(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">Todos os Profissionais</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.roleTitle})
            </option>
          ))}
        </select>

        {/* Filtro Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">Todos os Status</option>
          <option value="AGENDADO">Agendado</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="EM_ATENDIMENTO">Em Atendimento</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="CANCELADO">Cancelado</option>
          <option value="FALTOU">Faltou</option>
        </select>

        <span className="ml-auto text-xs text-slate-400 font-medium">
          {appointments.length} agendamento(s) listado(s)
        </span>
      </div>

      {/* Grade de Agendamentos do Dia */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Carregando grade de agendamentos...
        </div>
      ) : appointments.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 text-center py-16">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Nenhum agendamento para esta data
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Todos os horários estão disponíveis para novos clientes e atendimentos.
            </p>
            <Button
              onClick={() => setNewModalOpen(true)}
              variant="outline"
              size="sm"
              className="font-bold text-xs"
            >
              Agendar Primeiro Atendimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              onClick={() => {
                setSelectedAppt(appt);
                setStatusModalOpen(true);
              }}
              className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer gap-4"
            >
              {/* Horário & Pet */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-950 font-black p-2.5 min-w-[70px] border border-emerald-100">
                  <span className="text-sm">{appt.startTime}</span>
                  <span className="text-[10px] text-emerald-700 font-normal">{appt.endTime}</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">{appt.durationMinutes} min</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{appt.pet.name}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      • {appt.pet.breed || "Raça não informada"} ({appt.pet.size})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Serviço: <span className="font-bold text-slate-900">{appt.service.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Tutor: {appt.customer.name} ({appt.customer.phone})
                  </p>
                  {appt.notes && (
                    <p className="text-[10px] text-slate-400 italic">
                      Obs: {appt.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Profissional, Valor, Status & Ação */}
              <div className="flex flex-wrap items-center gap-4 self-end md:self-auto">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: appt.professional.colorHex || "#10B981" }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {appt.professional.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-xs font-black text-slate-900">
                      {formatCurrency(appt.price)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        appt.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {appt.paymentStatus === "PAID" ? "PAGO" : "PENDENTE"}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(appt.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Novo Agendamento com Detecção de Conflitos */}
      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Data: <span className="font-bold text-slate-800">{formatDate(currentDate)}</span>. O sistema verifica conflitos de horário em tempo real.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAppointment} className="space-y-4 pt-2">
          {/* Tutor */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Tutor Responsável</label>
            <select
              value={formCustomerId}
              onChange={(e) => {
                setFormCustomerId(e.target.value);
                const cust = customers.find((c) => c.id === e.target.value);
                if (cust?.pets?.length > 0) {
                  setFormPetId(cust.pets[0].id);
                } else {
                  setFormPetId("");
                }
              }}
              required
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecione o Cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Pet */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Animal / Pet</label>
            <select
              value={formPetId}
              onChange={(e) => setFormPetId(e.target.value)}
              required
              disabled={!formCustomerId}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
            >
              <option value="">Selecione o Pet</option>
              {selectedCustomerPets.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} • {p.breed || "Pet"} ({p.size})
                </option>
              ))}
            </select>
            {formCustomerId && selectedCustomerPets.length === 0 && (
              <p className="text-[10px] text-amber-600 font-medium">
                Este cliente não possui pets cadastrados. Cadastre um pet na aba Pets primeiro.
              </p>
            )}
          </div>

          {/* Serviço e Profissional */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Serviço</label>
              <select
                value={formServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes}min)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Profissional</label>
              <select
                value={formProfessionalId}
                onChange={(e) => setFormProfessionalId(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horário de Início e Duração */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Horário Início"
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              required
            />
            <Input
              label="Duração (min)"
              type="number"
              value={formDuration}
              onChange={(e) => setFormDuration(Number(e.target.value))}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Horário Término</label>
              <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center text-xs font-bold text-slate-700">
                {calculateEndTime(formStartTime, Number(formDuration))}
              </div>
            </div>
          </div>

          <Input
            label="Valor do Atendimento (Centavos ou R$)"
            type="number"
            value={formPrice}
            onChange={(e) => setFormPrice(Number(e.target.value))}
            placeholder="6000 para R$ 60,00"
            required
          />

          <Input
            label="Observações para a equipe"
            placeholder="Ex: Cuidado com orelha sensível, laço vermelho no final"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-md shadow-emerald-500/20"
              disabled={submitting}
            >
              {submitting ? "Verificando conflitos..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Modal: Detalhes do Agendamento e Ações Operacionais */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        {selectedAppt && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedAppt.pet.name} • {selectedAppt.service.name}</DialogTitle>
                {getStatusBadge(selectedAppt.status)}
              </div>
              <DialogDescription>
                Horário: {selectedAppt.startTime} às {selectedAppt.endTime} ({selectedAppt.durationMinutes} min)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Tutor:</span>
                <span className="font-bold text-slate-800">{selectedAppt.customer.name} ({selectedAppt.customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profissional:</span>
                <span className="font-bold text-slate-800">{selectedAppt.professional.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor do Atendimento:</span>
                <span className="font-black text-slate-900">{formatCurrency(selectedAppt.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Situação Financeira:</span>
                <span className={`font-bold ${selectedAppt.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-700"}`}>
                  {selectedAppt.paymentStatus === "PAID" ? "Liquidado / Pago" : "Aguardando Pagamento"}
                </span>
              </div>
            </div>

            {/* Ações de Status */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Mudar Situação do Atendimento:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("CONFIRMADO")}
                  className="text-xs"
                >
                  Confirmado
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("EM_ATENDIMENTO")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
                >
                  Em Banho/Tosa
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("CONCLUIDO")}
                  className="bg-violet-600 hover:bg-violet-700 text-xs text-white"
                >
                  Concluído
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("FALTOU")}
                  className="text-xs text-slate-600"
                >
                  Não Compareceu
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusChange("CANCELADO")}
                  className="text-xs col-span-2"
                >
                  Cancelar Agendamento
                </Button>
              </div>
            </div>

            {/* Ação de Pagamento se Pendente */}
            {selectedAppt.paymentStatus === "PENDING" && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Receber Pagamento do Cliente:
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => handleQuickPayment("PIX")} className="text-[11px] font-bold">
                    PIX
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleQuickPayment("DEBITO")} className="text-[11px] font-bold">
                    Débito
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleQuickPayment("CREDITO")} className="text-[11px] font-bold">
                    Crédito
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleQuickPayment("DINHEIRO")} className="text-[11px] font-bold">
                    Dinheiro
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}
