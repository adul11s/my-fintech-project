import { formatIdr } from "./format";

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  /** Numeric IDR value, or any text. */
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-900 p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums text-emerald-400">
        {typeof value === "number" ? formatIdr(value) : value}
      </span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}
