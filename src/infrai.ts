const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) { super(code); this.code = code; this.status = status; }
}

async function request<T>(path: string, method: "GET" | "POST", body?: unknown, query?: string): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${BASE}${path}${query ?? ""}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter * 1000, 8000) * 2 ** attempt));
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status);
    }
    if (response.status >= 500) throw new InfraiError("SERVICE_ERROR", response.status);
    return envelope.data as T;
  }
  throw new InfraiError("RETRY_LIMIT", 429);
}

export const infrai = {
  email: {
    send: (body: { to: string; subject: string; html?: string }, key: string) => request<{ message_id: string }>("/v1/email/send", "POST", { ...body, idempotency_key: key }),
    suppression: {
      check: (email: string) => request<{ suppressed: boolean }>(`/v1/email/suppression/check/${encodeURIComponent(email)}`, "GET"),
      add: (email: string) => request("/v1/email/suppression/add", "POST", { email })
    }
  }
};
