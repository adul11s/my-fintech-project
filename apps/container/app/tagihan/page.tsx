"use client";

import { useState } from "react";
import { Button, formatIdr } from "@fintech/ui";
import { qupi, makeIntentKey, type BillInquiry } from "@fintech/api-client";
import { useRef } from "react";
import { useRequireSession, useSession, appendLedger } from "../session";
import { PinPad } from "../pin-pad";

const KATALOG: { provider: string; label: string; icon: string }[] = [
  { provider: "PLN", label: "PLN (Listrik)", icon: "⚡" },
  { provider: "PULSA", label: "Pulsa Seluler", icon: "📱" },
  { provider: "DATA", label: "Paket Data", icon: "📶" },
];

export default function TagihanPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [provider, setProvider] = useState("PLN");
  const [number, setNumber] = useState("");
  const [inquiry, setInquiry] = useState<BillInquiry | null>(null);
  const [source, setSource] = useState<"SALDO" | "PAYLATER">("SALDO");
  const [pinOpen, setPinOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const intentRef = useRef<string | null>(null);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const mulai = async (p: string) => {
    setProvider(p); setInquiry(null); setReceipt(null);
  };

  const cek = async () => {
    setBusy(true);
    try {
      const r = await qupi.billsInquiry(provider, number);
      setInquiry(r.data ?? null);
    } catch (e) {
      showToast((e as Error).message);
    }
    setBusy(false);
  };

  const submit = async (pin: string) => {
    if (!inquiry) return;
    intentRef.current = intentRef.current ?? makeIntentKey();
    try {
      const inqId = (inquiry.id ?? inquiry.inquiryId ?? "") as string;
      await qupi.billsPay(inqId, source, pin, intentRef.current);
      appendLedger({ kind: "BILL", title: `Tagihan ${provider} ${inquiry.number}`, amount: inquiry.amount, signed: -1, status: "SUCCESS" });
      intentRef.current = null; // niat selesai: pembayaran tagihan berikutnya pakai key baru
      setPinOpen(false);
      setReceipt(`Pembayaran ${provider} ${inquiry.number} sebesar ${formatIdr(inquiry.amount)} (${source === "SALDO" ? "Saldo" : "PayLater"}) berhasil`);
      setInquiry(null); setNumber("");
    } catch (e) {
      showToast((e as Error).message);
      setPinOpen(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Tagihan</h1>
      {/* katalog */}
      <section className="grid grid-cols-3 gap-2" data-testid="katalog-tagihan">
        {KATALOG.map((k) => (
          <button
            key={k.provider}
            onClick={() => mulai(k.provider)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center text-[11px] ${provider === k.provider ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 bg-qpi-surface text-slate-300"}`}
          >
            <span aria-hidden className="text-xl">{k.icon}</span>
            {k.label}
          </button>
        ))}
      </section>

      {/* inquiry */}
      <label className="block text-xs text-slate-400">
        Nomor pelanggan / HP
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          inputMode="numeric"
          placeholder="mis. 1234567"
          className="mt-1 w-full rounded-xl bg-qpi-surface px-3 py-2 text-sm text-white"
        />
      </label>
      <Button disabled={!number || busy} onClick={cek}>Cek tagihan</Button>

      {inquiry && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm" data-testid="detail-tagihan">
          <div className="flex justify-between"><span className="text-emerald-200/70">Provider</span><span>{inquiry.provider}</span></div>
          <div className="flex justify-between"><span className="text-emerald-200/70">Nomor</span><span>{inquiry.number}</span></div>
          <div className="mt-1 flex justify-between font-bold"><span>Total</span><span>{formatIdr(inquiry.amount)}</span></div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setSource("SALDO")} className={`flex-1 rounded-lg border px-3 py-2 text-xs ${source === "SALDO" ? "border-violet-400 bg-violet-500/20" : "border-white/15"}`}>Saldo</button>
            <button onClick={() => setSource("PAYLATER")} className={`flex-1 rounded-lg border px-3 py-2 text-xs ${source === "PAYLATER" ? "border-violet-400 bg-violet-500/20" : "border-white/15"}`}>PayLater</button>
          </div>
          <Button className="mt-3 w-full" onClick={() => setPinOpen(true)}>Bayar dengan PIN</Button>
        </section>
      )}

      {receipt && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300" data-testid="tagihan-receipt">{receipt}</div>}
      <PinPad open={pinOpen} title={inquiry ? `Masukkan PIN — ${formatIdr(inquiry.amount)}` : "Masukkan PIN"} onPin={submit} onClose={() => setPinOpen(false)} />
    </main>
  );
}
