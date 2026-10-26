import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics(tenantId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Agendamentos de Hoje
  const todayAppointments = await prisma.appointment.count({
    where: {
      tenantId,
      date: { gte: startOfToday, lte: endOfToday },
      status: { notIn: ["CANCELADO", "FALTOU"] },
    },
  });

  // 2. Agendamentos Pendentes (não concluídos nem cancelados)
  const pendingAppointments = await prisma.appointment.count({
    where: {
      tenantId,
      status: { in: ["AGENDADO", "CONFIRMADO"] },
    },
  });

  // 3. Serviços Concluídos no Mês
  const completedMonthServices = await prisma.appointment.count({
    where: {
      tenantId,
      status: "CONCLUIDO",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  // 4. Receita Recebida no Mês
  const monthPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      status: "PAID",
      paidAt: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { amount: true },
  });
  const monthRevenue = monthPayments.reduce((acc, p) => acc + p.amount, 0);

  // 5. Valores a Receber (Total pendente em agendamentos ativos)
  const pendingReceivablesList = await prisma.appointment.findMany({
    where: {
      tenantId,
      paymentStatus: "PENDING",
      status: { notIn: ["CANCELADO", "FALTOU"] },
    },
    select: { price: true },
  });
  const totalReceivables = pendingReceivablesList.reduce((acc, a) => acc + a.price, 0);

  // 6. Clientes Ativos
  const activeCustomers = await prisma.customer.count({
    where: { tenantId, status: "ACTIVE" },
  });

  // 7. Pets Cadastrados
  const totalPets = await prisma.pet.count({
    where: { tenantId, status: "ACTIVE" },
  });

  // 8. Profissionais Ativos
  const activeProfessionals = await prisma.professional.count({
    where: { tenantId, status: "ACTIVE" },
  });

  // 9. Serviços Mais Vendidos (Top 5)
  const appointmentsWithServices = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { notIn: ["CANCELADO"] },
    },
    select: {
      service: { select: { id: true, name: true, category: true } },
      price: true,
    },
  });

  const serviceCountMap: Record<string, { name: string; count: number; totalRevenue: number }> = {};
  for (const appt of appointmentsWithServices) {
    const sId = appt.service.id;
    if (!serviceCountMap[sId]) {
      serviceCountMap[sId] = { name: appt.service.name, count: 0, totalRevenue: 0 };
    }
    serviceCountMap[sId].count += 1;
    serviceCountMap[sId].totalRevenue += appt.price;
  }

  const topServices = Object.values(serviceCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 10. Evolução de Receita dos Últimos 7 Dias
  const last7DaysChartData: { date: string; displayDate: string; revenue: number; appointments: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const dayPayments = await prisma.payment.findMany({
      where: {
        tenantId,
        status: "PAID",
        paidAt: { gte: dayStart, lte: dayEnd },
      },
      select: { amount: true },
    });
    const rev = dayPayments.reduce((acc, p) => acc + p.amount, 0) / 100; // Em reais para o gráfico

    const dayAppts = await prisma.appointment.count({
      where: {
        tenantId,
        date: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELADO"] },
      },
    });

    const displayDate = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" }).format(d);
    last7DaysChartData.push({
      date: d.toISOString().split("T")[0],
      displayDate,
      revenue: rev,
      appointments: dayAppts,
    });
  }

  // 11. Alerta de Estoque Baixo
  const lowStockProducts = await prisma.product.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    take: 5,
  });
  const actualLowStock = lowStockProducts.filter((p) => p.stockQuantity <= p.minStockAlert);

  // 12. Próximos Atendimentos do Dia
  const todayUpcoming = await prisma.appointment.findMany({
    where: {
      tenantId,
      date: { gte: startOfToday, lte: endOfToday },
      status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] },
    },
    include: {
      customer: { select: { name: true, phone: true } },
      pet: { select: { name: true, breed: true, size: true } },
      professional: { select: { name: true, colorHex: true } },
      service: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
    take: 6,
  });

  return {
    todayAppointments,
    pendingAppointments,
    completedMonthServices,
    monthRevenue,        // Centavos
    totalReceivables,    // Centavos
    activeCustomers,
    totalPets,
    activeProfessionals,
    topServices,
    last7DaysChartData,
    actualLowStock,
    todayUpcoming,
  };
}
