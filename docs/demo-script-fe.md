# Skrip Demo Visual — Frontend QUPI (5 menit)

Prasyarat: backend API hidup di `http://localhost:4000/api`, container di
`:3000` (`npm run dev`), user demo sudah di-seed dari repo backend
(`npm run seed`).

**User demo:**
| User | Nomor HP   | PIN    | Saldo awal | PayLater                       |
|------|------------|--------|------------|--------------------------------|
| Andi | 628123456789 | 123456 | Rp 1.000.000   | aktif, sebagian terpakai, 1 jadwal cicilan 3 bulan |
| Budi | 628123456790 | 123456 | Rp 500.000    | —                              |

Tangkapan layar tiap langkah tersimpan di `docs/screenshots/`.

---

## 1. Beranda (screenshot: `01-beranda.png`)

1. Buka `http://localhost:3000` — bila belum login, dialihkan ke `/auth`.
2. Login: nomor `628123456789`, PIN `123456` (PIN pad).
3. Di beranda: banner **"Sandbox / data simulasi"** di atas, kartu saldo
   (Rp 1.000.000), ringkasan PayLater, 8 tombol aksi cepat, dan 3 transaksi
   terakhir.

## 2. Top Up (screenshot: `02-topup.png`)

1. Klik **Top Up**.
2. Isi nominal, mis. `50000`, tombol **Proses**.
3. Saldo di beranda bertambah, riwayat menampilkan Top Up.

## 3. Transfer (screenshot: `03-transfer.png`)

1. Klik **Transfer**.
2. Masukkan nomor HP tujuan `628123456790` (Budi) — nama ter-lookup.
3. Nominal `25000`, PIN `123456`, kirim.
4. Buka `http://localhost:3000`, login Budi, lihat riwayat masuk.

## 4. QRIS pay (screenshot: `04-qris.png`)

1. Klik **QRIS**.
2. Pilih nominal/meja (data simulasi), tampilkan QR pad.
3. Pay dengan PIN — status sukses, masuk riwayat sebagai belanja.

## 5. Tagihan / bayar bill (screenshot: `05-tagihan.png`)

1. Klik **Tagihan**.
2. Pilih provider (PLN/PDAM simulasi), masukkan nomor bill, **Inquiry** —
   nominal muncul.
3. **Bayar** dengan PIN — tagihan lunas.

## 6. PayLater (screenshot: `06-paylater.png`)

1. Klik **PayLater**.
2. Lihat limit, terpakai, sisa. **Checkout** nominal, kirim PIN.
3. Rencana cicilan 3 bulan tampil di halaman yang sama.

## 7. Bayar cicilan PayLater (screenshot: lihat `06-paylater.png`)

1. Tetap di `/paylater`, pilih tuntas rencana, bayar PIN.
2. "Terpakai" turun; status kembali lancar.

## 8. Riwayat (screenshot: `08-riwayat.png`)

1. Klik **Riwayat** dari menu.
2. Semua transaksi muncul: topup, transfer, QRIS, tagihan, cicilan — dengan
   status (SUCCESS/PENDING) dan waktu.
3. Badge pending di beranda ikut berkurang.

## 9. Profil (screenshot: `09-profil.png`, opsional)

1. Klik **Profil** — status KYC (simulasi), data user.

---

### Catatan

- Semua angka & nama dari backend stub — bukan uang asli.
- Jika backend mati: app tetap hidup di `:3000`, tapi seluruh halaman hanya
  menampilkan skeleton/pesan errors; skrip demo membutuhkan backend.
- Screenshot disimpan ke `docs/screenshots/*.png`, diregenerasi tiap kali UI
  berubah bermakna.
