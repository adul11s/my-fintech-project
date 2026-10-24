import { Card, formatIdr, formatMovement } from "@fintech/ui";
import { movements } from "@/lib/mock";
import Link from "next/link";

/** Prefix for links when this zone is served behind the container (e.g. "/accounts"). */
const zoneBase = process.env.NEXT_PUBLIC_ZONE_BASE ?? "";

export default function TransactionsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions <span className="text-sm font-medium text-slate-500">· all accounts</span></h1>
        <Link href={`${zoneBase}/`} className="text-sm text-emerald-400 hover:underline">
          ← Back to accounts
        </Link>
      </header>

      <Card title="Last 6 movements">
        <div className="mb-4 h-px bg-slate-800" />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2">Date</th>
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={`${m.date}-${m.description}`} className="border-t border-slate-800 hover:bg-slate-800/40">
                <td className="py-2 text-slate-400">{m.date}</td>
                <td className="py-2">{m.description}</td>
                <td className={`py-2 text-right font-semibold ${m.amount < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {formatMovement(m.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 border-t border-slate-700 pt-3 text-right text-sm font-bold tabular-nums text-slate-200">
          Net: {formatIdr(movements.reduce((sum, m) => sum + m.amount, 0))}
        </p>
      </Card>
    </main>
  );
}
