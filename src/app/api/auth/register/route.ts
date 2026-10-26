import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, SessionPayload } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const {
      companyName,
      tradeName,
      document,
      phone,
      userName,
      email,
      password,
      plan = "PRO",
    } = await req.json();

    if (!companyName || !userName || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verifica se já existe usuário com este e-mail
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este e-mail. Faça login para continuar." },
        { status: 400 }
      );
    }

    // Gera slug único para a empresa
    let baseSlug = slugify(companyName);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let maxProfessionals = 2;
    if (plan === "PRO") maxProfessionals = 10;
    if (plan === "BUSINESS") maxProfessionals = 50;

    const passwordHash = await hashPassword(password);

    // Cria Tenant e Usuário em transação atômica
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          tradeName: tradeName || companyName,
          slug,
          document,
          phone,
          email: cleanEmail,
          plan,
          status: "ACTIVE",
          maxProfessionals,
          maxUnits: plan === "BUSINESS" ? 3 : 1,
        },
      });

      const user = await tx.user.create({
        data: {
          name: userName,
          email: cleanEmail,
          passwordHash,
          phone,
          isSuperAdmin: false,
        },
      });

      await tx.membership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      // Cadastra serviços padrão essenciais para início rápido
      await tx.service.createMany({
        data: [
          {
            tenantId: tenant.id,
            name: "Banho Tradicional",
            description: "Banho completo com água morna e secagem",
            category: "BANHO_E_TOSA",
            basePrice: 6000,
            durationMinutes: 45,
            commissionRate: 15.0,
          },
          {
            tenantId: tenant.id,
            name: "Tosa Higiênica",
            description: "Aparamento de patinhas e higiene íntima",
            category: "BANHO_E_TOSA",
            basePrice: 4000,
            durationMinutes: 30,
            commissionRate: 15.0,
          },
          {
            tenantId: tenant.id,
            name: "Banho & Tosa Geral",
            description: "Banho com tosa da raça e finalização",
            category: "BANHO_E_TOSA",
            basePrice: 11000,
            durationMinutes: 90,
            commissionRate: 20.0,
          },
        ],
      });

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: "ONBOARDING_TENANT",
          entityType: "Tenant",
          entityId: tenant.id,
          details: JSON.stringify({ companyName, plan }),
        },
      });

      return { tenant, user };
    });

    const payload: SessionPayload = {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      isSuperAdmin: false,
      tenantId: result.tenant.id,
      tenantSlug: result.tenant.slug,
      tenantName: result.tenant.name,
      role: "OWNER",
    };

    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
      user: payload,
      redirect: "/app",
    });
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro ao criar nova empresa. Tente novamente." },
      { status: 500 }
    );
  }
}
