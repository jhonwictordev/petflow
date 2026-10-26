import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "PetFlow — Plataforma SaaS para Pet Shops e Banho & Tosa",
  description:
    "Gestão completa, moderna e inteligente para negócios pet: agendamentos sem conflitos, clientes, pets, equipe, financeiro e estoque.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
