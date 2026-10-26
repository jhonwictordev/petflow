"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Dog,
  Scissors,
  UserCog,
  CircleDollarSign,
  Boxes,
  Gift,
  LogOut,
  PawPrint,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionPayload } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Agenda Inteligente", href: "/app/agenda", icon: CalendarDays },
  { label: "Clientes", href: "/app/clientes", icon: Users },
  { label: "Pets & Pacientes", href: "/app/pets", icon: Dog },
  { label: "Catálogo Serviços", href: "/app/servicos", icon: Scissors },
  { label: "Profissionais", href: "/app/profissionais", icon: UserCog },
  { label: "Financeiro & Caixa", href: "/app/financeiro", icon: CircleDollarSign },
  { label: "Produtos & Estoque", href: "/app/estoque", icon: Boxes },
  { label: "Pacotes & Planos", href: "/app/pacotes", icon: Gift },
];

export function AppSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const roleColors: Record<string, string> = {
    OWNER: "bg-emerald-100 text-emerald-800",
    MANAGER: "bg-blue-100 text-blue-800",
    RECEPTIONIST: "bg-purple-100 text-purple-800",
    EMPLOYEE: "bg-slate-100 text-slate-800",
    SUPERADMIN: "bg-amber-100 text-amber-800",
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-emerald-500/20">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Pet<span className="text-primary">Flow</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 leading-none">
                {session.tenantName || "SaaS Pet"}
              </span>
            </div>
          </Link>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-500">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Current Tenant Card */}
        <div className="px-3">
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ambiente Ativo</p>
            <p className="text-xs font-bold text-slate-800 truncate">{session.tenantName || "Sem Tenant"}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", roleColors[session.role || "EMPLOYEE"])}>
                {session.role || "EMPLOYEE"}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & User Card */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        <Link
          href="/portal"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Portal do Tutor
          </span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Abrir</span>
        </Link>

        {session.isSuperAdmin && (
          <Link
            href="/superadmin"
            className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5" /> Super Admin
            </span>
            <span className="text-[10px] bg-purple-200 px-1 rounded text-purple-800">SaaS</span>
          </Link>
        )}

        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{session.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Bar Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center">
            <PawPrint className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">PetFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
