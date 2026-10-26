"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Sparkles, Building2 } from "lucide-react";
import { SessionPayload } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export function AppTopbar({ session }: { session: SessionPayload }) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Building2 className="w-4 h-4 text-slate-400 hidden sm:block" />
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-none">
            {session.tenantName || "Pet Shop"}
          </h1>
          <span className="text-[11px] text-slate-500 font-medium">
            Ambiente comercial operacional
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-semibold gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Multi-Tenant Isolado
        </Badge>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notificações operacionais"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900">Notificações do Dia</span>
                <span className="text-[10px] text-slate-400">Tempo real</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-900 border border-emerald-100">
                  <p className="font-bold">Agendamento Confirmado</p>
                  <p className="text-[10px] text-emerald-700">Bob (Buldogue Francês) às 14:00 com Roberto.</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-900 border border-amber-100">
                  <p className="font-bold">Estoque Baixo</p>
                  <p className="text-[10px] text-amber-700">Ração Super Premium 15kg possui apenas 3 unidades.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
