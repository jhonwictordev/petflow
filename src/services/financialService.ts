import { prisma } from "@/lib/prisma";

export async function getFinancialSummary(
  tenantId: string,
  params?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  const paymentWhere: any = { tenantId, status: "PAID" };
  const expenseWhere: any = { tenantId };

  if (params?.startDate && params?.endDate) {
    paymentWhere.paidAt = { gte: params.startDate, lte: params.endDate };
    expenseWhere.dueDate = { gte: params.startDate, lte: params.endDate };
  }

  // 1. Receita Realizada (Pagamentos com status PAID)
  const paidPayments = await prisma.payment.findMany({
    where: paymentWhere,
    select: { amount: true, method: true, paidAt: true },
  });
  const totalRevenue = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  // 2. Valores a Receber (Agendamentos com pagamento PENDING)
  const pendingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      paymentStatus: "PENDING",
      status: { notIn: ["CANCELADO", "FALTOU"] },
    },
    select: { price: true },
  });
  const pendingReceivables = pendingAppointments.reduce((acc, a) => acc + a.price, 0);

  // 3. Despesas (Pagas e Pendentes)
  const expenses = await prisma.expense.findMany({
    where: expenseWhere,
    select: { amount: true, status: true, category: true },
  });
  const totalPaidExpenses = expenses
    .filter((e) => e.status === "PAID")
    .reduce((acc, e) => acc + e.amount, 0);
  const totalPendingExpenses = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((acc, e) => acc + e.amount, 0);

  // 4. Saldo Operacional Líquido
  const netCashFlow = totalRevenue - totalPaidExpenses;

  // 5. Receita por método de pagamento
  const revenueByMethod: Record<string, number> = {};
  for (const p of paidPayments) {
    revenueByMethod[p.method] = (revenueByMethod[p.method] || 0) + p.amount;
  }

  return {
    totalRevenue,            // Centavos
    pendingReceivables,      // Centavos
    totalPaidExpenses,       // Centavos
    totalPendingExpenses,    // Centavos
    netCashFlow,             // Centavos
    revenueByMethod,
  };
}

export async function getPayments(tenantId: string) {
  return prisma.payment.findMany({
    where: { tenantId },
    include: {
      appointment: {
        include: {
          customer: { select: { name: true, phone: true } },
          pet: { select: { name: true } },
          service: { select: { name: true } },
        },
      },
      sale: {
        include: { customer: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPayment(
  tenantId: string,
  data: {
    appointmentId?: string;
    saleId?: string;
    amount: number; // Centavos
    method: string;
    notes?: string;
  },
  performedByUserId?: string
) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        tenantId,
        appointmentId: data.appointmentId,
        saleId: data.saleId,
        amount: data.amount,
        method: data.method,
        status: "PAID",
        paidAt: new Date(),
        notes: data.notes,
      },
    });

    if (data.appointmentId) {
      await tx.appointment.update({
        where: { id: data.appointmentId },
        data: { paymentStatus: "PAID" },
      });
    }

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "CREATE_PAYMENT",
        entityType: "Payment",
        entityId: payment.id,
        details: JSON.stringify({ amount: data.amount, method: data.method }),
      },
    });

    return payment;
  });
}

export async function getExpenses(tenantId: string) {
  return prisma.expense.findMany({
    where: { tenantId },
    orderBy: { dueDate: "asc" },
  });
}

export async function createExpense(
  tenantId: string,
  data: {
    description: string;
    category: string;
    amount: number; // Centavos
    dueDate: string | Date;
    notes?: string;
  },
  performedByUserId?: string
) {
  const expense = await prisma.expense.create({
    data: {
      tenantId,
      description: data.description,
      category: data.category,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      status: "PENDING",
      notes: data.notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_EXPENSE",
      entityType: "Expense",
      entityId: expense.id,
      details: JSON.stringify({ description: data.description, amount: data.amount }),
    },
  });

  return expense;
}

export async function payExpense(
  tenantId: string,
  expenseId: string,
  paymentMethod: string,
  performedByUserId?: string
) {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tenantId },
  });

  if (!expense) throw new Error("DESPESA_NAO_ENCONTRADA");

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "PAY_EXPENSE",
      entityType: "Expense",
      entityId: expenseId,
      details: JSON.stringify({ amount: expense.amount, paymentMethod }),
    },
  });

  return updated;
}
