import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getServices, createService } from "@/services/serviceCatalogService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const services = await getServices(session.tenantId);
    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const service = await createService(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao criar serviço" }, { status: 400 });
  }
}
