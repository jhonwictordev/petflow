import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getProfessionals, createProfessional } from "@/services/professionalService";

export async function GET() {
  try {
    const session = await requireTenantSession();
    const professionals = await getProfessionals(session.tenantId);
    return NextResponse.json({ professionals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const professional = await createProfessional(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, professional });
  } catch (error: any) {
    const isLimit = error.message && error.message.includes("LIMITE_DO_PLANO");
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar profissional" },
      { status: isLimit ? 403 : 400 }
    );
  }
}
