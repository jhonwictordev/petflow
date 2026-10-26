import { prisma } from "@/lib/prisma";

export interface CreateProfessionalDTO {
  name: string;
  email?: string;
  phone?: string;
  roleTitle?: string;
  commissionRate?: number;
  workDays?: string;
  startTime?: string;
  endTime?: string;
  colorHex?: string;
}

export async function getProfessionals(tenantId: string) {
  return prisma.professional.findMany({
    where: { tenantId },
    include: {
      appointments: {
        where: {
          status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] },
        },
        select: { id: true, date: true, startTime: true, endTime: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createProfessional(
  tenantId: string,
  dto: CreateProfessionalDTO,
  performedByUserId?: string
) {
  // Verifica limite do plano do tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { professionals: true } } },
  });

  if (!tenant) throw new Error("TENANT_NAO_ENCONTRADO");

  if (tenant._count.professionals >= tenant.maxProfessionals) {
    throw new Error(
      `LIMITE_DO_PLANO_ATINGIDO: O plano atual (${tenant.plan}) permite no máximo ${tenant.maxProfessionals} profissionais. Faça um upgrade para adicionar mais.`
    );
  }

  const professional = await prisma.professional.create({
    data: {
      tenantId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      roleTitle: dto.roleTitle || "Banhista/Tosador",
      commissionRate: dto.commissionRate || 0,
      workDays: dto.workDays || "1,2,3,4,5,6",
      startTime: dto.startTime || "08:00",
      endTime: dto.endTime || "18:00",
      colorHex: dto.colorHex || "#10B981",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_PROFESSIONAL",
      entityType: "Professional",
      entityId: professional.id,
      details: JSON.stringify({ name: professional.name }),
    },
  });

  return professional;
}

export async function updateProfessional(
  tenantId: string,
  id: string,
  dto: Partial<CreateProfessionalDTO>,
  performedByUserId?: string
) {
  const current = await prisma.professional.findFirst({
    where: { id, tenantId },
  });

  if (!current) {
    throw new Error("PROFISSIONAL_NAO_ENCONTRADO");
  }

  const updated = await prisma.professional.update({
    where: { id },
    data: dto,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "UPDATE_PROFESSIONAL",
      entityType: "Professional",
      entityId: id,
      details: JSON.stringify(dto),
    },
  });

  return updated;
}
