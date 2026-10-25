"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, formatIdr } from "@fintech/ui";
import { qupi, listHistory, type LedgerEntryUi } from "@fintech/api-client";
import { useSession, useRequireSession } from "./session";
type PayLaterLine = { limit: number; used: number; activated: boolean };

const QUICK: { href: string; label: string; icon: string }[] = [
  { href: "/topup", label: "Top Up", icon: "⬆" },
  { href: "/transfer", label: "Transfer", icon: "⇄" },
  { href: "/qris", label: "QRIS", icon: "▣" },
  { href: "/tagihan", label: "Tagihan", icon: "✉" },
  { href: "/paylater", label: "PayLater", icon: "◷" },
  { href: "/riwayat", label: "Riwayat", icon: "☰" },
  { href: "/paylater", label: "Ajukan Limit", icon: "＋" },
  { href: "/profil", label: "Profil", icon: "☺" },
];

export default function BerandaPage() {
  const session = useRequireSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [line, setLine] = useState<PayLaterLine | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEntryUi[]>([]);

  useEffect(() => {
    if (!session) return;
    qupi
      .balance()
      .then((r) => setBalance((r.data ?? {}).balance ?? 0))
      .catch((e) => setErr(e?.message ?? "Gagal memuat saldo"));
    listHistory({ limit: "3" })
      .then((list) => setLedger(list))
      .catch(() => setLedger([]));
    // recap paylater asli dari backend
    qupi
      .paylaterRecap()
      .then((r) => {
        const d = (r.data ?? {}) as { limit: number; used: number };
        setLine({ limit: Number(d.limit ?? 0), used: Number(d.used ?? 0), activated: Number(d.limit ?? 0) > 0 });
      })
      .catch(() => {});
  }, [session]);

  const status = (l: PayLaterLine | null) =>
    !l || !l.activated ? "Belum aktif" : l.used >= 100 ? "Menunggu cicilan" : "Lancar";

  if (!session) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-4 py-8">
        <div className="qpi-skel h-40 rounded-2xl" data-testid="beranda-skeleton" />
        <div className="qpi-skel h-24 rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5 lg:max-w-3xl">
      {/* banner sandbox — data demo, bukan uang asli */}
      <div
        role="status"
        data-testid="sandbox-banner"
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-200"
      >
        Sandbox / data simulasi
      </div>

      {/* saldo utama */}
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-qpi-surface to-violet-950/60 p-5" data-testid="kartu-saldo">
        <p className="text-xs text-slate-400">Saldo {session.name}</p>
        <p className="mt-1 text-3xl font-black text-white">
          {balance === null ? <span className="qpi-skel inline-block h-9 w-44 rounded align-middle" /> : formatIdr(balance)}
        </p>
        {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
      </section>

      {/* kartu paylater */}
      <Link href="/paylater" className="block rounded-2xl border border-white/10 bg-qpi-surface p-4" data-testid="kartu-paylater">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Limit PayLater</p>
            <p className="text-lg font-bold text-white">{formatIdr(line?.limit ?? 0)}</p>
            <p className="mt-0.5 text-xs text-slate-500">Terpakai {formatIdr(line?.used ?? 0)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              line?.activated ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-slate-400"
            }`}
          >
            {status(line)}
          </span>
        </div>
      </Link>

      {/* 8 quick actions */}
      <section data-testid="quick-actions">
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
          {QUICK.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-qpi-surface px-2 py-3 text-center hover:border-violet-500/50"
            >
              <span aria-hidden className="text-xl text-violet-300">{q.icon}</span>
              <span className="text-[10px] leading-tight text-slate-300">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* pending badge */}
      <section className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200" data-testid="pending-badge">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">!</span>
        Ada {ledger.filter((t) => t.status === "PENDING").length} transaksi menunggu — lihat di{" "}
        <Link href="/riwayat" className="underline">Riwayat</Link>
      </section>

      {/* 3 transaksi terakhir */}
      <Card title="Transaksi Terakhir">
        {ledger.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada transaksi dalam sesi ini.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {ledger.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-slate-500">{new Date(t.at).toLocaleString("id-ID")}</p>
                </div>
                <span className={`text-sm font-bold ${t.signed < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {t.signed < 0 ? "-" : "+"}
                  {formatIdr(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/riwayat" className="mt-2 inline-block text-xs text-violet-300 hover:underline">
          Lihat semua →
        </Link>
      </Card>
    </main>
  );
}
