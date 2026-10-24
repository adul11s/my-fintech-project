import { Card, formatIdr, monthlyInstallment } from "@fintech/ui";

const presets = [
  { label: "KTA", amount: 10_000_000, rate: 11, months: 12 },
  { label: "Motor", amount: 25_000_000, rate: 8, months: 24 },
  { label: "Mobil", amount: 150_000_000, rate: 5, months: 48 },
];

export default function LoansPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Loan Simulator</h1>
      <p className="text-sm text-slate-400 max-w-xl">
        Annuity-based installment preview. Same formula used across Indonesian consumer lending.
      </p>

      <Card title="Simulated scenarios">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2">Product</th>
              <th className="pb-2 text-right">Principal</th>
              <th className="pb-2 text-right">Rate / yr</th>
              <th className="pb-2 text-right">Tenor</th>
              <th className="pb-2 text-right">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <tr key={p.label} className="border-t border-slate-800">
                <td className="py-2 font-semibold">{p.label}</td>
                <td className="py-2 text-right tabular-nums">{formatIdr(p.amount)}</td>
                <td className="py-2 text-right text-slate-400">{p.rate}%</td>
                <td className="py-2 text-right text-slate-400">{p.months} mo</td>
                <td className="py-2 text-right font-semibold tabular-nums text-emerald-400">
                  {formatIdr(monthlyInstallment(p.amount, p.rate, p.months))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
