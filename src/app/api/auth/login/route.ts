import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken, setSessionCookie, SessionPayload } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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
