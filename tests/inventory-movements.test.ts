import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createProduct, adjustStock } from "../src/services/inventoryService";

describe("Gestão de Estoque & Auditoria de Movimentações", () => {
  let tenant: any;
  let user: any;
  let testProduct: any;

  beforeAll(async () => {
    tenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });
    user = await prisma.user.findFirst({ where: { email: "owner@petflowdemo.com.br" } });
  });

  afterAll(async () => {
    if (testProduct) {
      await prisma.inventoryMovement.deleteMany({ where: { productId: testProduct.id } });
      await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("deve criar produto e gerar movimentação inicial de ENTRADA automaticamente", async () => {
    testProduct = await createProduct(
      tenant.id,
      {
        name: "Shampoo Teste Unitário 1L",
        sku: "TEST-SHAMP-1L",
        costPrice: 2000,
        salePrice: 4000,
        stockQuantity: 10,
        minStockAlert: 2,
        unit: "UN",
      },
      user?.id,
      "Carlos Admin"
    );

    expect(testProduct.id).toBeDefined();
    expect(testProduct.stockQuantity).toBe(10);

    const movements = await prisma.inventoryMovement.findMany({
      where: { productId: testProduct.id },
    });
    expect(movements.length).toBe(1);
    expect(movements[0].type).toBe("ENTRADA");
    expect(movements[0].previousStock).toBe(0);
    expect(movements[0].newStock).toBe(10);
  });

  it("deve rejeitar saída maior que o saldo em estoque com ESTOQUE_INSUFICIENTE", async () => {
    await expect(
      adjustStock(
        tenant.id,
        testProduct.id,
        {
          type: "SAIDA",
          quantity: 25, // Saldo é 10
          reason: "Tentativa de saída excessiva",
        },
        user?.id
      )
    ).rejects.toThrowError(/ESTOQUE_INSUFICIENTE/);
  });

  it("deve realizar saída válida e registrar histórico auditável", async () => {
    const updated = await adjustStock(
      tenant.id,
      testProduct.id,
      {
        type: "SAIDA",
        quantity: 4,
        reason: "Uso no banho do Thor",
      },
      user?.id,
      "Roberto Tosador"
    );

    expect(updated.stockQuantity).toBe(6); // 10 - 4 = 6

    const movements = await prisma.inventoryMovement.findMany({
      where: { productId: testProduct.id },
      orderBy: { createdAt: "desc" },
    });
    expect(movements.length).toBe(2);
    expect(movements[0].type).toBe("SAIDA");
    expect(movements[0].previousStock).toBe(10);
    expect(movements[0].newStock).toBe(6);
    expect(movements[0].performedBy).toBe("Roberto Tosador");
  });
});
