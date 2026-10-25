"use client";

import { useState } from "react";
import { Button, Keypad, PinDots } from "@fintech/ui";
import { qupi, saveToken } from "@fintech/api-client";

type Step = "phone" | "otp" | "pin";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("62");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [otpShown, setOtpShown] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 1) Daftar (register mengembalikan user id) — nomor sudah terdaftar → info
  const daftar = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await qupi.register(phone, name || "Sahabat QUPI");
      const uid = (r as { data?: { id: string } }).data?.id ?? null;
      if (!uid) throw new Error("Registrasi gagal");
      setUserId(uid);
      localStorage.setItem(`qupi.id.${phone}`, uid);
      const o = await qupi.requestOtp(uid, "LOGIN");
      setOtpShown((o as { otp?: string }).otp ?? "");
      setMsg(o.message ?? "OTP dikirim");
      setStep("otp");
    } catch (e) {
      // nomor sudah terdaftar: gunakan id yang tersimpan dari registrasi sebelumnya
      const saved = localStorage.getItem(`qupi.id.${phone}`);
      if (saved) {
        setUserId(saved);
        try {
          const o = await qupi.requestOtp(saved, "LOGIN");
          setOtpShown((o as { otp?: string }).otp ?? "");
          setMsg(o.message ?? "OTP dikirim");
          setStep("otp");
        } catch (e2) {
          setErr((e2 as Error).message);
        }
      } else {
        setErr(`${(e as Error).message} — nomor tidak dikenal di perangkat ini.`);
      }
    }
    setBusy(false);
  };

  // 2) Verifikasi OTP (tiap digit lengkap → otomatis)
  const verifikasi = async () => {
    if (otp.length !== 6 || !userId) return;
    setBusy(true);
    try {
      const r = await qupi.verifyOtp(userId, otp);
      if (!r.success) throw new Error(r.message ?? "Verifikasi OTP gagal");
      setMsg("OTP terverifikasi — buat PIN 6 digit");
      setStep("pin");
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setOtp("");
    }
    setBusy(false);
  };

  // 3) Simpan PIN + login + simpan sesi container (kedaluwarsa idle 15 menit)
  const simpanPin = async (digits: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      await qupi.setPin(userId, digits);
      const r = await qupi.login(userId, undefined, digits);
      saveToken(((r as { data?: { sessionToken?: string } }).data?.sessionToken ?? "") as string);
      localStorage.setItem("qupi.session", JSON.stringify({ userId, name: name || "Sahabat", at: Date.now() }));
      setErr(null);
      setMsg("Masuk berhasil — mengalihkan…");
      window.location.href = "/";
    } catch (e) {
      setErr((e as Error).message);
      setPin("");
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-5 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-violet-400">QUPI</h1>
        <p className="text-sm text-slate-400">Masuk dengan nomor HP, OTP, dan PIN</p>
      </div>

      {msg && <p data-testid="auth-msg" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-300">{msg}</p>}
      {err && <p data-testid="auth-error" className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">{err}</p>}

      {step === "phone" && (
        <section className="rounded-2xl border border-white/10 bg-qpi-surface p-5">
          <label className="block text-xs text-slate-400">
            Nomor HP (format 62xxx)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="628xxxxxxxxx"
              data-testid="input-phone"
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2.5 text-white"
            />
          </label>
          <label className="mt-3 block text-xs text-slate-400">
            Nama
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tampilan" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2.5 text-white" />
          </label>
          <Button className="mt-4 w-full" onClick={daftar} disabled={busy || !/^(62)\d{8,14}$/.test(phone)}>
            {busy ? "Memproses…" : "Lanjut"}
          </Button>
          <p className="mt-2 text-center text-xs text-slate-500">Nomor belum terdaftar akan otomatis didaftarkan.</p>
        </section>
      )}

      {step === "otp" && (
        <section className="rounded-2xl border border-white/10 bg-qpi-surface p-5" data-testid="step-otp">
          <p className="text-center text-sm text-slate-300">Masukkan 6 digit OTP</p>
          {otpShown && <p className="text-center text-xs text-amber-300">Kode OTP (sandbox): {otpShown}</p>}
          <div className="mt-4"><PinDots filled={otp.length} error={!!err} /></div>
          <div className="mt-4">
            <Keypad
              onKey={(k) => {
                const next = (otp + k).slice(0, 6);
                setOtp(next);
                if (next.length === 6) setTimeout(() => void verifikasi(), 50);
              }}
              onClear={() => setOtp("")}
            />
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => void daftar()} disabled={busy}>Kirim ulang OTP</Button>
        </section>
      )}

      {step === "pin" && (
        <section className="rounded-2xl border border-white/10 bg-qpi-surface p-5" data-testid="step-pin">
          <p className="text-center text-sm text-slate-300">Buat PIN 6 digit ({name || "Sahabat"})</p>
          <div className="mt-4"><PinDots filled={pin.length} error={!!err} /></div>
          <div className="mt-4">
            <Keypad
              onKey={(k) => {
                const next = (pin + k).slice(0, 6);
                setPin(next);
                if (next.length === 6) setTimeout(() => void simpanPin(next), 50);
              }}
              onClear={() => setPin("")}
            />
          </div>
        </section>
      )}
    </main>
  );
}
