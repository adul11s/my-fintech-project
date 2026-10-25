"use client";

import { useEffect, useState } from "react";
import { Button, formatIdr } from "@fintech/ui";
import { qupi, type PayLaterLineUi, type InstallmentUi } from "@fintech/api-client";
import { useRef } from "react";
import { useRequireSession, useSession } from "../session";
import { PinPad } from "../pin-pad";

/** Denda keterlambatan: info 1% per hari sesuai kebijakan produk. */
const dendaInfo = (dueAt: string) => {
  const late = Math.floor((Date.now() - new Date(dueAt).getTime()) / 86_400_000);
  return late > 0 ? `Terlambat ${late} hari — denda 1% per hari` : null;
};

export default function PaylaterPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [line, setLine] = useState<PayLaterLineUi | null>(null);
  const [installments, setInstallments] = useState<InstallmentUi[]>([]);
  const [pinOpen, setPinOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    // ambil kondisi paylater asli dari backend (limit/recap/installments)
    Promise.all([qupi.paylaterRecap(), qupi.paylaterInstallments()])
      .then(([rec, inst]) => {
        const d = (rec.data ?? {}) as { limit: number; used: number };
        setLine({ id: "local", used: Number(d.used ?? 0), limit: Number(d.limit ?? 0), activated: Number(d.limit ?? 0) > 0 });
        setInstallments(((inst.data ?? []) as InstallmentUi[]));
      })
      .catch(() => setInstallments([]));
  }, [session]);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const sisa = (Number(line?.limit ?? 0)) - (Number(line?.used ?? 0));

  const ajukan = async (pin: string) => {
    setBusy(true);
    try {
      // PIN dikirim ke backend untuk verifikasi aktivasi
      await qupi.paylaterActivate(pin);
      const rec = await qupi.paylaterRecap();
      const d = (rec.data ?? {}) as { limit: number; used: number };
      setLine({ id: "local", used: Number(d.used ?? 0), limit: Number(d.limit ?? 0), activated: Number(d.limit ?? 0) > 0 });
      showToast(`Limit PayLater ${formatIdr(Number(d.limit ?? 0))} diaktifkan`);
      setPinOpen(null);
    } catch (e) {
      showToast((e as Error).message);
      setPinOpen(null);
    }
    setBusy(false);
  };

  const bayar = async (id: string, pin: string) => {
    try {
      await qupi.payInstallment(id, pin);
      setInstallments((prev) => prev.filter((i) => i.id !== id));
      setPinOpen(null);
      showToast("Cicilan dibayar");
    } catch (e) {
      showToast((e as Error).message);
      setPinOpen(null);
    }
  };

  const jatuhTempoDulu = [...installments].sort((a, b) => a.seq - b.seq).filter((i) => i.status === "UNPAID");

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5" id="ajukan">
      <h1 className="text-lg font-bold">PayLater</h1>

      {line ? (
        <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4" data-testid="paylater-summary">
          <p className="text-xs text-slate-400">Limit / Terpakai / Sisa</p>
          <p className="text-xl font-black text-white">{formatIdr(Number(line.limit))} / {formatIdr(Number(line.used))} / <span className="text-emerald-400">{formatIdr(sisa)}</span></p>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4 text-sm">
          <p className="mb-2 text-slate-300">Ajukan limit PayLater</p>
          {/* Sengaja tanpa input limit: jumlah limit ditentukan backend (gaji terverifikasi × 2,5, plafon 15 jt). */}
          <p className="text-xs text-slate-500">Limit dihitung otomatis dari penghasilan terverifikasi (maks 2,5× gaji, plafon Rp15 jt).</p>
          <Button className="mt-3 w-full" onClick={() => setPinOpen("activate")}>Aktifkan Limit</Button>
          <p className="mt-2 text-xs text-slate-500">Status belum: none → menunggu KYC band tertinggi.</p>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4">
        <p className="mb-2 text-sm font-bold">Transaksi PayLater</p>
        <p className="text-xs text-slate-500">Endpoint daftar transaksi paylater belum tersedia di backend — menyusul.</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4" data-testid="daftar-cicilan">
        <p className="mb-2 text-sm font-bold">Cicilan</p>
        {jatuhTempoDulu.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada cicilan tertunggak.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {jatuhTempoDulu.map((c) => {
              const denda = dendaInfo(c.dueAt);
              return (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Cicilan #{c.seq} — {formatIdr(c.amount)}</p>
                    <p className="text-xs text-slate-500">Jatuh tempo {new Date(c.dueAt).toLocaleDateString("id-ID")}</p>
                    {denda && <p className="text-xs text-rose-400">{denda}</p>}
                  </div>
                  <Button onClick={() => setPinOpen(c.id)}>Bayar Sekarang</Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <PinPad
        open={pinOpen !== null}
        title={pinOpen === "activate" ? "Masukkan PIN — Aktivasi Limit" : "Masukkan PIN — Bayar Cicilan"}
        onPin={(pin) => (pinOpen === "activate" ? ajukan(pin) : bayar(pinOpen as string, pin))}
        onClose={() => setPinOpen(null)}
      />
      {busy && <p className="text-center text-xs text-slate-400">Memproses…</p>}
    </main>
  );
}
