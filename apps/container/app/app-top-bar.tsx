"use client";

import Link from "next/link";
import { useSession } from "./session";

/** Top bar QUPI: logo + nav chip — hadir di semua halaman container. */
export function AppTopBar() {
  const { session, toast } = useSession();
  const authed = !!session?.userId;
  const links: { href: string; label: string }[] = authed
    ? [
        { href: "/", label: "Beranda" },
        { href: "/topup", label: "Top Up" },
        { href: "/transfer", label: "Transfer" },
        { href: "/qris", label: "QRIS" },
        { href: "/tagihan", label: "Tagihan" },
        { href: "/paylater", label: "PayLater" },
        { href: "/riwayat", label: "Riwayat" },
        { href: "/profil", label: "Profil" },
      ]
    : [
        { href: "/", label: "Beranda" },
        { href: "/auth", label: "Masuk" },
      ];
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 lg:max-w-6xl">
          <Link href="/" className="text-xl font-black tracking-tight text-violet-400">QUPI</Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            {authed ? `Halo, ${session?.name ?? "Sahabat"}` : "Belum masuk"}
          </span>
        </div>
        <nav className="mx-auto flex w-full max-w-md gap-2 overflow-x-auto px-4 pb-2 lg:max-w-6xl [scrollbar-width:none]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>
      {toast && (
        <div
          role="status"
          data-testid="qpi-toast"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-center text-sm text-violet-200"
        >
          {toast}
        </div>
      )}
    </>
  );
}
