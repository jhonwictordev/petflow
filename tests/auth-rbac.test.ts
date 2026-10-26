import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from "../src/lib/auth";
import { hasPermission, assertPermission } from "../src/lib/rbac";

describe("Segurança & Autenticação", () => {
  it("deve hashear e validar senhas com segurança via bcrypt", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const valid = await verifyPassword(raw, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("WrongPassword!", hash);
    expect(invalid).toBe(false);
  });

  it("deve assinar e verificar tokens JWT de sessão sem adulteração", () => {
    const payload = {
      userId: "user_123",
      email: "carlos@petflow.com",
      name: "Carlos",
      isSuperAdmin: false,
      tenantId: "tenant_abc",
      role: "OWNER" as const,
    };

    const token = signSessionToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.tenantId).toBe(payload.tenantId);
    expect(decoded?.role).toBe("OWNER");
  });

  it("deve recusar tokens adulterados ou corrompidos", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrompido.assinaturainvalida";
    const decoded = verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });
});

describe("Matriz de Permissões e RBAC", () => {
  it("Owner deve ter acesso irrestrito ao tenant e financeiro", () => {
    expect(hasPermission("OWNER", "tenant:manage")).toBe(true);
    expect(hasPermission("OWNER", "finance:manage")).toBe(true);
    expect(hasPermission("OWNER", "appointments:manage")).toBe(true);
    expect(hasPermission("OWNER", "customers:manage")).toBe(true);
  });

  it("Manager não deve poder alterar dados estruturais do tenant, mas gerencia operações", () => {
    expect(hasPermission("MANAGER", "tenant:manage")).toBe(false);
    expect(hasPermission("MANAGER", "finance:view")).toBe(true);
    expect(hasPermission("MANAGER", "appointments:manage")).toBe(true);
  });

  it("Employee e Receptionist não devem ter permissão de gerenciar finanças", () => {
    expect(hasPermission("EMPLOYEE", "finance:manage")).toBe(false);
    expect(hasPermission("RECEPTIONIST", "finance:manage")).toBe(false);
    expect(hasPermission("EMPLOYEE", "tenant:manage")).toBe(false);
  });

  it("deve lançar exceção explícita ao violar assertPermission", () => {
    expect(() => {
      assertPermission("EMPLOYEE", "finance:manage");
    }).toThrowError(/FORBIDDEN_INSUFFICIENT_PERMISSIONS/);
  });
});
