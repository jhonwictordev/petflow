"use client";

import * as React from "react";
import {
  Dog,
  Plus,
  Search,
  User,
  AlertTriangle,
  Heart,
  Scale,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function PetsPage() {
  const { showToast } = useToast();
  const [pets, setPets] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [customerId, setCustomerId] = React.useState("");
  const [name, setName] = React.useState("");
  const [species, setSpecies] = React.useState("CANINE");
  const [breed, setBreed] = React.useState("");
  const [size, setSize] = React.useState("MEDIO");
  const [gender, setGender] = React.useState("MALE");
  const [weight, setWeight] = React.useState("");
  const [handlingRestrictions, setHandlingRestrictions] = React.useState("");
  const [careInstructions, setCareInstructions] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
      } catch (err) {
        console.error(err);
      }
    }
    loadCustomers();
  }, []);

  const loadPets = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/pets";
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.pets) setPets(data.pets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadPets();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPets]);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          name,
          species,
          breed,
          size,
          gender,
          weight: weight ? parseFloat(weight) : undefined,
          handlingRestrictions,
          careInstructions,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar pet");

      showToast({
        title: "Pet Cadastrado!",
        description: `${name} foi vinculado ao tutor com sucesso.`,
        type: "success",
      });

      setModalOpen(false);
      setName("");
      setBreed("");
      setWeight("");
      setHandlingRestrictions("");
      setCareInstructions("");
      setNotes("");
      loadPets();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getSizeBadge = (s: string) => {
    switch (s) {
      case "PEQUENO":
        return <Badge variant="secondary" className="text-[10px]">Porte Pequeno (P)</Badge>;
      case "MEDIO":
        return <Badge variant="info" className="text-[10px]">Porte Médio (M)</Badge>;
      case "GRANDE":
        return <Badge variant="purple" className="text-[10px]">Porte Grande (G)</Badge>;
      case "GIGANTE":
        return <Badge variant="warning" className="text-[10px]">Porte Gigante (GG)</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pets & Fichas de Atendimento
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prontuário estético, histórico de banhos, sensibilidades e restrições de manejo
          </p>
        </div>

        <Button
          onClick={() => {
            if (customers.length > 0 && !customerId) {
              setCustomerId(customers[0].id);
            }
            setModalOpen(true);
          }}
          size="sm"
          className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Cadastrar Pet
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome do pet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {pets.length} pet(s) cadastrado(s)
        </span>
      </div>

      {/* Grid de Cards de Pets */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Carregando fichas dos pets...
        </div>
      ) : pets.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 text-center py-16">
          <CardContent className="space-y-2">
            <Dog className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-800">Nenhum pet encontrado</p>
            <p className="text-xs text-slate-500">Cadastre um animal vinculado a um cliente cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((p) => (
            <Card key={p.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      {p.species === "FELINE" ? "🐱" : "🐶"}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-slate-900">{p.name}</CardTitle>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.breed || "Sem raça definida"} • {p.gender === "MALE" ? "Macho" : "Fêmea"}
                      </p>
                    </div>
                  </div>
                  {getSizeBadge(p.size)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 space-y-1">
                  <p className="text-slate-600 flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Tutor: {p.customer.name}
                  </p>
                  {p.weight && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" /> Peso: {p.weight} kg
                    </p>
                  )}
                </div>

                {p.careInstructions && (
                  <div className="rounded-lg bg-blue-50/70 p-2 text-blue-900 border border-blue-100">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      <Heart className="w-3 h-3 text-blue-600" /> Instruções de Cuidado:
                    </span>
                    <p className="text-[10px] text-blue-800 mt-0.5">{p.careInstructions}</p>
                  </div>
                )}

                {p.handlingRestrictions && (
                  <div className="rounded-lg bg-amber-50/70 p-2 text-amber-900 border border-amber-200">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Restrições de Manejo:
                    </span>
                    <p className="text-[10px] text-amber-800 mt-0.5">{p.handlingRestrictions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Novo Pet */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Cadastrar Animal / Pet</DialogTitle>
          <DialogDescription>
            Vincule o pet a um tutor e informe particularidades de banho e tosa.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreatePet} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Tutor Responsável</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome do Pet"
              placeholder="Ex: Bob, Pipoca, Thor..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Raça"
              placeholder="Ex: Golden, Poodle, SRD..."
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Espécie</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="CANINE">Canino (Cão)</option>
                <option value="FELINE">Felino (Gato)</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Porte</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="PEQUENO">Pequeno (P)</option>
                <option value="MEDIO">Médio (M)</option>
                <option value="GRANDE">Grande (G)</option>
                <option value="GIGANTE">Gigante (GG)</option>
              </select>
            </div>

            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              placeholder="Ex: 12.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <Input
            label="Instruções de Cuidado"
            placeholder="Ex: Shampoo hipoalergênico, laço azul, secagem fria..."
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
          />

          <Input
            label="Restrições de Manejo / Comportamento"
            placeholder="Ex: Sensível nas patas traseiras, não gosta de secador forte..."
            value={handlingRestrictions}
            onChange={(e) => setHandlingRestrictions(e.target.value)}
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
              {submitting ? "Cadastrando..." : "Salvar Pet"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
