"use client";

import { useState, useRef } from "react";
import { Button, Keypad, formatIdr } from "@fintech/ui";
import { qupi, makeIntentKey } from "@fintech/api-client";
import { useRequireSession, useSession, appendLedger } from "../session";
import { PinPad } from "../pin-pad";

interface Saved { phone: string; name: string }

export default function TransferPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [idem, setIdem] = useState<string | null>(null);
  const intentRef = useRef<string | null>(null);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  // Penerima tersimpan: cukup nomor HP (62xxx) — display nama; userId fiktif (acct-demo-*) dihapus
  // karena tidak ada sebagai user di backend (FK 500). Resume: endpoint daftar penerima belum tersedia.
  const saved: Saved[] = [
    { phone: "6281234567890", name: "Budi Santoso" },
    { phone: "6289876543210", name: "Sari Rahma" },
  ];
  const amt = Number(amount || 0);
  const valid = !!to && amt > 0;

  const submit = async (pin: string) => {
    if (!session) return;
    // idempotency per intent: kunci dibuat sekali, dipakai ulang saat retry
    const key = (intentRef.current = intentRef.current ?? makeIntentKey());
    setIdem(key);
    try {
      // peserta: input harus nomor HP 62xxx → resolve via lookup; jangan kirim userId fiktif
      const toPhone = to.replace(/[^\d]/g, "");
      if (!/^62\d{8,14}$/.test(toPhone)) {
        showToast("Nomor tujuan harus format HP 62xxx (mis. 62812…)");
        setPinOpen(false);
        return;
      }
      const look = await qupi.lookupUser(toPhone);
      const toUser = ((look as { data?: { id?: string } }).data?.id ?? toPhone) as string;
      await qupi.transfer(toUser, amt, pin, key);
      appendLedger({ kind: "TRANSFER", title: `Transfer ke ${to}`, amount: amt, signed: -1, status: "SUCCESS" });
      intentRef.current = null; // jalur sukses: reset — niat berikutnya pakai key baru
      setPinOpen(false);
      setDone(`Transfer ${formatIdr(amt)} ke ${to} berhasil. Biaya Rp0.`);
      setTo(""); setAmount("");
    } catch (e) {
      showToast(`${(e as Error).message} — coba lagi (idempotency ${key})`);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Transfer</h1>
      {done && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4" data-testid="transfer-receipt">
          <p className="text-sm font-bold text-emerald-300">{done}</p>
          <p className="text-xs text-emerald-200/70">ID Idempotensi: {idem}</p>
        </div>
      )}
      <section className="rounded-xl border border-white/10 bg-qpi-surface p-3">
        <p className="mb-2 text-xs text-slate-400">Penerima tersimpan</p>
        <div className="flex gap-2 overflow-x-auto">
          {saved.map((s) => (
            <button
              key={s.phone}
              onClick={() => setTo(s.phone)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${to === s.phone ? "border-violet-400 bg-violet-500/20" : "border-white/10"}`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="ml-1 text-slate-500">{s.phone}</span>
            </button>
          ))}
        </div>
      </section>
      <label className="block text-xs text-slate-400">
        No HP tujuan (62xxx)
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          inputMode="numeric"
          placeholder="62812…"
          className="mt-1 w-full rounded-xl bg-qpi-surface px-3 py-2 text-sm text-white"
        />
      </label>
      <div className="rounded-xl border border-white/10 bg-qpi-surface p-3">
        <p className="text-center text-2xl font-black text-white">{formatIdr(amt)}</p>
        <div className="mt-1 text-center text-xs text-slate-500">Biaya transfer: Rp0</div>
        <div className="mt-3">
          <Keypad
            onKey={(k) => setAmount(a => (a + k).replace(/^0+(?=\d)/, ""))}
            onClear={() => setAmount("")}
          />
        </div>
      </div>
      <Button disabled={!valid} onClick={() => setPinOpen(true)}>Konfirmasi Transfer</Button>
      <PinPad open={pinOpen} title={`Masukkan PIN — Transfer ${formatIdr(amt)}`} onPin={submit} onClose={() => setPinOpen(false)} />
    </main>
  );
}
