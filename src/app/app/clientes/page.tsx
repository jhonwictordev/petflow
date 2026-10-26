"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Dog,
  Calendar,
  Gift,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatPhone, formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function ClientesPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [document, setDocument] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/customers";
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          whatsapp: whatsapp || phone,
          email,
          document,
          address,
          city,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar cliente");

      showToast({
        title: "Cliente Cadastrado!",
        description: `${name} foi adicionado à base de clientes.`,
        type: "success",
      });

      setModalOpen(false);
      setName("");
      setPhone("");
      setWhatsapp("");
      setEmail("");
      setDocument("");
      setAddress("");
      setCity("");
      setNotes("");
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (customers.length === 0) return;
    const header = "Nome,Telefone,WhatsApp,Email,CPF,Endereco,Pets,Data Cadastro\n";
    const rows = customers.map((c) => {
      const petNames = (c.pets || []).map((p: any) => p.name).join("; ");
      return `"${c.name}","${c.phone}","${c.whatsapp || ""}","${c.email || ""}","${c.document || ""}","${c.address || ""}","${petNames}","${formatDate(c.createdAt)}"`;
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clientes_petflow_${new Date().toISOString().split("T")[0]}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro de tutores, histórico de visitas, pacotes e contatos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5 font-semibold text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exportar CSV
          </Button>

          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Busca e Tabela */}
      <Card className="border-slate-200">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <span className="text-xs text-slate-400 ml-auto font-medium">
              {customers.length} cliente(s) encontrado(s)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Carregando clientes...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Nenhum cliente localizado para esta busca.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contatos</TableHead>
                  <TableHead>Pets Vinculados</TableHead>
                  <TableHead>Pacotes Ativos</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                        {c.notes && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-1">{c.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <p className="flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-emerald-600" /> {formatPhone(c.phone)}
                        </p>
                        {c.email && (
                          <p className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-3 h-3" /> {c.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.pets.length === 0 ? (
                          <span className="text-[10px] text-slate-400">Sem pets</span>
                        ) : (
                          c.pets.map((p: any) => (
                            <Badge key={p.id} variant="secondary" className="text-[10px] font-medium gap-1">
                              <Dog className="w-3 h-3 text-slate-500" /> {p.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.customerPackages && c.customerPackages.length > 0 ? (
                        <Badge variant="purple" className="text-[10px] gap-1">
                          <Gift className="w-3 h-3" /> {c.customerPackages[0].package.name} ({c.customerPackages[0].remainingCredits} créditos)
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(c.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Novo Cliente */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Informações cadastrais e preferências de contato do tutor.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateCustomer} className="space-y-3 pt-2">
          <Input
            label="Nome Completo do Tutor"
            placeholder="Ex: Patrícia Alves"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone / Celular"
              placeholder="(11) 98888-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="WhatsApp (opcional)"
              placeholder="(11) 98888-8888"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="E-mail (opcional)"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="CPF (opcional)"
              placeholder="000.000.000-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Endereço (opcional)"
              placeholder="Rua, número e complemento"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              label="Cidade / Estado"
              placeholder="São Paulo - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <Input
            label="Observações Internas"
            placeholder="Ex: Prefere agendamentos aos sábados pela manhã"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

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
              {submitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
