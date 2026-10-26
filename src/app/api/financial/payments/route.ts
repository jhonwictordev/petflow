import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getPayments, createPayment } from "@/services/financialService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const payments = await getPayments(session.tenantId);
    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const payment = await createPayment(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao registrar pagamento" }, { status: 400 });
  }
}
