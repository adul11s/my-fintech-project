import { Keypad } from "./Keypad";
import { Button } from "./Button";
import type { ReactNode } from "react";

/** Bar nav QUPI — hadir di semua halaman (container & zones). */
export function AppHeader({ authed, name }: { authed?: boolean; name?: string | null }) {
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 lg:max-w-5xl">
        <a href="/" className="text-lg font-black tracking-tight text-violet-400">
          QUPI
        </a>
        <span className="text-xs text-slate-400">{authed ? `Halo, ${name ?? "Sahabat"}` : "Belum masuk"}</span>
      </div>
      <nav className="mx-auto flex w-full max-w-md gap-2 overflow-x-auto px-4 pb-2 lg:max-w-5xl [scrollbar-width:none]">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export { Keypad, Button };
export type ShellChildren = ReactNode;
