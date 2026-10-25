"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { setUnauthorizedHandler, type LedgerEntryUi } from "@fintech/api-client";
import type { ReactNode } from "react";

/** Sesi client-side: id user disimpan di localStorage, kedaluwarsa 15 menit idle. */
const KEY = "qupi.session";
export const IDLE_MS = 15 * 60 * 1000;

export interface QupiSession {
  userId: string;
  name: string;
  at: number;
}

interface Ctx {
  session: QupiSession | null;
  setSession: (s: QupiSession) => void;
  clearSession: (reason?: "idle") => void;
  toast: string | null;
  showToast: (m: string) => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function readSession(): QupiSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QupiSession) : null;
  } catch {
    return null;
  }
}

// ── store localStorage sesi (useSyncExternalStore) ──
// Snapshot di-cache agar referensi tetap stabil bila storage tidak berubah.
let snapCache: { raw: string | null; val: QupiSession | null } | null = null;
function sessionSnapshot(): QupiSession | null {
  const raw = typeof window === "undefined" ? null : localStorage.getItem(KEY);
  if (!snapCache || snapCache.raw !== raw) {
    let val: QupiSession | null = null;
    if (raw) {
      try { val = JSON.parse(raw) as QupiSession; } catch { val = null; }
    }
    snapCache = { raw, val };
  }
  return snapCache.val;
}
const listeners = new Set<() => void>();
function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => { listeners.delete(l); window.removeEventListener("storage", l); };
}
function notify(): void {
  listeners.forEach((l) => l());
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, sessionSnapshot, () => null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const setSession = useCallback((s: QupiSession) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    notify();
  }, []);

  const clearSession = useCallback((reason?: "idle") => {
    localStorage.removeItem(KEY);
    notify();
    if (reason === "idle") {
      localStorage.setItem("qupi.logoutReason", "Sesi berakhir karena 15 menit tidak ada aktivitas");
      window.location.href = "/auth";
    } else {
      localStorage.setItem("qupi.logoutReason", "Anda telah keluar");
      window.location.href = "/auth";
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession("idle");
    });
  }, [clearSession]);

  // Aktivitas pengguna memperbarui stamp; idle >15 menit → sesi dilepas saat navigasi berikutnya.
  useEffect(() => {
    const ping = () => {
      const s = readSession();
      if (s) localStorage.setItem(KEY, JSON.stringify({ ...s, at: Date.now() }));
    };
    const evs = ["click", "keydown", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, ping, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, ping));
  }, []);

  const value = useMemo(
    () => ({ session, setSession, clearSession, toast, showToast }),
    [session, setSession, clearSession, toast, showToast],
  );
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("SessionProvider wajib di layout");
  return ctx;
}

/** Pengaman halaman: tanpa sesi → redirect /auth + pesan. Rehidrasi storage dulu sebelum memutuskan. */
export function useRequireSession(): QupiSession {
  const { session, setSession } = useSession();
  useEffect(() => {
    if (session) return;
    const from = readSession();
    if (from) { setSession(from); return; }
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      localStorage.setItem("qupi.logoutReason", "Silakan masuk terlebih dahulu");
      window.location.href = "/auth";
    }
  }, [session]);
  return session as QupiSession;
}

// ── ledger lokal: fallback saat endpoint /wallet/:id/transactions belum siap ──
const LEDGER = "qupi.ledger";
export function appendLedger(entry: Omit<LedgerEntryUi, "id" | "at"> & { at?: string }): void {
  try {
    const raw = localStorage.getItem(LEDGER);
    const items: LedgerEntryUi[] = raw ? JSON.parse(raw) : [];
    items.unshift({
      id: (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string,
      at: entry.at ?? new Date().toISOString(),
      ...entry,
    });
    localStorage.setItem(LEDGER, JSON.stringify(items.slice(0, 200)));
  } catch {
    /* abaikan */
  }
}
export function getLocalLedger(): LedgerEntryUi[] {
  try {
    const raw = localStorage.getItem(LEDGER);
    return raw ? (JSON.parse(raw) as LedgerEntryUi[]) : [];
  } catch {
    return [];
  }
}
