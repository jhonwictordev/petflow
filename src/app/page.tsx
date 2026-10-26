import Link from "next/link";
import {
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  HeartHandshake,
  Users,
  Package,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  PawPrint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-emerald-500/20">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Pet<span className="text-primary">Flow</span>
              </span>
              <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                SaaS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#beneficios" className="hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#planos" className="hover:text-primary transition-colors">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              Perguntas Frequentes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-slate-700">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button className="font-semibold shadow-emerald-600/20 shadow-lg">
                Demonstração Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-6 max-w-2xl">
              <Badge variant="success" className="px-3 py-1 text-xs">
                ✨ Plataforma Comercial 100% Funcional e Multi-Empresa
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Seu pet shop organizado. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Mais tempo para cuidar
                </span>{" "}
                de quem importa.
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed">
                Agendamentos sem conflitos, histórico detalhado dos animais, controle financeiro em tempo real e estoque automatizado. Tudo reunido em um SaaS ágil e intuitivo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-base h-12 px-6">
                    Testar Agora o Demo <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#planos">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-base h-12">
                    Conhecer os Planos
                  </Button>
                </a>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sem necessidade de cartão no teste
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Isolamento absoluto de dados
                </span>
              </div>
            </div>

            {/* Visual Hero Mockup / Card */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-semibold text-slate-400">PetFlow • Painel em Tempo Real</span>
                  </div>
                  <Badge variant="purple" className="text-[11px]">Plano Pro Ativo</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg bg-emerald-50/80 p-3.5 border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-700">Faturamento Mês</span>
                    <p className="text-2xl font-black text-emerald-950 mt-1">R$ 14.850,00</p>
                    <span className="text-[11px] text-emerald-600 font-medium">↑ +18% vs mês anterior</span>
                  </div>
                  <div className="rounded-lg bg-blue-50/80 p-3.5 border border-blue-100">
                    <span className="text-xs font-semibold text-blue-700">Atendimentos Hoje</span>
                    <p className="text-2xl font-black text-blue-950 mt-1">12 pets</p>
                    <span className="text-[11px] text-blue-600 font-medium">3 em andamento</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Próximos da Fila de Banho & Tosa:</span>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        TH
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Thor • Golden Retriever</p>
                        <p className="text-[10px] text-slate-500">Banho & Tosa Geral (Roberto Santos)</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">Em Atendimento</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                        LU
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Luna • Shih Tzu</p>
                        <p className="text-[10px] text-slate-500">Tosa Higiênica (Juliana Rocha)</p>
                      </div>
                    </div>
                    <Badge variant="info" className="text-[10px]">Confirmado</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-2">Recursos Prontos</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Tudo o que seu negócio pet precisa para lucrar mais
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Desenvolvido com foco no dia a dia operacional de pet shops e clínicas de tosa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Agenda Inteligente Anti-Conflito</h3>
                <p className="text-sm text-slate-600">
                  Bloqueio automático de horários sobrepostos por profissional. Controle de status em tempo real com rastreabilidade total.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Prontuário & Ficha dos Pets</h3>
                <p className="text-sm text-slate-600">
                  Registro de raça, porte, sensibilidades, restrições comportamentais e histórico de cada atendimento do animal.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Financeiro com Centavos Precisos</h3>
                <p className="text-sm text-slate-600">
                  Controle rigoroso de receitas, pagamentos recebidos (PIX, Cartão, Dinheiro), contas a pagar e cálculo automático de comissões.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Estoque & Alerta de Mínimo</h3>
                <p className="text-sm text-slate-600">
                  Movimentações auditadas de entrada, saída e ajuste. Alertas visuais automáticos antes que cosméticos ou rações acabem.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pacotes e Planos Recorrentes</h3>
                <p className="text-sm text-slate-600">
                  Fidelize clientes vendendo pacotes (ex: 4 banhos/mês) com controle automático de saldo de utilizações e validade.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Multi-Tenant com RBAC</h3>
                <p className="text-sm text-slate-600">
                  Isolamento lógico absoluto de dados entre lojas. Perfis de acesso para Proprietário, Gerente, Tosador e Recepção.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos & Preços */}
      <section id="planos" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="purple" className="mb-2">Investimento Transparente</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Planos que escalam com o seu negócio
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Comece no Starter e faça upgrade conforme sua equipe e clientela crescem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">STARTER</h3>
                <p className="text-sm text-slate-500">Ideal para tosadores autônomos e pequenos espaços.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">R$ 79</span>
                  <span className="text-sm font-medium text-slate-500">/mês</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 unidade física</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Até 2 profissionais</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Clientes e pets ilimitados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Agenda inteligente</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dashboard básico</li>
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/register?plan=STARTER">
                  <Button variant="outline" className="w-full font-bold">Começar no Starter</Button>
                </Link>
              </div>
            </div>

            {/* Pro (Destaque) */}
            <div className="rounded-2xl border-2 border-primary bg-white p-8 flex flex-col justify-between shadow-xl relative scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-md">
                Mais Escolhido
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">PRO</h3>
                <p className="text-sm text-slate-500">Para pet shops consolidados que buscam controle total.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600">R$ 149</span>
                  <span className="text-sm font-medium text-slate-500">/mês</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 unidade física</li>
                  <li className="flex items-center gap-2 font-bold text-slate-900"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Até 10 profissionais</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Módulo Financeiro Completo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Controle de Estoque & Alertas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestão de Pacotes de Banhos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Comissões por profissional</li>
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/register?plan=PRO">
                  <Button className="w-full font-bold h-11 text-base shadow-lg shadow-emerald-500/25">
                    Assinar Plano Pro
                  </Button>
                </Link>
              </div>
            </div>

            {/* Business */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">BUSINESS</h3>
                <p className="text-sm text-slate-500">Para redes de pet shops e grandes centros estéticos.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">R$ 299</span>
                  <span className="text-sm font-medium text-slate-500">/mês</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2 font-bold text-slate-900"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Múltiplas Unidades (Até 5)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Até 50 profissionais</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Relatórios consolidados de rede</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Perfis avançados e permissões</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suporte prioritário via WhatsApp</li>
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/register?plan=BUSINESS">
                  <Button variant="outline" className="w-full font-bold">Assinar Business</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Os dados da minha empresa ficam seguros?</h4>
              <p className="text-sm text-slate-600 mt-2">
                Sim. O PetFlow possui isolamento lógico por tenant no nível do banco de dados e nos serviços do servidor. Nenhuma outra empresa ou usuário não autorizado tem acesso às suas informações ou de seus clientes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Como funciona o bloqueio de conflito de horários?</h4>
              <p className="text-sm text-slate-600 mt-2">
                O sistema valida no servidor qualquer agendamento antes de salvá-lo em uma transação atômica. Se um profissional já tiver atendimento agendado para o mesmo intervalo de tempo, o sistema recusa e avisa com precisão.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Posso vender pacotes de banho mensais?</h4>
              <p className="text-sm text-slate-600 mt-2">
                Sim! Você pode cadastrar planos de 4 banhos por exemplo, vincular ao cliente e debitar o saldo a cada visita do pet com controle automático de validade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm mt-auto">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              <PawPrint className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-base">PetFlow SaaS</span>
            <span className="text-xs text-slate-500">© 2026 PetFlow Inc. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link href="/login" className="hover:text-white transition-colors">Acesso ao Painel</Link>
            <Link href="/portal" className="hover:text-white transition-colors">Portal do Tutor</Link>
            <Link href="/superadmin" className="hover:text-white transition-colors">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
