# QUPI — Frontend Pilot Fintech (Next.js Multi-Zone)

Frontend pilot **QUPI** (portfolio, bukan produk go-live): Next.js App Router
dengan pola **multi-zone micro-frontend** — satu container shell yang
menyusun zona child via `rewrites()`, tanpa federasi runtime.

> ⚠️ **Sandbox / data simulasi.** Seluruh data di aplikasi ini adalah data
> demo yang dihasilkan backend stub (provider simulasi), bukan layanan
> finansial nyata. Banner "Sandbox / data simulasi" tampil permanen di
> halaman beranda.

## Struktur zona (yang benar-benar ada di repo)

| App              | Port saat dev | Route di shell      | Isi                                                        |
|------------------|---------------|---------------------|------------------------------------------------------------|
| `apps/container` | **3000**      | `/`                 | Shell, navigasi, dan seluruh halaman inti QUPI: auth (`app/auth`), topup, transfer, qris, tagihan, paylater, riwayat, profil |
| `apps/wallet`    | **3002**      | `/wallet/*`         | Zona child wallet (disusun via rewrites)                    |
| `apps/credit`    | **3003**      | `/credit/*`         | Zona child credit (disusun via rewrites)                    |
| `apps/auth`      | 3001          | —                   | **Tidak dipakai** di alur demo (auth lokal ada di container); tetap ada sebagai app, tidak direwrites |

Backend API dijalankan terpisah (repo backend) di `http://localhost:4000`,
default `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

### Zoning diagram

```mermaid
graph TD
    U[User] --> C
    subgraph container_3000 [apps/container :3000]
        C[App Shell — landing, auth, topup,<br>transfer, qris, tagihan, paylater, riwayat, profil]
        C --> RW[rewrites() /wallet/* dan /credit/*]
        RW --> W[apps/wallet :3002]
        RW --> CR[apps/credit :3003]
    end
    C -->|@fintech/api-client<br>x-session-token| B[Backend API :4000/api]
    W & CR -.transpilePackages.-> P[packages/ui + packages/api-client]
```

Teks alternatif (ASCII):

```
            Browser (:3000)
                 │
    ┌────────────▼─────────────┐
    │  apps/container   :3000  │─ app/auth, topup, transfer,
    │  shell + halaman inti    │  qris, tagihan, paylater,
    │                          │  riwayat, profil
    │  rewrites():             │
    │    /wallet/*  → :3002    │────────► apps/wallet :3002
    │    /credit/*  → :3003    │────────► apps/credit :3003
    └───────┬──────────────────┘
            │ fetch (NEXT_PUBLIC_API_URL, default :4000/api)
            ▼
       Backend API :4000  (repo backend terpisah, NestJS)
```

## Kontrak `packages/api-client`

- `@fintech/api-client` adalah satu-satunya jalur akses HTTP ke backend.
- `API_BASE_URL` diambil dari `NEXT_PUBLIC_API_URL` (default
  `http://localhost:4000/api`); NestJS memakai global prefix `/api`.
- Format respons: envelope `{ message?, data?, ... }`; client membukanya
  dengan tipe id-API, error dibaca dari `e?.message`.
- Autentikasi sesi: header `x-session-token`; respons `401` memicu
  `onUnauthorized` (SessionProvider) yang mengarahkan user ke `/auth`.
- Operasi mutasi mengirim `idempotencyKey` di body sesuai kontrak backend.
- Shared UI di `@fintech/ui` (`Card`, `formatIdr`, dll.) — dimuat semua
  zona lewat `transpilePackages`.

## Jalankan dari clone

```bash
# Backend (repo lain, NestJS) — jalankan dulu, FE fetch ke :4000/api
npm install && npm run start:dev   # http://localhost:4000/api

# Frontend (repo ini)
npm install
npm run dev          # container di http://localhost:3000
npm run dev:wallet   # http://localhost:3002 (juga via /wallet/* di :3000)
npm run dev:credit   # http://localhost:3003 (juga via /credit/* di :3000)
```

Seeding user demo dilakukan dari repo backend (`npm run seed`), bukan dari
repo frontend. Tanpa backend, halaman & transaksi menampilkan skeleton atau
pesan error — app tetap hidup.

### Mapping port ringkas

| Layanan            | Port |
|--------------------|------|
| Backend API        | 4000 |
| Container (shell)  | 3000 |
| Wallet zone        | 3002 |
| Credit zone        | 3003 |
| Auth app (idle)    | 3001 |

## Build & CI

- Build semua zona (auth/wallet/credit/container): `npm run build`.
- CI: `.github/workflows/ci.yml` — Node 22, `npm ci`, `tsc --noEmit` per
  workspace, `eslint` untuk app yang dipakai, lalu `npm run build`.

## Status test

- **Tidak ada test suite otomatis di frontend ini.** Pengaman kualitas di FE
  adalah `tsc --noEmit` (TypeScript strict, 0 error di semua workspace)
  dan eslint (0 error). Validasi perilaku uang ada di repo backend
  (ledger double-entry, idempotency, limit) dan test-nya ada di sana.
- Pengujian manual 5 menit per halaman terdokumentasi di
  `docs/demo-script-fe.md`, dengan tangkapan layar di `docs/screenshots/`.

## Keputusan teknis & trade-off FE

- **Container + rewrites, bukan module federation** — komposisi zona dilakukan
  server-side oleh `next.config.ts` (`rewrites()`), tanpa loader runtime.
  Build tiap zone tetap independen; tapi zona child hanya jadi halaman
  sederhana, bukan feature lengkap.
- **Halaman inti ada di container, bukan zona** — topup/transfer/qris/
  tagihan/paylater diletakkan di `apps/container` karena alur mereka saling
  sambung (session, PIN pad, banner sandbox); menghindari glue code lintas
  zone untuk alur uang yang harus konsisten.
- **api-client tipis, dikunci ke kontrak backend** — hanya berisi endpoint
  yang real ada di backend; tidak ada mock ganda di FE.
- **State minimal** — hanya `SessionProvider` (user sesi) dan state lokal per
  halaman; tanpa global store. Mutasi uang selalu disinkronkan langsung ke
  server, bukan dipercayai dari state lokal.
- **Sandbox by design** — provider & data simulasi; banner permanen di beranda
  menandai demo, bukan produk.

## Known gaps FE

- `apps/auth` (port 3001) masih ada di workspaces tapi **tidak dipakai** di
  alur demo; auth lokal ada di `apps/container/app/auth`.
- 10 warning eslint non-blocking (hard-reload `window.location` untuk reset
  sesi, beberapa unused var kecil).
- Tidak ada test unit/E2E FE; semuanya manual lewat skrip demo.
- Tanpa optimistik UI — beberapa halaman menunggu respons backend sebelum
  feedback, terasa lambat saat demo.
- Alur KYC/unggah data pribadi hanya simulasi; tidak ditargetkan review
  keamanan berkas asli.

## Tech stack

Next.js (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 ·
npm workspaces
