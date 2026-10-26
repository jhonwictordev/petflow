import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getPets, createPet } from "@/services/petService";

export async function GET(req: Request) {
  try {
    const session = await requireTenantSession();
    const { searchParams } = new URL(req.url);

    const customerId = searchParams.get("customerId") || undefined;
    const search = searchParams.get("search") || undefined;

    const pets = await getPets(session.tenantId, { customerId, search });
    return NextResponse.json({ pets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const pet = await createPet(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, pet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cadastrar pet" }, { status: 400 });
  }
}
