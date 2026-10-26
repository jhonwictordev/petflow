import { prisma } from "@/lib/prisma";

export async function getAllTenants() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          customers: true,
          pets: true,
          professionals: true,
          appointments: true,
          payments: true,
        },
      },
      memberships: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tenants;
}

export async function getPlatformMetrics() {
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { status: "ACTIVE" } });
  const totalUsers = await prisma.user.count({ where: { isSuperAdmin: false } });
  const totalAppointments = await prisma.appointment.count();
  
  // Total transacionado na plataforma
  const allPayments = await prisma.payment.findMany({
    where: { status: "PAID" },
    select: { amount: true },
  });
  const totalPlatformVolume = allPayments.reduce((acc, p) => acc + p.amount, 0);

  // Distribuição de planos
  const starterCount = await prisma.tenant.count({ where: { plan: "STARTER" } });
  const proCount = await prisma.tenant.count({ where: { plan: "PRO" } });
  const businessCount = await prisma.tenant.count({ where: { plan: "BUSINESS" } });

  // MRR estimado
  // STARTER: R$ 79, PRO: R$ 149, BUSINESS: R$ 299
  const estimatedMRR = starterCount * 7900 + proCount * 14900 + businessCount * 29900;

  return {
    totalTenants,
    activeTenants,
    totalUsers,
    totalAppointments,
    totalPlatformVolume,
    planDistribution: {
      STARTER: starterCount,
      PRO: proCount,
      BUSINESS: businessCount,
    },
    estimatedMRR,
  };
}

export async function updateTenantStatus(
  tenantId: string,
  newStatus: "ACTIVE" | "SUSPENDED" | "TRIAL",
  adminUserId: string,
  reason?: string
) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("TENANT_NAO_ENCONTRADO");

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: adminUserId,
      action: "SUPERADMIN_UPDATE_TENANT_STATUS",
      entityType: "Tenant",
      entityId: tenantId,
      details: JSON.stringify({ oldStatus: tenant.status, newStatus, reason }),
    },
  });

  return updated;
}

export async function updateTenantPlan(
  tenantId: string,
  newPlan: "STARTER" | "PRO" | "BUSINESS",
  adminUserId: string
) {
  let maxProfessionals = 2;
  let maxUnits = 1;

  if (newPlan === "PRO") {
    maxProfessionals = 10;
    maxUnits = 1;
  } else if (newPlan === "BUSINESS") {
    maxProfessionals = 50;
    maxUnits = 5;
  }

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      plan: newPlan,
      maxProfessionals,
      maxUnits,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: adminUserId,
      action: "SUPERADMIN_UPDATE_TENANT_PLAN",
      entityType: "Tenant",
      entityId: tenantId,
      details: JSON.stringify({ plan: newPlan, maxProfessionals, maxUnits }),
    },
  });

  return updated;
}
