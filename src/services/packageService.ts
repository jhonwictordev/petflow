import { prisma } from "@/lib/prisma";

export async function getPackages(tenantId: string) {
  return prisma.petPackage.findMany({
    where: { tenantId },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPackage(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    price: number; // Centavos
    totalUses: number;
    validityDays: number;
    serviceId?: string;
  },
  performedByUserId?: string
) {
  const pkg = await prisma.petPackage.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      price: data.price,
      totalUses: data.totalUses,
      validityDays: data.validityDays,
      serviceId: data.serviceId,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedByUserId,
      action: "CREATE_PACKAGE",
      entityType: "PetPackage",
      entityId: pkg.id,
      details: JSON.stringify({ name: pkg.name, price: pkg.price }),
    },
  });

  return pkg;
}

export async function assignPackageToCustomer(
  tenantId: string,
  data: {
    customerId: string;
    packageId: string;
    petId?: string;
  },
  performedByUserId?: string
) {
  const pkg = await prisma.petPackage.findFirst({
    where: { id: data.packageId, tenantId },
  });

  if (!pkg) throw new Error("PACOTE_NAO_ENCONTRADO");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + pkg.validityDays);

  return prisma.$transaction(async (tx) => {
    const customerPackage = await tx.customerPackage.create({
      data: {
        tenantId,
        customerId: data.customerId,
        packageId: data.packageId,
        petId: data.petId,
        totalCredits: pkg.totalUses,
        remainingCredits: pkg.totalUses,
        expiresAt,
        status: "ACTIVE",
      },
    });

    // Registra recebimento financeiro do pacote
    await tx.payment.create({
      data: {
        tenantId,
        amount: pkg.price,
        method: "PIX",
        status: "PAID",
        paidAt: new Date(),
        notes: `Aquisição do pacote: ${pkg.name}`,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "ASSIGN_PACKAGE",
        entityType: "CustomerPackage",
        entityId: customerPackage.id,
        details: JSON.stringify({ package: pkg.name, credits: pkg.totalUses }),
      },
    });

    return customerPackage;
  });
}

export async function consumePackageCredit(
  tenantId: string,
  customerPackageId: string,
  performedByUserId?: string
) {
  return prisma.$transaction(async (tx) => {
    const cp = await tx.customerPackage.findFirst({
      where: { id: customerPackageId, tenantId },
      include: { package: true },
    });

    if (!cp) throw new Error("PACOTE_DO_CLIENTE_NAO_ENCONTRADO");

    if (cp.remainingCredits <= 0) {
      throw new Error("SALDO_INSUFICIENTE: O pacote não possui mais créditos disponíveis.");
    }

    if (new Date() > cp.expiresAt) {
      await tx.customerPackage.update({
        where: { id: customerPackageId },
        data: { status: "EXPIRED" },
      });
      throw new Error("PACOTE_EXPIRADO: A validade deste pacote expirou.");
    }

    const nextRemaining = cp.remainingCredits - 1;
    const newStatus = nextRemaining === 0 ? "EXHAUSTED" : "ACTIVE";

    const updated = await tx.customerPackage.update({
      where: { id: customerPackageId },
      data: {
        remainingCredits: nextRemaining,
        status: newStatus,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "CONSUME_PACKAGE_CREDIT",
        entityType: "CustomerPackage",
        entityId: customerPackageId,
        details: JSON.stringify({ remainingCredits: nextRemaining }),
      },
    });

    return updated;
  });
}
