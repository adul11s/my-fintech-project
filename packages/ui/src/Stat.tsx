import { formatIdr } from "./format";

export function MoneyStat({ label, value, hint, tone = "default" }: {
  label: string;
  value: number;
  hint?: string;
  tone?: "default" | "violet";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#16161f] p-5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-2xl font-black tabular-nums ${tone === "violet" ? "text-violet-400" : "text-white"}`}>
        {formatIdr(value)}
      </span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}
