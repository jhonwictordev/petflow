import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getProducts, createProduct } from "@/services/inventoryService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const products = await getProducts(session.tenantId);
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const product = await createProduct(session.tenantId, body, session.userId, session.name);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao criar produto" }, { status: 400 });
  }
}
