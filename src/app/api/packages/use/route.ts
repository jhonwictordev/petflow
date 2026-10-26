import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { consumePackageCredit } from "@/services/packageService";

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const { customerPackageId } = await req.json();

    const updated = await consumePackageCredit(
      session.tenantId,
      customerPackageId,
      session.userId
    );

    return NextResponse.json({ success: true, customerPackage: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao utilizar crédito" }, { status: 400 });
  }
}
