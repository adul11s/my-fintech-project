"use client";

import { useEffect, useState } from "react";
import { Keypad, PinDots } from "@fintech/ui";

/** Modal konfirmasi PIN 6 digit (keypad kustom 3x4 + dots). */
export function PinPad({ open, title, onPin, onClose }: {
  open: boolean;
  title: string;
  onPin: (pin: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (open) { setPin(""); setBusy(false); setErr(false); }
  }, [open]);

  if (!open) return null;

  const press = async (k: string) => {
    if (busy) return;
    setErr(false);
    if (k === "back") return setPin((p) => p.slice(0, -1));
    if (k === "clear") return setPin("");
    const next = pin + k;
    if (next.length > 6) return;
    setPin(next);
    if (next.length === 6) {
      setBusy(true);
      try {
        await onPin(next);
      } catch {
        setErr(true);
        setPin("");
      }
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-2xl border border-white/10 bg-qpi-surface p-6 lg:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-bold">{title}</p>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
            Tutup
          </button>
        </div>
        <PinDots filled={pin.length} error={err} />
        {err && <p className="mt-2 text-center text-xs text-rose-400">PIN lebih dari 6 digit.</p>}
        <div className="mt-6">
          <Keypad onKey={press} onClear={() => press("clear")} />
        </div>
      </div>
    </div>
  );
}
