/**
 * Sanitização de Entradas & Prevenção de XSS e Injeções
 */

/**
 * Remove tags HTML maliciosas, scripts, eventos inline e caracteres de controle nulos
 */
export function sanitizeString(input?: string | null): string {
  if (!input) return "";

  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/on\w+="[^"]*"/gi, "") // Remove inline event handlers (ex: onload, onclick)
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "") // Remove javascript: pseudo-protocol
    .trim();
}

/**
 * Sanitiza números de telefone mantendo apenas dígitos, parênteses e hífens seguros
 */
export function sanitizePhone(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/[^\d()+\-\s]/g, "").trim();
}

/**
 * Sanitiza e valida formato de e-mail básico
 */
export function sanitizeEmail(email?: string | null): string {
  if (!email) return "";
  return email.toLowerCase().replace(/[^\w.@+-]/g, "").trim();
}
