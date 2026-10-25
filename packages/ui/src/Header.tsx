import Link from "next/link";

/** Shared top chrome for every zone — same nav everywhere, one product. */
const nav = [
  { href: "/wallet", label: "Qupi Home" },
  { href: "/wallet/transfer", label: "Transfer" },
  { href: "/wallet/qris", label: "QRIS" },
  { href: "/wallet/bills", label: "Tagihan" },
  { href: "/credit", label: "Credit" },
];

export function Header({ signedIn = true }: { signedIn?: boolean }) {
  return (
    <header className="border-b border-white/10 bg-[#101019]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-black tracking-tight text-white">
          <span className="text-violet-400">◈ </span>QUPI
        </Link>
        {signedIn ? (
          <nav className="flex text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        ) : (
          <Link
            href="/auth"
            className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-400"
          >
            Enter
          </Link>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
      QUPI demo — dompet + BNPL. Data mock di SQLite lokal · Next.js multi-zone MFE.
    </footer>
  );
}
