/**
 * In-Memory Sliding Window Rate Limiter
 * Protege endpoints críticos contra ataques de força bruta, DoS e credential stuffing.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Limpeza automática periódica de registros expirados a cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs: number;  // Intervalo em milissegundos
  max: number;       // Quantidade máxima de requisições por intervalo
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 60 }
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      reset: now + options.windowMs,
    };
  }

  if (record.count >= options.max) {
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.max,
    remaining: options.max - record.count,
    reset: record.resetAt,
  };
}
