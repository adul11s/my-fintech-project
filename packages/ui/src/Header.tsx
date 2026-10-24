import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/accounts", label: "Accounts" },
  { href: "/accounts/transactions", label: "Transactions" },
  { href: "/loans", label: "Loans" },
];

/** Shared product chrome — every zone renders the same header, so the
 * composed URL space feels like ONE app regardless of which zone serves it. */
export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-black tracking-tight">
          <span className="text-emerald-400">◆</span> FinTech&nbsp;MFE
        </Link>
        <nav className="flex gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:bg-slate-800"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
