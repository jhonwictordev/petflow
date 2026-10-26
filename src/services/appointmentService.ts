import { prisma } from "@/lib/prisma";

export interface CreateAppointmentDTO {
  customerId: string;
  petId: string;
  professionalId: string;
  serviceId: string;
  date: string | Date; // YYYY-MM-DD
  startTime: string;   // "09:00"
  endTime: string;     // "10:00"
  durationMinutes: number;
  price: number;       // Centavos
  notes?: string;
}

/**
 * Converte "HH:MM" para minutos desde o início do dia
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Verifica se dois intervalos [startA, endA) e [startB, endB) se sobrepõem
 */
function hasOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

export async function getAppointments(
  tenantId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    professionalId?: string;
    status?: string;
  }
) {
  const where: any = { tenantId };

  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  } else if (filters?.startDate) {
    where.date = { gte: filters.startDate };
  }

  if (filters?.professionalId && filters?.professionalId !== "ALL") {
    where.professionalId = filters.professionalId;
  }

  if (filters?.status && filters?.status !== "ALL") {
    where.status = filters.status;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, phone: true, whatsapp: true } },
      pet: { select: { id: true, name: true, breed: true, size: true, species: true } },
      professional: { select: { id: true, name: true, colorHex: true } },
      service: { select: { id: true, name: true, category: true, durationMinutes: true } },
      payments: true,
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
    ],
  });
}

/**
 * Criação atômica de agendamento com validação estrita de conflito de horário
 */
export async function createAppointment(
  tenantId: string,
  dto: CreateAppointmentDTO,
  performedByUserId?: string
) {
  const dateObj = new Date(dto.date);
  dateObj.setUTCHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    // 1. Busca todos os agendamentos ativos do profissional nessa mesma data
    const existing = await tx.appointment.findMany({
      where: {
        tenantId,
        professionalId: dto.professionalId,
        date: dateObj,
        status: { notIn: ["CANCELADO", "FALTOU"] },
      },
      select: { id: true, startTime: true, endTime: true, customer: { select: { name: true } } },
    });

    // 2. Verifica se há colisão de horários
    for (const appt of existing) {
      if (hasOverlap(dto.startTime, dto.endTime, appt.startTime, appt.endTime)) {
        throw new Error(
          `CONFLITO_HORARIO: O profissional já possui um agendamento (${appt.startTime} às ${appt.endTime}) com ${appt.customer.name}`
        );
      }
    }

    // 3. Cria o agendamento
    const newAppointment = await tx.appointment.create({
      data: {
        tenantId,
        customerId: dto.customerId,
        petId: dto.petId,
        professionalId: dto.professionalId,
        serviceId: dto.serviceId,
        date: dateObj,
        startTime: dto.startTime,
        endTime: dto.endTime,
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        notes: dto.notes,
        status: "AGENDADO",
        paymentStatus: "PENDING",
      },
      include: {
        customer: true,
        pet: true,
        professional: true,
        service: true,
      },
    });

    // 4. Registra auditoria
    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "CREATE_APPOINTMENT",
        entityType: "Appointment",
        entityId: newAppointment.id,
        details: JSON.stringify({
          pet: newAppointment.pet.name,
          service: newAppointment.service.name,
          date: dto.date,
          time: `${dto.startTime}-${dto.endTime}`,
        }),
      },
    });

    return newAppointment;
  });
}

export async function updateAppointmentStatus(
  tenantId: string,
  appointmentId: string,
  newStatus: string,
  performedByUserId?: string
) {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId },
  });

  if (!appt) {
    throw new Error("AGENDAMENTO_NAO_ENCONTRADO");
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus },
    include: {
      customer: true,
      pet: true,
      professional: true,
      service: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "UPDATE_APPOINTMENT_STATUS",
      entityType: "Appointment",
      entityId: appointmentId,
      details: JSON.stringify({ oldStatus: appt.status, newStatus }),
    },
  });

  return updated;
}

export async function rescheduleAppointment(
  tenantId: string,
  appointmentId: string,
  newDate: string | Date,
  newStartTime: string,
  newEndTime: string,
  performedByUserId?: string
) {
  const targetDate = new Date(newDate);
  targetDate.setUTCHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    if (!current) {
      throw new Error("AGENDAMENTO_NAO_ENCONTRADO");
    }

    // Checa conflito
    const conflicting = await tx.appointment.findMany({
      where: {
        tenantId,
        professionalId: current.professionalId,
        date: targetDate,
        id: { not: appointmentId },
        status: { notIn: ["CANCELADO", "FALTOU"] },
      },
    });

    for (const appt of conflicting) {
      if (hasOverlap(newStartTime, newEndTime, appt.startTime, appt.endTime)) {
        throw new Error(
          `CONFLITO_HORARIO: O profissional já possui um agendamento das ${appt.startTime} às ${appt.endTime}`
        );
      }
    }

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        date: targetDate,
        startTime: newStartTime,
        endTime: newEndTime,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "RESCHEDULE_APPOINTMENT",
        entityType: "Appointment",
        entityId: appointmentId,
        details: JSON.stringify({
          previousDate: current.date,
          previousTime: `${current.startTime}-${current.endTime}`,
          newDate: targetDate,
          newTime: `${newStartTime}-${newEndTime}`,
        }),
      },
    });

    return updated;
  });
}
