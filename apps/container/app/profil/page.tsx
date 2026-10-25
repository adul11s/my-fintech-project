"use client";

import { useEffect, useRef, useState } from "react";
import { Button, formatIdr } from "@fintech/ui";
import { qupi } from "@fintech/api-client";
import { useRequireSession, useSession } from "../session";

export default function ProfilPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [user, setUser] = useState<{ id: string; name?: string; phone?: string } | null>(null);
  const [kycStatus, setKycStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "NONE">("NONE");
  const [balance, setBalance] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState("Unggah KTP");
  const fileRef = useRef<HTMLInputElement>(null);

  const kyc = typeof window !== "undefined" ? (localStorage.getItem(`qupi.kyc.${session?.userId}`) as typeof kycStatus | null) : null;

  useEffect(() => {
    if (!session) return;
    qupi.getUser(session.userId).then((r) => setUser(r.data ?? null)).catch(() => setUser(null));
    qupi.balance(session.userId).then((r) => setBalance(r.data?.balance ?? null)).catch(() => setBalance(null));
  }, [session]);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const onUpload = async (f: File) => {
    setKycStatus("PENDING");
    setUploadLabel("KTP terunggah — menunggu verifikasi");
    try {
      const res = await qupi.uploadKycDocument(session.userId, f);
      if (res.ok) showToast("KTP terkirim ke server");
      else showToast("Endpoint upload belum siap — status disimpan lokal");
    } catch {
      showToast("Endpoint upload belum siap — status disimpan lokal");
    }
    localStorage.setItem(`qupi.kyc.${session.userId}`, "PENDING");
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Profil</h1>
      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4 text-sm">
        <div className="flex justify-between py-1"><span className="text-slate-400">Nama</span><span>{user?.name ?? session.name}</span></div>
        <div className="flex justify-between py-1"><span className="text-slate-400">No HP</span><span>{user?.phone ?? "—"}</span></div>
        <div className="flex justify-between py-1"><span className="text-slate-400">Saldo</span><span>{balance === null ? "…" : formatIdr(balance)}</span></div>
        <div className="flex justify-between py-1"><span className="text-slate-400">Sesi berlaku</span><span>15 menit idle</span></div>
      </section>

      {/* KYC */}
      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4 text-sm" data-testid="kyc-section">
        <p className="mb-1 font-bold">Verifikasi KYC</p>
        <p className="text-xs text-slate-400">
          Band keamanan: <span className="font-semibold text-violet-300">{kycStatus === "APPROVED" ? "B1" : kycStatus === "PENDING" ? "B2 (menunggu)" : "B3"}</span> —
          band menentukan limit transfer/topup.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); }}
        />
        <Button
          className="mt-3"
          variant={kyc === "PENDING" ? "ghost" : "primary"}
          onClick={() => {
            if (kyc === "PENDING") showToast("Verifikasi masih diproses oleh tim — cek lagi nanti");
            else if (kyc === "REJECTED") fileRef.current?.click();
            else fileRef.current?.click();
          }}
        >
          {kyc === "PENDING" ? "Verifikasi KTP: Diproses" : kyc === "APPROVED" ? "KTP Terverifikasi ✓" : kyc === "REJECTED" ? "Unggah Ulang KTP" : uploadLabel}
        </Button>
      </section>

      <Button
        variant="danger"
        onClick={() => {
          localStorage.removeItem("qupi.session");
          window.location.href = "/auth";
        }}
      >
        Keluar
      </Button>
    </main>
  );
}
