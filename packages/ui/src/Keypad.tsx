"use client";

import type { ReactNode } from "react";

/** Keypad kustom 3x4 (angka, 000, hapus) — dipakai PIN & nominal. */
export function Keypad({
  onKey,
  onClear,
}: {
  onKey: (key: string) => void;
  onClear?: () => void;
}) {
  const keys: ReactNode[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  keys.push(
    onClear ? (
      <button key="c" onClick={onClear} className="text-xs font-semibold text-slate-400 hover:text-slate-200">
        HAPUS
      </button>
    ) : (
      <span key="c" />
    ),
    "0",
    <span key="b" className="text-violet-400/60 text-xl leading-none select-none">⌫</span>,
  );
  return (
    <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-2">
      {keys.map((k, i) => {
        const label = typeof k === "string" ? k : i === 11 ? "back" : "clear";
        return typeof k === "string" ? (
          <button
            key={label + i}
            onClick={() => onKey(k)}
            className="h-12 rounded-xl bg-white/5 text-lg font-bold text-slate-100 hover:bg-white/10 active:bg-white/20"
          >
            {k}
          </button>
        ) : (
          <button
            key={"slot" + i}
            onClick={() => onKey(label === "back" ? "back" : "clear")}
            className="flex h-12 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 [&>span]:pointer-events-none"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

/** 6 dots indikator input PIN. */
export function PinDots({ filled, error }: { filled: number; error?: boolean }) {
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full border transition ${
            error
              ? "border-rose-400 bg-rose-400"
              : i < filled
                ? "border-violet-400 bg-violet-400"
                : "border-slate-600 bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}
