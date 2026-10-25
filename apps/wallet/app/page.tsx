"use client";

import Link from "next/link";
import { formatIdr } from "@fintech/ui";

/** Zona wallet — halaman ringkas; alur wallet utama milik container (/topup, /transfer, dst). */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col gap-4 px-4 py-8">
      <h1 className="text-xl font-black tracking-tight text-violet-300">QUPI — Zone</h1>
      <p className="text-sm text-slate-400">
        Zona ini menyediakan aksi wallet &amp; format Rupiah bersama. Alur lengkap (Top Up Sandbox,
        Transfer, QRIS, Tagihan, PayLater, Riwayat, Profil) berjalan di container root.
      </p>
      <Link href="/" className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-center text-sm font-bold text-violet-200">
        Buka beranda QUPI →
      </Link>
      <p className="text-xs text-slate-500">Contoh format Rp: {formatIdr(1234567)}</p>
    </main>
  );
}
