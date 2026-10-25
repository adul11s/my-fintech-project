"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";
export function Button({
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = "rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const styles: Record<Variant, string> = {
    primary: "bg-violet-500 text-white hover:bg-violet-400",
    ghost: "border border-white/15 text-slate-200 hover:bg-white/10",
    danger: "bg-rose-500/90 text-white hover:bg-rose-400",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}
