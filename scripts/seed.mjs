import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log("🌱 Iniciando o Seed do PetFlow...");

  // Limpa registros anteriores para permitir re-seed seguro
  await prisma.auditLog.deleteMany({});
  await prisma.customerPackage.deleteMany({});
  await prisma.petPackage.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.professional.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.pet.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  const defaultPasswordHash = await hashPassword("demoPassword123!");
  const adminPasswordHash = await hashPassword("adminPassword123!");

  // 1. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Administrador Global PetFlow",
      email: "admin@petflow.com.br",
      passwordHash: adminPasswordHash,
      phone: "(11) 99999-0000",
      isSuperAdmin: true,
    },
  });
  console.log("✅ Super Admin criado:", superAdmin.email);

  // 2. Tenant Principal (PetFlow Demo)
  const demoTenant = await prisma.tenant.create({
    data: {
      name: "PetFlow Demo Pet Shop",
      tradeName: "PetFlow Spa & Estética Animal",
      slug: "demo",
      document: "12.345.678/0001-90",
      email: "contato@petflowdemo.com.br",
      phone: "(11) 98765-4321",
      address: "Av. Paulista, 1500 - Bela Vista",
      city: "São Paulo",
      state: "SP",
      postalCode: "01310-100",
      plan: "PRO",
      status: "ACTIVE",
      maxProfessionals: 10,
      maxUnits: 1,
    },
  });
  console.log("✅ Tenant Demo criado:", demoTenant.name);

  // 3. Usuários do Tenant Demo
  const ownerUser = await prisma.user.create({
    data: {
      name: "Carlos Eduardo Silva",
      email: "owner@petflowdemo.com.br",
      passwordHash: defaultPasswordHash,
      phone: "(11) 98111-2222",
      isSuperAdmin: false,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: "Fernanda Lima",
      email: "gerente@petflowdemo.com.br",
      passwordHash: defaultPasswordHash,
      phone: "(11) 98222-3333",
      isSuperAdmin: false,
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      name: "Mariana Costa",
      email: "recepcao@petflowdemo.com.br",
      passwordHash: defaultPasswordHash,
      phone: "(11) 98333-4444",
      isSuperAdmin: false,
    },
  });

  // Memberships
  await prisma.membership.createMany({
    data: [
      { tenantId: demoTenant.id, userId: ownerUser.id, role: "OWNER" },
      { tenantId: demoTenant.id, userId: managerUser.id, role: "MANAGER" },
      { tenantId: demoTenant.id, userId: receptionistUser.id, role: "RECEPTIONIST" },
    ],
  });

  // 4. Segundo Tenant para teste de isolamento (AuAu Pet Shop)
  const isolateTenant = await prisma.tenant.create({
    data: {
      name: "AuAu Banho e Tosa",
      tradeName: "AuAu Pet Shop Ltda",
      slug: "auau",
      document: "98.765.432/0001-10",
      email: "contato@auaupet.com.br",
      phone: "(21) 97777-8888",
      address: "Rua das Laranjeiras, 250",
      city: "Rio de Janeiro",
      state: "RJ",
      postalCode: "22240-006",
      plan: "STARTER",
      status: "ACTIVE",
      maxProfessionals: 2,
    },
  });

  const isolateOwner = await prisma.user.create({
    data: {
      name: "Renato Silveira (AuAu)",
      email: "owner@auaupet.com.br",
      passwordHash: defaultPasswordHash,
      phone: "(21) 99888-7777",
    },
  });

  await prisma.membership.create({
    data: {
      tenantId: isolateTenant.id,
      userId: isolateOwner.id,
      role: "OWNER",
    },
  });

  // Cliente isolado no segundo tenant
  const isolateCustomer = await prisma.customer.create({
    data: {
      tenantId: isolateTenant.id,
      name: "Cliente Secreto AuAu",
      phone: "(21) 99999-9999",
      email: "secreto@auau.com",
    },
  });
  console.log("✅ Segundo Tenant (Isolamento) criado com sucesso");

  // 5. Profissionais do Demo Tenant
  const prof1 = await prisma.professional.create({
    data: {
      tenantId: demoTenant.id,
      name: "Roberto Santos",
      email: "roberto.santos@petflowdemo.com.br",
      phone: "(11) 97111-0001",
      roleTitle: "Tosador Master",
      commissionRate: 20.0,
      workDays: "1,2,3,4,5,6",
      startTime: "08:00",
      endTime: "18:00",
      colorHex: "#10B981",
    },
  });

  const prof2 = await prisma.professional.create({
    data: {
      tenantId: demoTenant.id,
      name: "Juliana Rocha",
      email: "juliana.rocha@petflowdemo.com.br",
      phone: "(11) 97111-0002",
      roleTitle: "Banhista Sênior",
      commissionRate: 15.0,
      workDays: "1,2,3,4,5,6",
      startTime: "08:00",
      endTime: "17:00",
      colorHex: "#8B5CF6",
    },
  });

  const prof3 = await prisma.professional.create({
    data: {
      tenantId: demoTenant.id,
      name: "Marcos Paulo",
      email: "marcos.paulo@petflowdemo.com.br",
      phone: "(11) 97111-0003",
      roleTitle: "Especialista Felinos e Tesoura",
      commissionRate: 25.0,
      workDays: "2,3,4,5,6",
      startTime: "09:00",
      endTime: "18:00",
      colorHex: "#3B82F6",
    },
  });
  console.log("✅ Profissionais criados");

  // 6. Serviços do Demo Tenant
  const srvBanho = await prisma.service.create({
    data: {
      tenantId: demoTenant.id,
      name: "Banho Tradicional",
      description: "Banho completo com água morna, shampoo neutro e secagem especial",
      category: "BANHO_E_TOSA",
      basePrice: 6500, // R$ 65,00
      durationMinutes: 45,
      commissionRate: 15.0,
      priceSmall: 5500,
      priceMedium: 6500,
      priceLarge: 8500,
      priceGiant: 11000,
    },
  });

  const srvTosaHig = await prisma.service.create({
    data: {
      tenantId: demoTenant.id,
      name: "Tosa Higiênica",
      description: "Limpeza e corte higiênico de patas, barriga e região íntima",
      category: "BANHO_E_TOSA",
      basePrice: 4000, // R$ 40,00
      durationMinutes: 30,
      commissionRate: 15.0,
      priceSmall: 3500,
      priceMedium: 4000,
      priceLarge: 5000,
      priceGiant: 6500,
    },
  });

  const srvBanhoTosa = await prisma.service.create({
    data: {
      tenantId: demoTenant.id,
      name: "Banho & Tosa Completa",
      description: "Banho especial, tosa padrão da raça ou bebê, corte de unhas e limpeza de ouvidos",
      category: "BANHO_E_TOSA",
      basePrice: 12000, // R$ 120,00
      durationMinutes: 90,
      commissionRate: 20.0,
      priceSmall: 10000,
      priceMedium: 12000,
      priceLarge: 15500,
      priceGiant: 19500,
    },
  });

  const srvHidratacao = await prisma.service.create({
    data: {
      tenantId: demoTenant.id,
      name: "Hidratação de Pelagem com Óleo de Ojon",
      description: "Nutrição profunda dos pelos com brilho duradouro e maciez",
      category: "ESTETICA",
      basePrice: 5000, // R$ 50,00
      durationMinutes: 30,
      commissionRate: 20.0,
    },
  });

  const srvUnhas = await prisma.service.create({
    data: {
      tenantId: demoTenant.id,
      name: "Corte de Unhas & Higiene Auricular",
      description: "Aparamento seguro de unhas e higienização dos ouvidos",
      category: "ESTETICA",
      basePrice: 2500, // R$ 25,00
      durationMinutes: 20,
      commissionRate: 10.0,
    },
  });
  console.log("✅ Catálogo de serviços criado");

  // 7. Clientes e Pets do Demo Tenant
  const cust1 = await prisma.customer.create({
    data: {
      tenantId: demoTenant.id,
      name: "Ana Beatriz Souza",
      phone: "(11) 98888-1111",
      whatsapp: "(11) 98888-1111",
      email: "ana.souza@email.com",
      document: "123.456.789-00",
      address: "Rua Bela Cintra, 780, Apto 42",
      city: "São Paulo",
      state: "SP",
      postalCode: "01415-000",
      notes: "Cliente VIP há 2 anos. Sempre pontual.",
      contactPreference: "WHATSAPP",
    },
  });

  const petThor = await prisma.pet.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust1.id,
      name: "Thor",
      species: "CANINE",
      breed: "Golden Retriever",
      size: "GRANDE",
      gender: "MALE",
      birthDate: new Date("2021-04-10"),
      weight: 32.5,
      notes: "Cão dócil, adora água.",
      handlingRestrictions: "Nenhuma. Amigável com todos.",
      careInstructions: "Usar shampoo hipoalergênico e secagem sem calor excessivo.",
    },
  });

  const petLuna = await prisma.pet.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust1.id,
      name: "Luna",
      species: "CANINE",
      breed: "Shih Tzu",
      size: "PEQUENO",
      gender: "FEMALE",
      birthDate: new Date("2022-08-15"),
      weight: 5.8,
      notes: "Laço rosa após a tosa.",
      handlingRestrictions: "Sensível nas patinhas traseiras.",
      careInstructions: "Tosa higiênica e corte tesoura no rostinho.",
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      tenantId: demoTenant.id,
      name: "Rodrigo Mendes",
      phone: "(11) 97777-2222",
      whatsapp: "(11) 97777-2222",
      email: "rodrigo.mendes@email.com",
      document: "234.567.890-11",
      address: "Rua Augusta, 1200",
      city: "São Paulo",
      state: "SP",
      postalCode: "01304-001",
      notes: "Prefere ser avisado 30 minutos antes do término.",
    },
  });

  const petBob = await prisma.pet.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust2.id,
      name: "Bob",
      species: "CANINE",
      breed: "Buldogue Francês",
      size: "MEDIO",
      gender: "MALE",
      birthDate: new Date("2020-11-05"),
      weight: 12.0,
      notes: "Cuidado redobrado com respiração.",
      handlingRestrictions: "Braquicefálico. Não deixar em secadora fechada.",
      careInstructions: "Limpar ruguinhas faciais e secar bem.",
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      tenantId: demoTenant.id,
      name: "Camila Duarte",
      phone: "(11) 96666-3333",
      whatsapp: "(11) 96666-3333",
      email: "camila.duarte@email.com",
      address: "Alameda Santos, 900",
      city: "São Paulo",
      state: "SP",
    },
  });

  const petMia = await prisma.pet.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust3.id,
      name: "Mia",
      species: "FELINE",
      breed: "Siamês",
      size: "PEQUENO",
      gender: "FEMALE",
      birthDate: new Date("2023-01-20"),
      weight: 3.8,
      notes: "Gatinha tranquila se manuseada com calma.",
      handlingRestrictions: "Assusta-se com latidos de cães. Atender em sala silenciosa.",
      careInstructions: "Escovação especial e tosa higiênica felina.",
    },
  });

  const cust4 = await prisma.customer.create({
    data: {
      tenantId: demoTenant.id,
      name: "Lucas Martins",
      phone: "(11) 95555-4444",
      whatsapp: "(11) 95555-4444",
      email: "lucas.martins@email.com",
    },
  });

  const petPipoca = await prisma.pet.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust4.id,
      name: "Pipoca",
      species: "CANINE",
      breed: "Poodle Toy",
      size: "PEQUENO",
      gender: "FEMALE",
      birthDate: new Date("2022-03-12"),
      weight: 3.5,
      notes: "Muito agitada e brincalhona.",
    },
  });
  console.log("✅ Clientes e Pets cadastrados");

  // 8. Agendamentos e Pagamentos
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Agendamento 1: Ontem Concluído e Pago
  const appt1 = await prisma.appointment.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust1.id,
      petId: petThor.id,
      professionalId: prof1.id,
      serviceId: srvBanhoTosa.id,
      date: yesterday,
      startTime: "09:00",
      endTime: "10:30",
      durationMinutes: 90,
      price: 15500, // R$ 155,00
      status: "CONCLUIDO",
      paymentStatus: "PAID",
      notes: "Tosa perfeita realizada.",
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: demoTenant.id,
      appointmentId: appt1.id,
      amount: 15500,
      method: "PIX",
      status: "PAID",
      paidAt: yesterday,
      notes: "Recebido via chave PIX",
    },
  });

  // Agendamento 2: Hoje - Em Atendimento
  const appt2 = await prisma.appointment.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust1.id,
      petId: petLuna.id,
      professionalId: prof2.id,
      serviceId: srvBanho.id,
      date: today,
      startTime: "10:00",
      endTime: "10:45",
      durationMinutes: 45,
      price: 5500, // R$ 55,00
      status: "EM_ATENDIMENTO",
      paymentStatus: "PAID",
      notes: "No banho agora.",
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: demoTenant.id,
      appointmentId: appt2.id,
      amount: 5500,
      method: "DEBITO",
      status: "PAID",
      paidAt: today,
      notes: "Cartão de débito no balcão",
    },
  });

  // Agendamento 3: Hoje - Confirmado
  const appt3 = await prisma.appointment.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust2.id,
      petId: petBob.id,
      professionalId: prof1.id,
      serviceId: srvBanho.id,
      date: today,
      startTime: "14:00",
      endTime: "14:45",
      durationMinutes: 45,
      price: 6500, // R$ 65,00
      status: "CONFIRMADO",
      paymentStatus: "PENDING",
      notes: "Cliente confirmou presença pelo WhatsApp",
    },
  });

  // Agendamento 4: Hoje - Agendado
  const appt4 = await prisma.appointment.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust4.id,
      petId: petPipoca.id,
      professionalId: prof2.id,
      serviceId: srvBanhoTosa.id,
      date: today,
      startTime: "16:00",
      endTime: "17:30",
      durationMinutes: 90,
      price: 10000, // R$ 100,00
      status: "AGENDADO",
      paymentStatus: "PENDING",
    },
  });

  // Agendamento 5: Amanhã - Agendado com Gato
  const appt5 = await prisma.appointment.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust3.id,
      petId: petMia.id,
      professionalId: prof3.id,
      serviceId: srvHidratacao.id,
      date: tomorrow,
      startTime: "10:00",
      endTime: "10:30",
      durationMinutes: 30,
      price: 5000, // R$ 50,00
      status: "AGENDADO",
      paymentStatus: "PENDING",
      notes: "Sala tranquila reservada para atendimento felino",
    },
  });
  console.log("✅ Agendamentos e pagamentos de teste inseridos");

  // 9. Produtos e Estoque
  const prod1 = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      name: "Shampoo Hipoalergênico PetCare 5L",
      sku: "SHAMP-HIPO-5L",
      category: "HIGIENE",
      costPrice: 8500,
      salePrice: 14500,
      stockQuantity: 8,
      minStockAlert: 2,
      unit: "UN",
      supplier: "Distribuidora Pet Brasil",
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      tenantId: demoTenant.id,
      productId: prod1.id,
      type: "ENTRADA",
      quantity: 10,
      previousStock: 0,
      newStock: 10,
      reason: "Estoque inicial NF 1492",
      performedBy: "Carlos Eduardo Silva",
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      name: "Coleira Antipulgas Premium Seresto",
      sku: "COL-SERESTO-M",
      category: "FARMACIA",
      costPrice: 13000,
      salePrice: 22990,
      stockQuantity: 14,
      minStockAlert: 5,
      unit: "UN",
      supplier: "Elanco Saúde Animal",
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      name: "Ração Super Premium Cães Adultos 15kg",
      sku: "RAC-SPREM-15K",
      category: "ALIMENTO",
      costPrice: 17500,
      salePrice: 27900,
      stockQuantity: 3, // Alerta de estoque baixo! min = 4
      minStockAlert: 4,
      unit: "PCT",
      supplier: "Premier Pet",
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      name: "Biscoito Dental Care Crocante 200g",
      sku: "BISC-DENTAL-200",
      category: "ALIMENTO",
      costPrice: 750,
      salePrice: 1890,
      stockQuantity: 28,
      minStockAlert: 10,
      unit: "PCT",
      supplier: "Pet Delícia",
    },
  });
  console.log("✅ Produtos e movimentações de estoque cadastrados");

  // 10. Pacotes de Serviços
  const pkgBanho4 = await prisma.petPackage.create({
    data: {
      tenantId: demoTenant.id,
      name: "Pacote Mensal 4 Banhos (Porte Médio)",
      description: "Economize garantindo a higiene do seu pet todo fim de semana",
      price: 22000, // R$ 220,00 (avulso seria 260)
      totalUses: 4,
      validityDays: 30,
      serviceId: srvBanho.id,
      status: "ACTIVE",
    },
  });

  // Venda de pacote para Ana Beatriz (Luna)
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 25);

  await prisma.customerPackage.create({
    data: {
      tenantId: demoTenant.id,
      customerId: cust1.id,
      packageId: pkgBanho4.id,
      petId: petLuna.id,
      totalCredits: 4,
      remainingCredits: 3, // Já utilizou 1 crédito
      expiresAt: expiresDate,
      status: "ACTIVE",
    },
  });
  console.log("✅ Pacotes de serviços configurados");

  // 11. Despesas Financeiras
  const dueDate1 = new Date(today);
  dueDate1.setDate(dueDate1.getDate() + 10);

  await prisma.expense.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        description: "Aluguel Comercial - Espaço PetFlow",
        category: "ALUGUEL",
        amount: 350000, // R$ 3.500,00
        dueDate: dueDate1,
        status: "PENDING",
      },
      {
        tenantId: demoTenant.id,
        description: "Conta de Energia Elétrica (Enel)",
        category: "ENERGIA",
        amount: 84050, // R$ 840,50
        dueDate: dueDate1,
        status: "PENDING",
      },
      {
        tenantId: demoTenant.id,
        description: "Compra de Shampoos e Toalhas",
        category: "PRODUTOS",
        amount: 62000, // R$ 620,00
        dueDate: yesterday,
        paidAt: yesterday,
        status: "PAID",
        paymentMethod: "PIX",
      },
      {
        tenantId: demoTenant.id,
        description: "Assinatura Software PetFlow Pro",
        category: "MANUTENCAO",
        amount: 14900, // R$ 149,00
        dueDate: yesterday,
        paidAt: yesterday,
        status: "PAID",
        paymentMethod: "CARTAO",
      },
    ],
  });
  console.log("✅ Despesas financeiras criadas");

  console.log("🎉 Seed do PetFlow concluído com total sucesso!");
  console.log("Credenciais de Teste:");
  console.log("👉 Super Admin: admin@petflow.com.br / adminPassword123!");
  console.log("👉 Owner Demo: owner@petflowdemo.com.br / demoPassword123!");
  console.log("👉 Gerente: gerente@petflowdemo.com.br / demoPassword123!");
  console.log("👉 Recepção: recepcao@petflowdemo.com.br / demoPassword123!");
  console.log("👉 Tenant Isolado: owner@auaupet.com.br / demoPassword123!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
