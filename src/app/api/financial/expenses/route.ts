import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getExpenses, createExpense, payExpense } from "@/services/financialService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const expenses = await getExpenses(session.tenantId);
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const expense = await createExpense(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao registrar despesa" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireTenantSession();
    const { expenseId, paymentMethod } = await req.json();

    const updated = await payExpense(session.tenantId, expenseId, paymentMethod || "PIX", session.userId);
    return NextResponse.json({ success: true, expense: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao liquidar despesa" }, { status: 400 });
  }
}
