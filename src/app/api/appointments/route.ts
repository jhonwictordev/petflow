import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { getAppointments, createAppointment } from "@/services/appointmentService";

export async function GET(req: Request) {
  try {
    const session = await requireTenantSession();
    const { searchParams } = new URL(req.url);

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const professionalId = searchParams.get("professionalId") || undefined;
    const status = searchParams.get("status") || undefined;

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const appointments = await getAppointments(session.tenantId, {
      startDate,
      endDate,
      professionalId,
      status,
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error("Erro ao listar agendamentos:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    const appointment = await createAppointment(
      session.tenantId,
      body,
      session.userId
    );

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error("Erro ao criar agendamento:", error);
    const isConflict = error.message && error.message.includes("CONFLITO_HORARIO");
    return NextResponse.json(
      { error: error.message || "Erro ao agendar" },
      { status: isConflict ? 409 : 400 }
    );
  }
}
