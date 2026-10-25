"use client";

import type { InputHTMLAttributes } from "react";

export function Input({ label, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <input
        className={`w-full rounded-xl border border-white/10 bg-[#101019] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/60 ${className}`}
        {...rest}
      />
    </label>
  );
}
