"use client";

import * as React from "react";
import Link from "next/link";
import { PawPrint, Search, Dog, Calendar, Gift, Phone, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";

export default function PortalTutorPage() {
  const [phone, setPhone] = React.useState("(11) 98888-1111");
  const [customer, setCustomer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (data.customers && data.customers.length > 0) {
        // Busca os detalhes completos do cliente
        const detRes = await fetch(`/api/customers/${data.customers[0].id}`);
        const detData = await detRes.json();
        setCustomer(detData.customer);
      } else {
        setCustomer(null);
      }
    } catch (err) {
      console.error(err);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white py-4 px-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg">
                Pet<span className="text-primary">Flow</span>
              </span>
              <span className="ml-2 text-xs text-slate-500 font-semibold">• Portal do Tutor</span>
            </div>
          </div>

          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Banner de Consulta */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg shadow-emerald-700/10">
          <h2 className="text-xl sm:text-2xl font-black">Acompanhe os Cuidados com seu Pet</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Consulte seus próximos horários de banho e tosa, saldo de pacotes e histórico de atendimentos informando seu celular.
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Digite seu celular cadastrado..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 flex-1 rounded-lg bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              required
            />
            <Button type="submit" variant="secondary" className="font-bold h-10 text-xs">
              {loading ? "Buscando..." : "Consultar"}
            </Button>
          </form>
        </div>

        {searched && !loading && !customer && (
          <Card className="border-dashed border-2 border-slate-200 text-center py-12">
            <CardContent>
              <p className="text-sm font-bold text-slate-800">Nenhum cadastro encontrado para este telefone</p>
              <p className="text-xs text-slate-500 mt-1">
                Verifique se digitou o número com DDD exatamente como cadastrado no pet shop.
              </p>
            </CardContent>
          </Card>
        )}

        {customer && (
          <div className="space-y-6 animate-in fade-in">
            {/* Boas-vindas Tutor */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Olá, {customer.name}!</h3>
                <p className="text-xs text-slate-500">
                  {customer.pets?.length || 0} pet(s) cadastrado(s)
                </p>
              </div>
              <Badge variant="success" className="text-xs">Cliente Ativo</Badge>
            </div>

            {/* Pets Cadastrados */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Dog className="w-4 h-4 text-primary" /> Seus Pets
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {customer.pets?.map((pet: any) => (
                  <Card key={pet.id} className="border-slate-200">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-900">{pet.name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">
                          {pet.breed || "SRD"} • Porte {pet.size}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-1 text-xs text-slate-600">
                      {pet.careInstructions && (
                        <p className="text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded">
                          Cuidado: {pet.careInstructions}
                        </p>
                      )}
                      {pet.handlingRestrictions && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded">
                          Manejo: {pet.handlingRestrictions}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pacotes Ativos */}
            {customer.customerPackages && customer.customerPackages.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-600" /> Seus Pacotes & Créditos
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {customer.customerPackages.map((cp: any) => (
                    <Card key={cp.id} className="border-purple-200 bg-purple-50/30">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-purple-950">{cp.package?.name}</span>
                          <Badge variant="purple" className="text-xs font-bold">
                            {cp.remainingCredits} de {cp.totalCredits} banhos restantes
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Válido até: {formatDate(cp.expiresAt)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Agendamentos */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Histórico & Próximos Atendimentos
              </h4>
              <Card className="border-slate-200">
                <CardContent className="p-0 divide-y divide-slate-100">
                  {customer.appointments?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Nenhum atendimento registrado até o momento.
                    </div>
                  ) : (
                    customer.appointments?.map((appt: any) => (
                      <div key={appt.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">
                            {appt.pet?.name} • {appt.service?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(appt.date)} às {appt.startTime} (Prof: {appt.professional?.name})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatCurrency(appt.price)}</p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {appt.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        PetFlow — Seu negócio pet organizado, seus clientes mais próximos.
      </footer>
    </div>
  );
}
