import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createAppointment } from "../src/services/appointmentService";

describe("Agenda Inteligente & Prevenção de Conflitos", () => {
  let tenant: any;
  let customer: any;
  let pet: any;
  let prof1: any;
  let prof2: any;
  let service: any;
  const testDate = "2026-11-15"; // Data futura para teste

  beforeAll(async () => {
    tenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });
    customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id } });
    pet = await prisma.pet.findFirst({ where: { tenantId: tenant.id } });
    const profs = await prisma.professional.findMany({ where: { tenantId: tenant.id }, take: 2 });
    prof1 = profs[0];
    prof2 = profs[1];
    service = await prisma.service.findFirst({ where: { tenantId: tenant.id } });

    // Limpa eventuais agendamentos desse dia de teste
    await prisma.appointment.deleteMany({
      where: {
        tenantId: tenant.id,
        date: new Date(`${testDate}T00:00:00.000Z`),
      },
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: {
        tenantId: tenant.id,
        date: new Date(`${testDate}T00:00:00.000Z`),
      },
    });
    await prisma.$disconnect();
  });

  it("deve permitir criar o primeiro agendamento normalmente", async () => {
    const appt = await createAppointment(tenant.id, {
      customerId: customer.id,
      petId: pet.id,
      professionalId: prof1.id,
      serviceId: service.id,
      date: testDate,
      startTime: "14:00",
      endTime: "15:00",
      durationMinutes: 60,
      price: 8000,
      notes: "Primeiro teste",
    });

    expect(appt).toBeDefined();
    expect(appt.startTime).toBe("14:00");
    expect(appt.endTime).toBe("15:00");
  });

  it("deve rejeitar com erro de CONFLITO_HORARIO agendamento sobreposto para o mesmo profissional", async () => {
    // Tenta agendar das 14:30 às 15:30 (sobrepõe o intervalo 14:00-15:00 existente)
    await expect(
      createAppointment(tenant.id, {
        customerId: customer.id,
        petId: pet.id,
        professionalId: prof1.id,
        serviceId: service.id,
        date: testDate,
        startTime: "14:30",
        endTime: "15:30",
        durationMinutes: 60,
        price: 8000,
      })
    ).rejects.toThrowError(/CONFLITO_HORARIO/);
  });

  it("deve permitir agendamento no mesmo horário para outro profissional disponível", async () => {
    // Profissional 2 pode atender às 14:00 normalmente
    const apptProf2 = await createAppointment(tenant.id, {
      customerId: customer.id,
      petId: pet.id,
      professionalId: prof2.id,
      serviceId: service.id,
      date: testDate,
      startTime: "14:00",
      endTime: "15:00",
      durationMinutes: 60,
      price: 8000,
    });

    expect(apptProf2).toBeDefined();
    expect(apptProf2.professionalId).toBe(prof2.id);
  });

  it("deve permitir agendamento consecutivo após o término do anterior para o mesmo profissional", async () => {
    // Horário das 15:00 às 16:00 não tem sobreposição com 14:00 às 15:00
    const apptNext = await createAppointment(tenant.id, {
      customerId: customer.id,
      petId: pet.id,
      professionalId: prof1.id,
      serviceId: service.id,
      date: testDate,
      startTime: "15:00",
      endTime: "16:00",
      durationMinutes: 60,
      price: 8000,
    });

    expect(apptNext).toBeDefined();
    expect(apptNext.startTime).toBe("15:00");
  });
});
