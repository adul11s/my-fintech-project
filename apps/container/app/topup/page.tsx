"use client";

import { useState } from "react";
import { Button, formatIdr } from "@fintech/ui";
import { qupi } from "@fintech/api-client";
import { useRequireSession, useSession, appendLedger } from "../session";
import { PinPad } from "../pin-pad";

const PRESETS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export default function TopUpPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const nominal = amount ?? Number(custom || 0);
  const valid = nominal > 0;

  const submit = async (pin: string) => {
    setBusy(true);
    try {
      await qupi.topup(nominal);
      appendLedger({ kind: "TOPUP", title: "Top Up", amount: nominal, signed: 1, status: "SUCCESS" });
      setPinOpen(false);
      showToast(`Top up ${formatIdr(nominal)} berhasil`);
      setAmount(null);
      setCustom("");
    } catch (e) {
      showToast((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Top Up SandBox</h1>
      <p className="text-sm text-slate-400">Pilih nominal preset atau masukkan nominal sendiri.</p>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`rounded-xl border px-2 py-3 text-sm font-semibold ${
              amount === p ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 bg-qpi-surface text-slate-300"
            }`}
          >
            {formatIdr(p)}
          </button>
        ))}
      </div>
      <label className="block text-xs text-slate-400">
        Nominal lain
        <input
          inputMode="numeric"
          value={custom}
          onChange={(e) => { setCustom(e.target.value.replace(/\D/g, "")); setAmount(null); }}
          placeholder="mis. 75000"
          className="mt-1 w-full rounded-xl bg-qpi-surface px-3 py-2 text-sm text-white"
        />
      </label>
      <Button disabled={!valid} onClick={() => setPinOpen(true)}>
        Konfirmasi Top Up {valid ? formatIdr(nominal) : ""}
      </Button>
      <PinPad open={pinOpen} title={`Masukkan PIN — Top Up ${formatIdr(nominal)}`} onPin={submit} onClose={() => setPinOpen(false)} />
      {busy && <p className="text-center text-xs text-slate-400">Memproses…</p>}
    </main>
  );
}
