import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../src/lib/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "../src/lib/sanitization";

describe("Cybersegurança & Defesa Ativa", () => {
  it("deve bloquear requisições consecutivas quando o limite de rate limiting for ultrapassado", () => {
    const key = `test_ip_${Date.now()}`;
    const options = { windowMs: 10000, max: 3 };

    const req1 = checkRateLimit(key, options);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = checkRateLimit(key, options);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = checkRateLimit(key, options);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4ª requisição deve ser bloqueada!
    const req4 = checkRateLimit(key, options);
    expect(req4.success).toBe(false);
    expect(req4.remaining).toBe(0);
  });

  it("deve sanitizar injeções de script XSS e handlers inline maliciosos", () => {
    const malicious = '<script>alert("XSS")</script>Pet Shop Legal<img src=x onerror="alert(1)">';
    const clean = sanitizeString(malicious);

    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("Pet Shop Legal");
  });

  it("deve sanitizar e normalizar e-mails e telefones removendo caracteres perigosos", () => {
    const rawEmail = "  Cliente.VIP+test@petshop.com.br; DROP TABLE Users;  ";
    const cleanEmail = sanitizeEmail(rawEmail);
    expect(cleanEmail).not.toContain(";");
    expect(cleanEmail).not.toContain("DROP");
    expect(cleanEmail).toBe("cliente.vip+test@petshop.com.brdroptableusers");

    const rawPhone = "  +55 (11) 98888-1111 <script>  ";
    const cleanPhone = sanitizePhone(rawPhone);
    expect(cleanPhone).toBe("+55 (11) 98888-1111");
  });
});
