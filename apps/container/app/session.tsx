"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSess] = useState<QupiSession | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSess(readSession());
    setUnauthorizedHandler(() => {
      clearSession("idle");
    });
  }, []);

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

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const setSession = useCallback((s: QupiSession) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSess(s);
  }, []);

  const clearSession = useCallback((reason?: "idle") => {
    localStorage.removeItem(KEY);
    setSess(null);
    if (reason === "idle") {
      localStorage.setItem("qupi.logoutReason", "Sesi berakhir karena 15 menit tidak ada aktivitas");
      window.location.href = "/auth";
    } else {
      localStorage.setItem("qupi.logoutReason", "Anda telah keluar");
      window.location.href = "/auth";
    }
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

/** Pengaman halaman: tanpa sesi → redirect /auth + pesan. */
export function useRequireSession(): QupiSession {
  const { session } = useSession();
  useEffect(() => {
    if (!session && typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
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
