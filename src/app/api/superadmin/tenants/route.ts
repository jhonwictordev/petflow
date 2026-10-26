import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAllTenants, getPlatformMetrics, updateTenantStatus, updateTenantPlan } from "@/services/superAdminService";

export async function GET() {
  try {
    await requireSuperAdmin();
    const tenants = await getAllTenants();
    const platform = await getPlatformMetrics();
    return NextResponse.json({ tenants, platform });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Acesso negado" }, { status: 403 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSuperAdmin();
    const { tenantId, action, status, plan, reason } = await req.json();

    if (action === "UPDATE_STATUS") {
      const updated = await updateTenantStatus(tenantId, status, session.userId, reason);
      return NextResponse.json({ success: true, tenant: updated });
    }

    if (action === "UPDATE_PLAN") {
      const updated = await updateTenantPlan(tenantId, plan, session.userId);
      return NextResponse.json({ success: true, tenant: updated });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao processar" }, { status: 400 });
  }
}
