import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/30 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
