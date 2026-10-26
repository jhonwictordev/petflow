import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getPackages, createPackage, assignPackageToCustomer } from "@/services/packageService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const packages = await getPackages(session.tenantId);
    return NextResponse.json({ packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    if (body.action === "ASSIGN") {
      const customerPackage = await assignPackageToCustomer(
        session.tenantId,
        {
          customerId: body.customerId,
          packageId: body.packageId,
          petId: body.petId,
        },
        session.userId
      );
      return NextResponse.json({ success: true, customerPackage });
    }

    const pkg = await createPackage(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao processar pacote" }, { status: 400 });
  }
}
