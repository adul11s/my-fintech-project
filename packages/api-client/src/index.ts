/**
 * QUPI API client — fetch-based, typed, sesuai kontrak controllers
 * NestJS di /Users/chairunnisa/projects/qupi-backend/src/{identity,wallet,payment,credit}.
 *
 * baseURL dari NEXT_PUBLIC_API_URL (backend bisa jalan di port lain).
 * Setiap POST transaksi mengirim Idempotency-Key header + idempotencyKey body.
 * 401 → memicu hook onUnauthorized (diisi SessionProvider) → redirect /auth.
 */

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:4000";

export type ApiEnvelope<T> = { message?: string; data?: T; [k: string]: unknown };

export interface QupiUser {
  id: string;
  name?: string;
  phone?: string;
  kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  kycBand?: string;
}

export interface BillInquiry {
  provider: string;
  number: string;
  billAmount: number;
}

export interface PayLaterLine {
  id: string;
  userId: string;
  limitAmount: number;
  used: number;
  activated: boolean;
}

export interface PayLaterInstallment {
  id: string;
  seq: number;
  dueAt: string;
  amount: number;
  status: "UNPAID" | "PAID";
}

export interface LedgerEntryUi {
  id: string;
  kind: "TOPUP" | "TRANSFER" | "QRIS" | "BILL" | "PAYLATER" | "CICILAN";
  title: string;
  amount: number;
  signed: 1 | -1;
  at: string;
  status: "SUCCESS" | "PENDING";
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof crypto !== "undefined" && crypto.randomUUID) headers["X-Request-Id"] = crypto.randomUUID();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 || res.status === 403) {
    onUnauthorized?.();
    throw new ApiError(res.status, "Sesi tidak valid — silakan masuk ulang");
  }
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(res.status, (json.message as string) ?? `Permintaan gagal (${res.status})`);
  }
  return json as T;
}

/** POST transaksi: header Idempotency-Key + body idempotencyKey (sesuai kontrak wallet).
 */
async function postTxReal<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const key = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `idk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const headers: Record<string, string> = { "Content-Type": "application/json", "Idempotency-Key": key };
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 401 || res.status === 403) { onUnauthorized?.(); throw new ApiError(res.status, "Sesi tidak valid — silakan masuk ulang"); }
  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok) throw new ApiError(res.status, (json.message as string) ?? `Permintaan gagal (${res.status})`);
  return json as T;
}

export const qupi = {
  // ── identity ────────────────────────────────────────────────────────────
  register: (phone: string, name: string) =>
    request<QupiUser>("POST", "/identity/register", { phone, name }).then((r) => r),
  requestOtp: (id: string, purpose = "LOGIN") =>
    request<{ message: string; otp?: string }>("POST", `/identity/${id}/otp/request`, { purpose }),
  verifyOtp: (id: string, code: string, purpose = "LOGIN") =>
    request<{ success: boolean; message: string }>("POST", `/identity/${id}/otp/verify`, { purpose, code }),
  setPin: (id: string, pin: string) =>
    request<{ message: string }>("POST", `/identity/${id}/pin`, { pin }),
  login: (id: string, pin: string) =>
    request<{ data: { id: string } }>("POST", `/identity/${id}/login`, { pin }),
  getUser: (id: string) => request<ApiEnvelope<QupiUser>>("GET", `/identity/${id}`),

  // ── wallet ──────────────────────────────────────────────────────────────
  balance: (id: string) => request<{ data: { balance: number } }>("GET", `/wallet/${id}/balance`),
  topup: (id: string, amount: number) => postTxReal<{ message: string }>(`/wallet/${id}/topup`, { amount }),
  transfer: (id: string, toAccountId: string, amount: number) =>
    postTxReal<{ message: string }>(`/wallet/${id}/transfer`, { toAccountId, amount }),

  // ── payment ─────────────────────────────────────────────────────────────
  billsInquiry: (provider: string, number: string) =>
    request<ApiEnvelope<BillInquiry>>("POST", "/payment/bills/inquiry", { provider, number }),
  billsPay: (userId: string, provider: string, number: string, amount: number, pin?: string) =>
    postTxReal<{ message?: string }>(`/payment/bills/pay`, { userId, provider, number, amount, pin }),

  // ── credit / paylater ───────────────────────────────────────────────────
  paylaterActivate: (userId: string, limit: number) =>
    request<{ data: PayLaterLine }>("POST", "/credit/paylater/activate", { userId, limit }),
  paylaterPurchase: (userId: string, amount: number, tenorMonths: 1 | 3 | 6) =>
    request<{ message: string; data: { payLaterTxId: string; tenor: number; installments?: PayLaterInstallment[] } }>(
      "POST", "/credit/paylater/purchase", { userId, amount, tenorMonths },
    ),
  payInstallment: (installmentId: string, userId: string) =>
    request<{ message: string }>("POST", `/credit/installments/${installmentId}/pay`, { userId }),

  // endpoint ledger list belum tersedia di backend saat ini — kontrak disiapkan agar bisa dipasang:
  listTransactions: (id: string, filter?: { kind?: string; from?: string; to?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (filter?.kind) qs.set("kind", filter.kind);
    if (filter?.from) qs.set("from", filter.from);
    if (filter?.to) qs.set("to", filter.to);
    if (filter?.page) qs.set("page", String(filter.page));
    const q = qs.toString();
    return request<ApiEnvelope<{ items: LedgerEntryUi[]; total: number; page: number }>>(
      "GET", `/wallet/${id}/transactions${q ? `?${q}` : ""}`,
    );
  },
  uploadKycDocument: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE_URL}/identity/${id}/documents`, { method: "POST", body: form });
  },
};
