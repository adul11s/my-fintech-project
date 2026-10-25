# Video Script — qupi-apps UI (90 detik)

**Format:** rekuran layar 1080p, 90 detik. Fokus UI; endpoint dikenalkan pada backend video terpisah (QUPI Backend).
**Setup:** backend :4000 hidup, container :3000, wallet :3002, credit :3003 (zombie zone tak perlu).

| # | Detik | Layar | Subtitle / VO |
|---|---|---|---|
| 1 | 0–6 | Landing + banner "Sandbox / data simulasi" | "Micro-frontend 3 zona yang komunikasi via api-client." |
| 2 | 6–14 | Zona wallet :3002 — topup flow sukses | "Topup dipanggil ke API :4000, toast sukses + saldo naik di zona wallet." |
| 3 | 14–24 | Transfer antar kontak; B user dapat notif (bila ada) | "Transfer lintas pengguna; setiap step error state pakai pesan dari backend." |
| 4 | 24–34 | QRIS page → scan → success animasi | "QRIS konsumsi checkout → pay endpoint; balasan idempoten." |
| 5 | 34–46 | Tagihan + paylater checkout → installment table | "Paylater cukup dengan 1 klik checkout; payment schedule tampil." |
| 6 | 46–56 | Profil: upload KYC → status PENDING | "KYC upload chunked base64 — file 2MB tidak lagi RangeError; guard 4MB + pesan 413." |
| 7 | 56–68 | Console/DevTools: 4 route HTTP 200; network panel api-client x-session-token | "Setiap zona jaga kontrak api-client; token untuk semua zona." |
| 8 | 68–80 | CI GitHub Actions hijau + tree struktur apps/ | "CI: npm ci, typecheck, eslint, build semua workspace." |
| 9 | 80–90 | README: known gaps jujur | "Known gaps didokumentasikan — sandbox data, queue in-memory. Kode di bawah!" |

**Catatan:** tampilkan banner sandbox di segmen pertama (jangan disembunyikan); screenshot sudah ada di `docs/screenshots/01..07` untuk thumbnail/motion blend.
