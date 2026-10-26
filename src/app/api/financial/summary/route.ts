import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getFinancialSummary } from "@/services/financialService";

export async function GET(req: Request) {
  try {
    const session = await requireTenantSession();
    const { searchParams } = new URL(req.url);

    const period = searchParams.get("period") || "30d";
    const now = new Date();
    let startDate: Date | undefined;
    const endDate = new Date();

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "7d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "30d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    }

    const summary = await getFinancialSummary(session.tenantId, { startDate, endDate });
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}
