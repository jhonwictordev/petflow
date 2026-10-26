import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "petflow_dev_secret_key_32_chars_long_minimum!";
const COOKIE_NAME = "petflow_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  role?: "OWNER" | "MANAGER" | "EMPLOYEE" | "RECEPTIONIST" | "SUPERADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Exige autenticação básica. Lança erro ou retorna a sessão.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Exige autenticação vinculada a um tenant específico.
 * Garante que o tenantId informado é verificado no banco de dados.
 */
export async function requireTenantSession(): Promise<SessionPayload & { tenantId: string; role: string }> {
  const session = await requireAuth();
  if (!session.tenantId) {
    throw new Error("NO_TENANT_SELECTED");
  }

  // Verifica no banco se a adesão do usuário ao tenant continua válida e ativa
  const membership = await prisma.membership.findUnique({
    where: {
      tenantId_userId: {
        tenantId: session.tenantId,
        userId: session.userId,
      },
    },
    include: {
      tenant: true,
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw new Error("FORBIDDEN_TENANT_ACCESS");
  }

  if (membership.tenant.status === "SUSPENDED") {
    throw new Error("TENANT_SUSPENDED");
  }

  return {
    ...session,
    tenantId: session.tenantId,
    role: membership.role as any,
    tenantName: membership.tenant.name,
    tenantSlug: membership.tenant.slug,
  };
}

/**
 * Exige privilégios de SuperAdmin do sistema
 */
export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!session.isSuperAdmin) {
    throw new Error("FORBIDDEN_SUPERADMIN_REQUIRED");
  }
  return session;
}
