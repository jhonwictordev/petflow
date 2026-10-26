import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { updateAppointmentStatus, rescheduleAppointment } from "@/services/appointmentService";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTenantSession();
    const body = await req.json();

    if (body.action === "RESCHEDULE") {
      const updated = await rescheduleAppointment(
        session.tenantId,
        params.id,
        body.date,
        body.startTime,
        body.endTime,
        session.userId
      );
      return NextResponse.json({ success: true, appointment: updated });
    }

    if (body.status) {
      const updated = await updateAppointmentStatus(
        session.tenantId,
        params.id,
        body.status,
        session.userId
      );
      return NextResponse.json({ success: true, appointment: updated });
    }

    return NextResponse.json({ error: "Ação não especificada" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao atualizar agendamento:", error);
    const isConflict = error.message && error.message.includes("CONFLITO_HORARIO");
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar" },
      { status: isConflict ? 409 : 400 }
    );
  }
}
