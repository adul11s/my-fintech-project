"use client";

import { useEffect, useMemo, useState } from "react";
import { formatIdr } from "@fintech/ui";
import { qupi, type LedgerEntryUi } from "@fintech/api-client";
import { useRequireSession, getLocalLedger } from "../session";

const PAGE = 10;

export default function RiwayatPage() {
  const session = useRequireSession();
  const [items, setItems] = useState<LedgerEntryUi[] | null>(null);
  const [kind, setKind] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [serverOff, setServerOff] = useState(false);

  useEffect(() => {
    if (!session) return;
    // endpoint /wallet/:id/transactions belum tersedia → fallback ledger lokal
    qupi
      .listTransactions(session.userId, { kind: kind || undefined, from: from || undefined, to: to || undefined })
      .then((r) => setItems(r.data?.items ?? []))
      .catch(() => { setItems(null); setServerOff(true); });
  }, [session, kind, from, to]);

  const source = items ?? getLocalLedger();
  const filtered = useMemo(() => {
    let list = source;
    if (kind) list = list.filter((t) => t.kind === kind);
    if (from) list = list.filter((t) => t.at.slice(0, 10) >= from);
    if (to) list = list.filter((t) => t.at.slice(0, 10) <= to);
    return list;
  }, [source, kind, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice((page - 1) * PAGE, page * PAGE);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5 lg:max-w-2xl">
      <h1 className="text-lg font-bold">Riwayat Transaksi</h1>
      {serverOff && (
        <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-amber-300" data-testid="riwayat-fallback">
          Data server belum tersedia — menampilkan transaksi sesi ini.
        </p>
      )}
      {/* filter */}
      <section className="grid grid-cols-3 gap-2 text-xs" data-testid="filter-riwayat">
        <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} className="rounded-lg bg-qpi-surface px-2 py-2 text-white">
          <option value="">Semua tipe</option>
          {["TOPUP", "TRANSFER", "QRIS", "BILL", "PAYLATER", "CICILAN"].map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-lg bg-qpi-surface px-2 py-2 text-white" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-lg bg-qpi-surface px-2 py-2 text-white" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-2">
        {view.length === 0 ? (
          <p className="p-3 text-sm text-slate-400">Tidak ada transaksi.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {view.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-2 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-slate-500">{new Date(t.at).toLocaleString("id-ID")} · {t.kind}</p>
                </div>
                <span className={`shrink-0 text-sm font-bold ${t.signed < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {t.signed < 0 ? "-" : "+"}
                  {formatIdr(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex items-center justify-between text-xs text-slate-400" data-testid="paginasi">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40">Sebelumnya</button>
        <span>Halaman {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40">Berikutnya</button>
      </div>
    </main>
  );
}
