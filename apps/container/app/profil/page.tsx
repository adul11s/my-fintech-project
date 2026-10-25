"use client";

import { useEffect, useRef, useState } from "react";
import { Button, formatIdr } from "@fintech/ui";
import { qupi, API_BASE_URL, getToken } from "@fintech/api-client";
import { useRequireSession, useSession } from "../session";

export default function ProfilPage() {
  const session = useRequireSession();
  const { showToast } = useSession();
  const [kycStatus, setKycStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "NONE">("NONE");
  const [balance, setBalance] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState("Unggah KTP");
  const fileRef = useRef<HTMLInputElement>(null);
  const user = session; // info user langsung dari sesi — tidak perlu state terpisah

  const [kyc, setKyc] = useState<typeof kycStatus | null>(null);

  useEffect(() => {
    if (!session) return;
    // baca status KYC lokal SETELAH mount — hindari hydration mismatch
    Promise.resolve().then(() => {
      setKyc((localStorage.getItem(`qupi.kyc.${session.userId}`) as typeof kycStatus | null) ?? null);
    });
    // saldo via backend (session header)
    qupi.balance().then((r) => setBalance(((r.data ?? {}) as { balance?: number }).balance ?? null)).catch(() => setBalance(null));
    // status KYC asli: GET /identity/kyc/documents
    fetch(`${API_BASE_URL}/identity/kyc/documents`, { headers: { "x-session-token": getToken() ?? "" } })
      .then((r) => r.json())
      .then((j) => {
        const docs = (j.data ?? []) as { status?: string }[];
        const st = docs[0]?.status as typeof kycStatus | undefined;
        if (st) { setKycStatus(st); setKyc(st); }
        void st;
      })
      .catch(() => {});
  }, [session]);

  if (!session) return <main className="mx-auto max-w-md px-4 py-8"><div className="qpi-skel h-40 rounded-2xl" /></main>;

  const onUpload = async (f: File) => {
    const OK_TYPES = ["application/pdf", "image/jpeg", "image/png"];
    if (!OK_TYPES.includes(f.type)) {
      showToast("Format file harus PDF, JPG, atau PNG");
      return;
    }
    const MAX_KYC = 4 * 1024 * 1024; // 4 MB — jaga di klien sebelum upload
    if (f.size > MAX_KYC) {
      showToast("KTP terlalu besar — maksimal 4MB, silakan kompres dulu");
      return;
    }
    setKycStatus("PENDING");
    setUploadLabel("KTP terunggah — menunggu verifikasi");
    try {
      // Base64 chunked: spread seluruh Uint8Array (2MB+) melebihi batas argumen
      // fungsi dan melempar RangeError, jadi encodeURIComponent per blok 8KB.
      const buf = new Uint8Array(await f.arrayBuffer());
      let binary = "";
      const CHUNK = 8192;
      for (let i = 0; i < buf.length; i += CHUNK) {
        binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
      }
      const content = btoa(binary);
      await qupi.kycUpload(content, f.name);
      // status PENDING hanya disimpan setelah upload benar-benar sukses —
      // kegagalan (413/jaringan) tidak boleh memblokir unggah ulang
      localStorage.setItem(`qupi.kyc.${session.userId}`, "PENDING");
      setKycStatus("PENDING");
      showToast("KTP terkirim ke server — status PENDING");
    } catch (e) {
      const err = e as Error & { status?: number };
      setKycStatus("NONE"); setKyc("NONE");
      localStorage.removeItem(`qupi.kyc.${session.userId}`);
      if (err.status === 413) {
        showToast("KTP terlalu besar — server menolak (413). Kompres lalu unggah ulang.");
      } else {
        showToast(err.message);
      }
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
      <h1 className="text-lg font-bold">Profil</h1>
      <section className="rounded-2xl border border-white/10 bg-qpi-surface p-4 text-sm">
        <div className="flex justify-between py-1"><span className="text-slate-400">Nama</span><span>{user?.name ?? session.name}</span></div>
                <div className="flex justify-between py-1"><span className="text-slate-400">Saldo</span><span>{balance === null ? "…" : formatIdr(balance)}</span></div>
        <div className="flex justify-between py-1"><span className="text-slate-400">Sesi berlaku</span><span>hingga idle (server-enforced)</span></div>
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
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
        onClick={async () => {
          // revoke token di server, baru bersihkan sesi lokal
          try { await qupi.logout(); } catch { /* abaikan — tetap logout lokal */ }
          localStorage.removeItem("qupi.session");
          window.location.href = "/auth";
        }}
      >
        Keluar
      </Button>
    </main>
  );
}
