/** Format an integer amount (IDR) as Indonesian Rupiah currency text. */
export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an amount with an explicit +/- sign for movement tables. */
export function formatMovement(amount: number): string {
  return `${amount < 0 ? "-" : "+"}${formatIdr(Math.abs(amount))}`;
}

/** Annuity (equated monthly installment) payment for a loan. */
export function monthlyInstallment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const q = Math.pow(1 + r, months);
  return (principal * r * q) / (q - 1);
}
