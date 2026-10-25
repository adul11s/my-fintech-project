"use client";

import { useState, useRef } from "react";
import { Button, formatIdr, paylaterTotal } from "@fintech/ui";
import { qupi, makeIntentKey } from "@fintech/api-client";
import { useRequireSession, useSession, appendLedger } from "../session";
import { PinPad } from "../pin-pad";

const TENOR = [1, 3, 6] as const;

export default function QrisPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [scanning, setScanning] = useState(true);
  const [merchant, setMerchant] = useState("Kopi Sore 24 JAM");
  const [merchantId, setMerchantId] = useState("MRCH-8231");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"SALDO" | "PAYLATER">("SALDO");
  const [tenor, setTenor] = useState<1 | 3 | 6>(3);
  const [pinOpen, setPinOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const amt = Number(amount || 0);
  const totalPaylater = amt > 0 ? paylaterTotal(amt, tenor) : 0;
  const perBulan = amt > 0 ? Math.round(totalPaylater / tenor) : 0;

  const intentRef = useRef<string | null>(null);
  const submit = async (pin: string) => {
    // idempotency per intent: satu key untuk seluruh niat bayar QRIS ini
    intentRef.current = intentRef.current ?? makeIntentKey();
    try {
      const q = await qupi.qrisCreate(amt);
      const qid = ((q as { data?: { id?: string } }).data?.id ?? "") as string;
      // backend menangani BALANCE/PAYLATER dalam SATU operasi (tanpa debit saldo ganda)
      await qupi.qrisPay(qid, source === "PAYLATER" ? "PAYLATER" : "BALANCE", pin, source === "PAYLATER" ? tenor : undefined, intentRef.current);
      intentRef.current = null;
    } catch (e) {
      showToast((e as Error).message);
      return;
    }
    setPinOpen(false);
    setReceipt(`Pembayaran ${formatIdr(amt)} ke ${merchant} (${merchantId}) via ${source === "SALDO" ? "Saldo" : `PayLater tenor ${tenor} bulan`} berhasil`);
    setScanning(true); setAmount("");
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Bayar QRIS</h1>
      {scanning ? (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-qpi-surface p-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-violet-400/60" data-testid="qris-scan-frame">
            <p className="text-center text-xs text-violet-300">Arahkan kamera<br />kode QR merchant</p>
          </div>
          <Button variant="ghost" onClick={() => setScanning(false)}>Input manual</Button>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4 text-sm">
            <p className="mb-2 text-xs text-slate-400">Merchant / nomor (fallback manual)</p>
            <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Nama merchant" className="mb-2 w-full rounded-lg bg-white/5 px-3 py-2 text-white" />
            <input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="ID merchant" className="w-full rounded-lg bg-white/5 px-3 py-2 text-white" />
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="Nominal bayar" inputMode="numeric" className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 text-white" />
          </section>

          <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4">
            <p className="mb-2 text-xs text-slate-400">Sumber dana</p>
            <div className="mx-auto flex max-w-xs gap-2">
              <button onClick={() => setSource("SALDO")} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${source === "SALDO" ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 text-slate-300"}`}>
                Saldo
              </button>
              <button onClick={() => setSource("PAYLATER")} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${source === "PAYLATER" ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 text-slate-300"}`}>
                PayLater
              </button>
            </div>

            {/* jadwal cicilan tampil SEBELUM konfirmasi */}
            {source === "PAYLATER" && amt > 0 && (
              <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs" data-testid="jadwal-cicilan">
                <div className="mb-2 flex gap-2">
                  {TENOR.map((t) => (
                    <button key={t} onClick={() => setTenor(t)} className={`rounded-lg border px-3 py-1 ${tenor === t ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/15 text-slate-300"}`}>
                      {t} bln
                    </button>
                  ))}
                </div>
                <p className="font-semibold text-white">Cicilan per bulan: {formatIdr(perBulan)}</p>
                <ul className="mt-1 space-y-0.5 text-slate-400">
                  {Array.from({ length: tenor }, (_, i) => (
                    <li key={i}>Bulan {i + 1}: {formatIdr(i === tenor - 1 ? totalPaylater - perBulan * (tenor - 1) : perBulan)}</li>
                  ))}
                </ul>
                <p className="mt-1 text-slate-500">Total: {formatIdr(totalPaylater)}</p>
              </div>
            )}
          </section>

          <Button disabled={amt <= 0} onClick={() => setPinOpen(true)}>
            Bayar {amt > 0 ? formatIdr(amt) : ""}
          </Button>
          <PinPad open={pinOpen} title={`Masukkan PIN — QRIS ${formatIdr(amt)}`} onPin={submit} onClose={() => setPinOpen(false)} />
        </>
      )}
      {receipt && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300" data-testid="qris-receipt">{receipt}</div>}
    </main>
  );
}
