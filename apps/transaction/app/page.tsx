// apps/transactions/app/page.tsx
import { Suspense } from 'react';

// Fetch data langsung dari Server Component
async function getTransactions() {
  // Dalam production, ganti URL ini dengan env variable
  const res = await fetch('http://localhost:3002/api/history', { cache: 'no-store' });
  const json = await res.json();
  return json.data;
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm mt-1">Daftar seluruh aktivitas keluar masuk dana.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
          Unduh Laporan
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="p-4 font-medium">ID Transaksi</th>
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Keterangan</th>
              <th className="p-4 font-medium">Nominal</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((trx: any) => (
              <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-medium text-slate-900">{trx.id}</td>
                <td className="p-4 text-sm text-slate-500">{trx.date}</td>
                <td className="p-4 text-sm text-slate-700">{trx.note}</td>
                <td className={`p-4 text-sm font-semibold ${trx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900'}`}>
                  {trx.type === 'CREDIT' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${trx.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {trx.type === 'CREDIT' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}