import { prisma } from "@/lib/prisma";

export interface CreateProductDTO {
  name: string;
  sku?: string;
  category?: string;
  costPrice: number; // Centavos
  salePrice: number; // Centavos
  stockQuantity: number;
  minStockAlert?: number;
  unit?: string;
  supplier?: string;
}

export async function getProducts(tenantId: string) {
  return prisma.product.findMany({
    where: { tenantId },
    include: {
      inventoryMovements: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createProduct(
  tenantId: string,
  dto: CreateProductDTO,
  performedByUserId?: string,
  performedByName?: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        tenantId,
        name: dto.name,
        sku: dto.sku,
        category: dto.category || "GERAL",
        costPrice: dto.costPrice,
        salePrice: dto.salePrice,
        stockQuantity: dto.stockQuantity,
        minStockAlert: dto.minStockAlert || 5,
        unit: dto.unit || "UN",
        supplier: dto.supplier,
      },
    });

    if (dto.stockQuantity > 0) {
      await tx.inventoryMovement.create({
        data: {
          tenantId,
          productId: product.id,
          type: "ENTRADA",
          quantity: dto.stockQuantity,
          previousStock: 0,
          newStock: dto.stockQuantity,
          reason: "Cadastro inicial de produto",
          performedBy: performedByName || "Sistema",
        },
      });
    }

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: product.id,
        details: JSON.stringify({ name: product.name, sku: product.sku }),
      },
    });

    return product;
  });
}

export async function adjustStock(
  tenantId: string,
  productId: string,
  adjustment: {
    type: "ENTRADA" | "SAIDA" | "AJUSTE";
    quantity: number;
    reason: string;
  },
  performedByUserId?: string,
  performedByName?: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) throw new Error("PRODUTO_NAO_ENCONTRADO");

    let newStock = product.stockQuantity;

    if (adjustment.type === "ENTRADA") {
      newStock += adjustment.quantity;
    } else if (adjustment.type === "SAIDA") {
      if (product.stockQuantity < adjustment.quantity) {
        throw new Error(
          `ESTOQUE_INSUFICIENTE: Saldo atual (${product.stockQuantity}) é inferior à saída (${adjustment.quantity})`
        );
      }
      newStock -= adjustment.quantity;
    } else if (adjustment.type === "AJUSTE") {
      newStock = adjustment.quantity; // Novo valor absoluto
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: newStock },
    });

    await tx.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type: adjustment.type,
        quantity: Math.abs(newStock - product.stockQuantity),
        previousStock: product.stockQuantity,
        newStock,
        reason: adjustment.reason,
        performedBy: performedByName || "Sistema",
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: performedByUserId,
        action: "ADJUST_STOCK",
        entityType: "Product",
        entityId: productId,
        details: JSON.stringify({
          previousStock: product.stockQuantity,
          newStock,
          type: adjustment.type,
          reason: adjustment.reason,
        }),
      },
    });

    return updatedProduct;
  });
}
