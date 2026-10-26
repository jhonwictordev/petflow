import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getCustomers, createCustomer } from "@/services/customerService";

export async function GET(req: Request) {
  try {
    const session = await requireTenantSession();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const customers = await getCustomers(session.tenantId, { search, status });
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const customer = await createCustomer(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cadastrar cliente" }, { status: 400 });
  }
}
