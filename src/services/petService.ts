import { prisma } from "@/lib/prisma";

export interface CreatePetDTO {
  customerId: string;
  name: string;
  photoUrl?: string;
  species?: string;
  breed?: string;
  size?: string;
  gender?: string;
  birthDate?: string | Date;
  weight?: number;
  notes?: string;
  handlingRestrictions?: string;
  careInstructions?: string;
}

export async function getPets(tenantId: string, params?: { customerId?: string; search?: string }) {
  const where: any = { tenantId };

  if (params?.customerId) {
    where.customerId = params.customerId;
  }

  if (params?.search) {
    where.name = { contains: params.search.trim() };
  }

  return prisma.pet.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      appointments: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPetById(tenantId: string, id: string) {
  const pet = await prisma.pet.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      appointments: {
        orderBy: { date: "desc" },
        include: { service: true, professional: true },
      },
      customerPackages: {
        include: { package: true },
      },
    },
  });

  if (!pet) {
    throw new Error("PET_NAO_ENCONTRADO");
  }

  return pet;
}

export async function createPet(tenantId: string, dto: CreatePetDTO, performedByUserId?: string) {
  // Valida se o cliente pertence ao mesmo tenant
  const customer = await prisma.customer.findFirst({
    where: { id: dto.customerId, tenantId },
  });

  if (!customer) {
    throw new Error("CLIENTE_INVALIDO_PARA_ESTE_TENANT");
  }

  const pet = await prisma.pet.create({
    data: {
      tenantId,
      customerId: dto.customerId,
      name: dto.name,
      photoUrl: dto.photoUrl,
      species: dto.species || "CANINE",
      breed: dto.breed,
      size: dto.size || "MEDIO",
      gender: dto.gender || "MALE",
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight,
      notes: dto.notes,
      handlingRestrictions: dto.handlingRestrictions,
      careInstructions: dto.careInstructions,
    },
    include: { customer: true },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_PET",
      entityType: "Pet",
      entityId: pet.id,
      details: JSON.stringify({ name: pet.name, customer: customer.name }),
    },
  });

  return pet;
}

export async function updatePet(
  tenantId: string,
  id: string,
  dto: Partial<CreatePetDTO>,
  performedByUserId?: string
) {
  const current = await prisma.pet.findFirst({
    where: { id, tenantId },
  });

  if (!current) {
    throw new Error("PET_NAO_ENCONTRADO");
  }

  const updated = await prisma.pet.update({
    where: { id },
    data: {
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
    },
    include: { customer: true },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "UPDATE_PET",
      entityType: "Pet",
      entityId: id,
      details: JSON.stringify(dto),
    },
  });

  return updated;
}
