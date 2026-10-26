import { prisma } from "@/lib/prisma";

export interface CreateServiceDTO {
  name: string;
  description?: string;
  category?: string;
  basePrice: number; // Centavos
  durationMinutes: number;
  commissionRate?: number;
  priceSmall?: number;
  priceMedium?: number;
  priceLarge?: number;
  priceGiant?: number;
}

export async function getServices(tenantId: string) {
  return prisma.service.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function createService(tenantId: string, dto: CreateServiceDTO, performedByUserId?: string) {
  const service = await prisma.service.create({
    data: {
      tenantId,
      name: dto.name,
      description: dto.description,
      category: dto.category || "BANHO_E_TOSA",
      basePrice: dto.basePrice,
      durationMinutes: dto.durationMinutes,
      commissionRate: dto.commissionRate || 0,
      priceSmall: dto.priceSmall,
      priceMedium: dto.priceMedium,
      priceLarge: dto.priceLarge,
      priceGiant: dto.priceGiant,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_SERVICE",
      entityType: "Service",
      entityId: service.id,
      details: JSON.stringify({ name: service.name, basePrice: service.basePrice }),
    },
  });

  return service;
}

export async function updateService(
  tenantId: string,
  id: string,
  dto: Partial<CreateServiceDTO>,
  performedByUserId?: string
) {
  const current = await prisma.service.findFirst({
    where: { id, tenantId },
  });

  if (!current) {
    throw new Error("SERVICO_NAO_ENCONTRADO");
  }

  const updated = await prisma.service.update({
    where: { id },
    data: dto,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "UPDATE_SERVICE",
      entityType: "Service",
      entityId: id,
      details: JSON.stringify(dto),
    },
  });

  return updated;
}
