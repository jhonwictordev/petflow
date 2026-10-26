import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, SessionPayload } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeEmail } from "@/lib/sanitization";

export async function POST(req: Request) {
  try {
    // 1. Obtenção do IP do cliente para mitigação de força bruta
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const body = await req.json();
    const email = sanitizeEmail(body.email);
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // 2. Proteção de Rate Limiting (Máximo 5 tentativas por minuto por IP/e-mail)
    const rateLimitKey = `login:${ip}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey, { windowMs: 60 * 1000, max: 5 });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Muitas tentativas de login consecutivas. Por favor, aguarde 1 minuto antes de tentar novamente.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o e-mail e a senha informados." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      // Registra tentativa com falha para auditoria
      await prisma.auditLog.create({
        data: {
          action: "SECURITY_FAILED_LOGIN_ATTEMPT",
          entityType: "User",
          entityId: user.id,
          ipAddress: ip,
          details: JSON.stringify({ email }),
        },
      });

      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o e-mail e a senha informados." },
        { status: 401 }
      );
    }

    // Se for SuperAdmin sem tenant, monta sessão de superadmin
    if (user.isSuperAdmin && user.memberships.length === 0) {
      const payload: SessionPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: true,
        role: "SUPERADMIN",
      };
      await setSessionCookie(payload);
      return NextResponse.json({
        success: true,
        user: payload,
        redirect: "/superadmin",
      });
    }

    // Tenant ativo preferencial (primeiro ativo)
    const activeMembership = user.memberships.find(
      (m) => m.status === "ACTIVE" && m.tenant.status !== "SUSPENDED"
    );

    if (!activeMembership && !user.isSuperAdmin) {
      return NextResponse.json(
        { error: "Sua conta ou empresa está suspensa. Entre em contato com o suporte." },
        { status: 403 }
      );
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
      tenantId: activeMembership?.tenantId,
      tenantSlug: activeMembership?.tenant.slug,
      tenantName: activeMembership?.tenant.name,
      role: (activeMembership?.role as any) || (user.isSuperAdmin ? "SUPERADMIN" : "EMPLOYEE"),
    };

    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
      user: payload,
      redirect: user.isSuperAdmin && !activeMembership ? "/superadmin" : "/app",
    });
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao autenticar." },
      { status: 500 }
    );
  }
}
