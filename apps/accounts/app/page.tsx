import { Card, MoneyStat, formatIdr } from "@fintech/ui";
import { accounts } from "@/lib/mock";
import Link from "next/link";

/** Prefix for links when this zone is served behind the container (e.g. "/accounts"). */
const zoneBase = process.env.NEXT_PUBLIC_ZONE_BASE ?? "";

export default function AccountsPage() {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Link
          href={`${zoneBase}/transactions`}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          View transactions →
        </Link>
      </header>

      <MoneyStat label="Total balance" value={total} hint="All accounts combined" />

      <div className="grid gap-4 sm:grid-cols-3">
        {accounts.map((a) => (
          <Card key={a.id} title={a.type}>
            <p className="text-sm text-slate-400">{a.name}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-emerald-400">{formatIdr(a.balance)}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
