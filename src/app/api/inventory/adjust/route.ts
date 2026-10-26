import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { adjustStock } from "@/services/inventoryService";

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const { productId, type, quantity, reason } = await req.json();

    const updated = await adjustStock(
      session.tenantId,
      productId,
      { type, quantity: Number(quantity), reason },
      session.userId,
      session.name
    );

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao movimentar estoque" }, { status: 400 });
  }
}
