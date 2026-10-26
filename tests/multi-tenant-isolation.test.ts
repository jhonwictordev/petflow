import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { getCustomers } from "../src/services/customerService";
import { createPet } from "../src/services/petService";

describe("Isolamento Estrito Multi-Tenant", () => {
  let demoTenant: any;
  let auauTenant: any;

  beforeAll(async () => {
    demoTenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });
    auauTenant = await prisma.tenant.findUnique({ where: { slug: "auau" } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve carregar ambos os tenants de teste cadastrados no seed", () => {
    expect(demoTenant).not.toBeNull();
    expect(auauTenant).not.toBeNull();
    expect(demoTenant.id).not.toBe(auauTenant.id);
  });

  it("não deve permitir vazamento de clientes entre empresas concorrentes", async () => {
    // Busca clientes no escopo do Demo Tenant
    const demoCustomers = await getCustomers(demoTenant.id);

    // Busca clientes no escopo do AuAu Tenant
    const auauCustomers = await getCustomers(auauTenant.id);

    // Garante que o cliente exclusivo do AuAu não aparece no Demo
    const leakedCustomer = demoCustomers.find((c) => c.name.includes("AuAu"));
    expect(leakedCustomer).toBeUndefined();

    // Garante que o AuAu possui seu próprio cliente
    const auauSecret = auauCustomers.find((c) => c.name.includes("AuAu"));
    expect(auauSecret).toBeDefined();

    // Nenhum ID de cliente deve ser compartilhado
    const demoIds = new Set(demoCustomers.map((c) => c.id));
    const auauIds = auauCustomers.map((c) => c.id);
    for (const id of auauIds) {
      expect(demoIds.has(id)).toBe(false);
    }
  });

  it("deve impedir vincular um pet a um tutor pertencente a outro tenant (cross-tenant attack)", async () => {
    // Pega o cliente secreto do AuAu Tenant
    const auauCustomer = await prisma.customer.findFirst({
      where: { tenantId: auauTenant.id },
    });
    expect(auauCustomer).not.toBeNull();

    // Tenta cadastrar um pet no Demo Tenant apontando para o cliente do AuAu
    await expect(
      createPet(demoTenant.id, {
        customerId: auauCustomer!.id,
        name: "Hacker Dog",
        species: "CANINE",
      })
    ).rejects.toThrowError(/CLIENTE_INVALIDO_PARA_ESTE_TENANT/);
  });
});
