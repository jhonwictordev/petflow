import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/dashboardService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const metrics = await getDashboardMetrics(session.tenantId);
    return NextResponse.json({ metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}
