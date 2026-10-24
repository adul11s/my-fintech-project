import { Card } from "@fintech/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Micro-frontend architecture
        </p>
        <h1 className="mt-2 text-3xl font-black leading-snug sm:text-4xl">
          Three independent Next.js apps.
          <br />
          One seamless shell.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          The container owns the layout and navigation, while each business domain
          (accounts, loans) is an independently buildable and deployable zone.
          Zones are composed at the edge with <code className="text-emerald-300">rewrites</code>{" "}
          and share visual language through <code className="text-emerald-300">@fintech/ui</code>.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Accounts zone">
          <p className="text-sm leading-relaxed text-slate-300">
            Balances and transaction history. React Server Components, mock data,
            deterministic output.
          </p>
          <Link href="/accounts" className="mt-3 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
            Open /accounts →
          </Link>
        </Card>
        <Card title="Loans zone">
          <p className="text-sm leading-relaxed text-slate-300">
            Annuity loan simulator — Indonesian consumer-lending installment preview.
          </p>
          <Link href="/loans" className="mt-3 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
            Open /loans →
          </Link>
        </Card>
        <Card title="Shared design kit">
          <p className="text-sm leading-relaxed text-slate-300">
            Card, Stat, Header/Footer chrome, currency formatters and the annuity
            formula live in one workspace package, so every zone stays consistent.
          </p>
        </Card>
        <Card title="Why multi-zone?">
          <p className="text-sm leading-relaxed text-slate-300">
            Independent deploys, independent type safety, no extra runtime (no federation
            loader) — the pragmatic pattern for Next.js scale-ups.
          </p>
        </Card>
      </div>

      <Card title="Run it locally">
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
{`npm install
npm run dev:container   # shell  -> http://localhost:3000
npm run dev:accounts    # remote -> http://localhost:3001
npm run dev:loans       # remote -> http://localhost:3002`}
        </pre>
        <p className="mt-2 text-xs text-slate-400">
          In composed mode the shell proxies /accounts/* and /loans/* — one origin, three apps.
        </p>
      </Card>
    </main>
  );
}
