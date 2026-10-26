import { prisma } from "@/lib/prisma";

export interface CreateCustomerDTO {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  contactPreference?: string;
}

export async function getCustomers(
  tenantId: string,
  params?: {
    search?: string;
    status?: string;
  }
) {
  const where: any = { tenantId };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params?.search) {
    const s = params.search.trim();
    where.OR = [
      { name: { contains: s } },
      { phone: { contains: s } },
      { email: { contains: s } },
      { document: { contains: s } },
    ];
  }

  return prisma.customer.findMany({
    where,
    include: {
      pets: { select: { id: true, name: true, breed: true, species: true, size: true } },
      appointments: {
        select: { id: true, date: true, status: true, price: true },
        orderBy: { date: "desc" },
        take: 3,
      },
      customerPackages: {
        where: { status: "ACTIVE" },
        include: { package: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerById(tenantId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, tenantId },
    include: {
      pets: {
        include: {
          appointments: {
            orderBy: { date: "desc" },
            take: 5,
            include: { service: true, professional: true },
          },
        },
      },
      appointments: {
        orderBy: { date: "desc" },
        include: {
          pet: true,
          service: true,
          professional: true,
          payments: true,
        },
      },
      customerPackages: {
        include: { package: true, pet: true },
      },
    },
  });

  if (!customer) {
    throw new Error("CLIENTE_NAO_ENCONTRADO");
  }

  return customer;
}

export async function createCustomer(tenantId: string, dto: CreateCustomerDTO, performedByUserId?: string) {
  // Previne duplicidade por telefone no mesmo tenant
  const existing = await prisma.customer.findFirst({
    where: {
      tenantId,
      phone: dto.phone,
    },
  });

  if (existing) {
    throw new Error(`CLIENTE_JA_CADASTRADO: Já existe um cliente com o telefone ${dto.phone}`);
  }

  const customer = await prisma.customer.create({
    data: {
      tenantId,
      name: dto.name,
      phone: dto.phone,
      whatsapp: dto.whatsapp || dto.phone,
      email: dto.email,
      document: dto.document,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      notes: dto.notes,
      contactPreference: dto.contactPreference || "WHATSAPP",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_CUSTOMER",
      entityType: "Customer",
      entityId: customer.id,
      details: JSON.stringify({ name: customer.name, phone: customer.phone }),
    },
  });

  return customer;
}

export async function updateCustomer(
  tenantId: string,
  id: string,
  dto: Partial<CreateCustomerDTO>,
  performedByUserId?: string
) {
  const customer = await prisma.customer.findFirst({
    where: { id, tenantId },
  });

  if (!customer) {
    throw new Error("CLIENTE_NAO_ENCONTRADO");
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: dto,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "UPDATE_CUSTOMER",
      entityType: "Customer",
      entityId: id,
      details: JSON.stringify(dto),
    },
  });

  return updated;
}
