# Quality Scorecard — qupi-apps (frontend)

Template plan-portfolio-9,5 §6. Skor jujur per 2026-10-25 (HEAD `8e644e9`, CI Frontend hijau run 40165572494).

| Dimensi | Bobot | Skor | Bukti |
|---|---|---|---|
| Kejujuran (README/gaps) | 10% | 9 | Pilot banner eksplisit, known gaps jujur, badge CI valid |
| Kebenaran domain | 15% | 9 | Alur topup/transfer/QRIS/tagihan/cicilan sesuai backend ledger double-entry |
| Arsitektur | 20% | 9 | Next.js App Router multi-zone MFE; zona independen deploy |
| Auth & abstractions | 15% | 8 | Session di-handle backend; FE tidak menyimpan PIN; abstraksi api client per zona |
| Idempotency | 10% | 8 | idempotencyKey dikirim di topup/transfer (beban kebenaran di BE) |
| Observabilitas | 10% | 7 | Error boundary + route log; belum ada telemetry/metrics di FE |
| Demo & reproduksibilitas | 10% | 8 | Demo script + satu perintah dev; video 90 detik menyusul |
| CI | 10% | 10 | CI Frontend hijau (build + lint) |

**Total weighted:** (9×.10)+(9×.15)+(9×.20)+(8×.15)+(8×.10)+(7×.10)+(8×.10)+(10×.10) = **8.5**