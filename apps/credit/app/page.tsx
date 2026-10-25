"use client";

import Link from "next/link";
import { formatIdr } from "@fintech/ui";

/** Zona kredit — placeholder bergaya; alur PayLater lengkap di container (/paylater). */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col gap-4 px-4 py-8">
      <h1 className="text-xl font-black tracking-tight text-violet-300">QUPI — Zone Kredit</h1>
      <p className="text-sm text-slate-400">
        Zona kredit PayLater: aktivasi limit, cicilan 1/3/6 bulan, dan status terbayar.
        Alur lengkap di container root.
      </p>
      <Link href="/" className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-center text-sm font-bold text-violet-200">
        Buka beranda QUPI →
      </Link>
      <p className="text-xs text-slate-500">Contoh format Rp: {formatIdr(99000)}</p>
    </main>
  );
}
