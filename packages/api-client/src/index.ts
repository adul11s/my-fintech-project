/**
 * QUPI API client — fetch-based, typed, DIKUNCI ke kontrak backend asli
 * NestJS global prefix /api; SessionGuard: header x-session-token;
 * idempotency key di body field `idempotencyKey`.
 * baseURL dari NEXT_PUBLIC_API_URL (default http://localhost:4000/api);
 * 401 → hook onUnauthorized (SessionProvider) → redirect /auth.
 */

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:4000/api";

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
  amount: number;
  id?: string;
  inquiryId?: string;
  status?: string;
}

export interface PayLaterLineUi {
  id: string;
  userId?: string;
  limit?: number;
  creditLimit?: number;
  used: number;
  activated: boolean;
}

export interface InstallmentUi {
  id: string;
  seq: number;
  dueAt: string;
  amount: number;
  penalty: number;
  status: "UNPAID" | "PAID" | "LATE";
  paidAt?: string | null;
}

export interface LedgerEntryUiRaw {
  id?: string;
  kind?: string;
  amount?: number;
  counterparty?: string | null;
  note?: string | null;
  status?: string;
  createdAt?: string;
  created_at?: number;
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void { onUnauthorized = fn; }

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const TOKEN_KEY = "qupi.token";
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function saveToken(token: string): void { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken(): void { localStorage.removeItem(TOKEN_KEY); }

/** Buat idempotency key SEKALI per niat transaksi (panggil saat konfirmasi/PIN klik, simpan di ref). */
export function makeIntentKey(): string { return newKey(); }

function newKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `idk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function request<T>(method: "GET" | "POST" | "PATCH", path: string, body?: Record<string, unknown>): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["x-session-token"] = token;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify({ ...body, ...(body.idempotencyKey ? {} : { idempotencyKey: newKey() }) }),
  });
  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T> & { statusCode?: number };
  if (res.status === 401) {
    if (path.startsWith("/identity/login")) {
      // Login gagal (PIN dsb.) adalah error normal, bukan sesi berakhir —
      // JANGAN panggil onUnauthorized; tampilkan pesan dari server.
      throw new ApiError(res.status, (json.message as string) ?? "PIN salah atau akun tidak ditemukan");
    }
    onUnauthorized?.();
    throw new ApiError(res.status, "Sesi habis — silakan masuk ulang");
  }
  if (res.status === 403) { throw new ApiError(res.status, "Akses ditolak (403)"); }
  if (!res.ok) throw new ApiError(res.status, (json.message as string) ?? "Permintaan gagal");
  return json;
}

// ── ledger UI + mapping dari /wallet/history ────────────────────────────────
export interface LedgerEntryUi {
  id: string;
  kind: "TOPUP" | "TRANSFER" | "QRIS" | "BILL" | "PAYLATER" | "CICILAN";
  title: string;
  amount: number;
  signed: 1 | -1;
  at: string;
  status: "SUCCESS" | "PENDING";
}

const KIND_LABEL: Record<string, LedgerEntryUi["kind"]> = {
  topup: "TOPUP", TOPUP: "TOPUP",
  transfer_out: "TRANSFER", transfer_in: "TRANSFER", TRANSFER: "TRANSFER",
  qris: "QRIS", QRIS: "QRIS",
  bill: "BILL", BILL: "BILL",
  installment: "CICILAN", CICILAN: "CICILAN",
  installments: "CICILAN",
  paylater_purchase: "PAYLATER", paylater: "PAYLATER", PAYLATER: "PAYLATER",
};

function keyOf(h: unknown): string { return (h as { id?: string; kid?: string }).id ?? Math.random().toString(36).slice(2); }

export async function listHistory(filter: { kind?: string; from?: string; to?: string; page?: string; limit?: string } = {}): Promise<LedgerEntryUi[]> {
  const res = await qupi.history(filter);
  const raw = (((res as { data?: unknown }).data ?? []) as LedgerEntryUiRaw[]);
  const items = (Array.isArray(raw) ? raw : ((res as { items?: LedgerEntryUiRaw[] }).items ?? []));
  return items.map((it, idx) => {
    const createdAt = it.createdAt ?? (it.created_at ? new Date(it.created_at).toISOString() : new Date().toISOString());
    const amt = Number(it.amount ?? 0);
    const sign: 1 | -1 = amt < 0 ? -1 : 1;
    const kind = (KIND_LABEL[(it.kind ?? "").toUpperCase()] ?? KIND_LABEL[(it.kind ?? "").toLowerCase()] ?? "TRANSFER");
    const cp = it.counterparty ?? it.note ?? kind;
    return {
      id: keyOf(it) || `h${idx}`,
      kind,
      title: `${kind === "TRANSFER" ? "Transfer" : kind.charAt(0) + kind.slice(1).toLowerCase()}${cp ? ` — ${cp}` : ""}`,
      amount: Math.abs(amt),
      signed: sign,
      at: createdAt,
      status: (it.status ?? "SUCCESS").toUpperCase() === "PENDING" ? "PENDING" : "SUCCESS",
    } satisfies LedgerEntryUi;
  });
}

export const qupiEnd = null;
export const qupi = {
  // ── identity ────────────────────────────────────────────────────────────
  register: (phone: string, name: string) => request<QupiUser>("POST", "/identity/register", { phone, name }),
  requestOtp: (userId: string, purpose = "LOGIN") => request<{ otp?: string }>("POST", "/identity/otp/request", { userId, purpose }),
  verifyOtp: (userId: string, code: string, purpose = "LOGIN") => request<{ success: boolean }>("POST", "/identity/otp/verify", { userId, purpose, code }),
  setPin: (userId: string, pin: string) => request("POST", "/identity/pin/set", { userId, pin }),
  login: (userId: string | undefined, phone: string | undefined, pin: string) =>
    request<{ userId: string; sessionToken: string }>("POST", "/identity/login", userId ? { userId, pin } : { phone, pin }),

  // ── wallet (session header) ─────────────────────────────────────────────
  balance: () => request<{ balance: number }>("GET", "/wallet/balance"),
  topup: (amount: number, pin: string, idempotencyKey?: string) => request("POST", "/wallet/topup", { amount, pin, idempotencyKey }),
  txStatus: (tid: string) => request("GET", `/wallet/transactions/${tid}`),
  callback: (tid: string, status: "SUCCESS" | "FAILED") => request("POST", `/wallet/callback/${tid}`, { status }),
  transfer: (toUserId: string, amount: number, pin: string, idempotencyKey?: string) => request("POST", "/wallet/transfer", { toUserId, amount, pin, idempotencyKey }),
  history: (filter: { kind?: string; from?: string; to?: string; page?: string; limit?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]).toString();
    return request<{ items?: LedgerEntryUiRaw[]; data?: LedgerEntryUiRaw[]; total?: number }>("GET", `/wallet/history${qs ? `?${qs}` : ""}`);
  },

  // ── payment ─────────────────────────────────────────────────────────────
  billsInquiry: (provider: string, number: string) => request<BillInquiry>("POST", "/payment/bills/inquiry", { provider, number }),
  billsPay: (inquiryId: string, method: "BALANCE" | "SALDO" | "PAYLATER", pin: string, idempotencyKey?: string) => request("POST", "/payment/bills/pay", { inquiryId, method: method === "SALDO" ? "BALANCE" : method, pin, idempotencyKey }),
  qrisCreate: (amount: number) => request<{ id: string }>("POST", "/payment/qris", { amount }),
  qrisPay: (id: string, method: "BALANCE" | "PAYLATER", pin: string, tenorMonths?: number, idempotencyKey?: string) => request("POST", `/payment/qris/${id}/pay`, { method, pin, tenorMonths, idempotencyKey }),

  // ── credit / paylater ───────────────────────────────────────────────────
  paylaterLimit: () => request<{ limit: number; used: number; available: number; activated: boolean }>("GET", "/credit/paylater/limit"),
  paylaterActivate: (pin: string) => request("POST", "/credit/paylater/activate", { pin }),
  paylaterCheckout: (amount: number, tenorMonths: number, pin: string, idempotencyKey?: string) =>
    request<{ payLaterTxId: string; totalAmount: number; totalInterest: number }>("POST", "/credit/paylater/checkout", { amount, tenorMonths, pin, idempotencyKey }),
  paylaterInstallments: () => request<InstallmentUi[]>("GET", "/credit/paylater/installments"),
  paylaterRecap: () => request<{ limit: number; used: number; unpaidTotal: number; dueBeyond30dTotal: number; overdueTotal: number; installmentCount: number }>("GET", "/credit/paylater/recap"),
  payInstallment: (installmentId: string, pin: string, idempotencyKey?: string) => request("POST", `/credit/paylater/installments/${installmentId}/pay`, { pin, idempotencyKey }),

  // ── kyc (pilot: base64 upload + admin approve manual) ───────────────────
  kycUpload: (contentBase64: string, fileName: string) => request<{ id: string; status: string }>("POST", "/identity/kyc/upload", { contentBase64, fileName }),
  lookupUser: (phone: string) => request<{ id: string; phone: string; name: string }>("GET", `/identity/lookup?phone=${encodeURIComponent(phone)}`),
  adminDocs: (query = "") => request<unknown[]>("GET", `/admin/kyc/documents${query ? `?${query}` : ""}`),
  adminUpdate: (docId: string, action: "APPROVE" | "REJECT" | "UPLOAD_AGAIN", rejectionReason?: string) =>
    request<{ id: string }>("PATCH", `/admin/kyc/documents/${docId}`, { action, rejectionReason }),
};
