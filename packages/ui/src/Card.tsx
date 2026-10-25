import type { ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#16161f] p-5 ${className}`}>
      {title ? (
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
