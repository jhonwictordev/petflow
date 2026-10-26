import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { getFinancialSummary, createPayment, createExpense, payExpense } from "../src/services/financialService";
import { parseCurrencyToCents, formatCurrency } from "../src/lib/utils";

describe("Integridade Financeira & Moeda em Centavos Inteiros", () => {
  let tenant: any;

  beforeAll(async () => {
    tenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve converter valores em reais para centavos sem imprecisão de float", () => {
    expect(parseCurrencyToCents("85,50")).toBe(8550);
    expect(parseCurrencyToCents("1.250,90")).toBe(125090);
    expect(parseCurrencyToCents(85.5)).toBe(8550);
    expect(formatCurrency(8550)).toContain("85,50");
  });

  it("deve calcular o resumo financeiro com integridade aritmética perfeita", async () => {
    const summary = await getFinancialSummary(tenant.id);

    expect(typeof summary.totalRevenue).toBe("number");
    expect(typeof summary.totalPaidExpenses).toBe("number");
    expect(typeof summary.netCashFlow).toBe("number");

    // Saldo Líquido DEVE ser exatamente: Receita Realizada - Despesas Pagas
    expect(summary.netCashFlow).toBe(summary.totalRevenue - summary.totalPaidExpenses);

    // Valores a receber devem ser separados e não inflar o saldo em caixa
    expect(summary.pendingReceivables).toBeGreaterThanOrEqual(0);
  });
});
