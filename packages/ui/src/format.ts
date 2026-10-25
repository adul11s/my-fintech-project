/** IDR helpers + annuity (shared by wallet & credit zones). */
export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSigned(amount: number): string {
  return `${amount < 0 ? "-" : "+"}${formatIdr(Math.abs(amount))}`;
}

export function monthlyInstallment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r <= 0 || months <= 0) return principal / Math.max(months, 1);
  const q = Math.pow(1 + r, months);
  return Math.round((principal * r * q) / (q - 1));
}

/** Flat admin-style paylater (Kredivo pattern): 0% bunga untuk tenor 30 hari, 1.95%/bln untuk 3/6. */
export function paylaterTotal(amount: number, tenorMonths: number): number {
  const months = tenorMonths === 1 ? 1 : tenorMonths;
  const rate = tenorMonths === 1 ? 0 : 0.0195;
  const installment = tenorMonths === 1 ? amount : Math.round((amount * (1 + rate * months)) / months);
  return installment * months;
}
