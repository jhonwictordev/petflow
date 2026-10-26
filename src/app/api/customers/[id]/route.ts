import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getCustomerById, updateCustomer } from "@/services/customerService";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTenantSession();
    const customer = await getCustomerById(session.tenantId, params.id);
    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cliente não encontrado" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();
    const updated = await updateCustomer(session.tenantId, params.id, body, session.userId);
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao atualizar cliente" }, { status: 400 });
  }
}
