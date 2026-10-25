# Visual Demo Script — QUPI Frontend (5 minutes)

Prerequisites: the backend API is running at `http://localhost:4000/api`,
the container at `:3000` (`npm run dev`), and demo users have been seeded
from the backend repository (`npm run seed`).

**Demo users:**
| User | Phone number | PIN    | Opening balance | PayLater                                        |
|------|--------------|--------|-----------------|-------------------------------------------------|
| Andi | 628123456789 | 123456 | Rp 1.000.000    | active, partially used, 1 installment plan (3 months) |
| Budi | 628123456790 | 123456 | Rp 500.000      | —                                               |

A screenshot is saved for every step in `docs/screenshots/`.

---

## 1. Home (screenshot: `01-beranda.png`)

1. Open `http://localhost:3000` — if not logged in, it redirects to `/auth`.
2. Log in: phone number `628123456789`, PIN `123456` (PIN pad).
3. On the home page: the **"Sandbox / simulated data"** banner on top, a
   balance card (Rp 1.000.000), a PayLater summary, 8 quick-action buttons,
   and the 3 latest transactions.

## 2. Top Up (screenshot: `02-topup.png`)

1. Click **Top Up**.
2. Enter an amount, e.g. `50000`, and click **Process**.
3. The balance on the home page increases, and the history shows the Top Up.

## 3. Transfer (screenshot: `03-transfer.png`)

1. Click **Transfer**.
2. Enter the destination phone number `628123456790` (Budi) — the name is
   looked up.
3. Amount `25000`, PIN `123456`, send.
4. Open `http://localhost:3000`, log in as Budi, and check the incoming
   transaction in the history.

## 4. QRIS payment (screenshot: `04-qris.png`)

1. Click **QRIS**.
2. Pick an amount/table (simulated data), show the QR pad.
3. Pay with the PIN — success status, recorded in history as a purchase.

## 5. Bills / bill payment (screenshot: `05-tagihan.png`)

1. Click **Bills**.
2. Pick a provider (PLN/PDAM, simulated), enter the bill number, click
   **Inquiry** — the amount appears.
3. **Pay** with the PIN — the bill is settled.

## 6. PayLater (screenshot: `07-cicilan.png`)

1. Click **PayLater**.
2. Review limit, used amount, remaining. **Checkout** an amount, submit the
   PIN.
3. The 3-month installment plan appears on the same page.

## 7. Pay an installment (screenshot: see `07-cicilan.png`)

1. Stay on `/paylater`, pick the fully outstanding plan, pay with the PIN.
2. The "used" amount drops; the status returns to healthy.

## 8. History (screenshot: `08-riwayat.png`)

1. Click **History** in the menu.
2. All transactions appear: top-up, transfer, QRIS, bills, installments —
   with status (SUCCESS/PENDING) and timestamps.
3. The pending badge on the home page decreases accordingly.

## 9. Profile (screenshot: `09-profil.png`, optional)

1. Click **Profile** — KYC status (simulated), user data.

---

### Notes

- All figures and names come from the backend stub — not real money.
- If the backend is down: the app stays up on `:3000`, but every page only
  shows skeletons/error messages; the demo script requires the backend.
- Screenshots are saved to `docs/screenshots/*.png` and are regenerated
  whenever the UI changes meaningfully.
