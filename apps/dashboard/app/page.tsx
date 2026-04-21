'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';


type DashboardData = {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
  }[];
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/dashboard', { credentials: 'include' })
      .then((res) => res.json())
      .then((res) => { if (res.success) setData(res.data); else setError('Gagal memuat data'); })
      .catch(() => setError('Gagal menghubungi server'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Memuat data...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="p-8 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Ringkasan Keuangan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-4">Total Saldo Aktif</p>
          <h3 className="text-3xl font-bold text-slate-900">{formatRupiah(data?.totalSaldo || 0)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-4">Pemasukan Bulan Ini</p>
          <h3 className="text-3xl font-bold text-emerald-600">{formatRupiah(data?.pemasukanBulanIni || 0)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-4">Pengeluaran Bulan Ini</p>
          <h3 className="text-3xl font-bold text-red-500">{formatRupiah(data?.pengeluaranBulanIni || 0)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Transaksi Terbaru</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {data?.recentTransactions.length === 0 && (
            <p className="p-6 text-sm text-slate-400">Belum ada transaksi</p>
          )}
          {data?.recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-700">{tx.description}</p>
                <p className="text-xs text-slate-400">{tx.category} · {new Date(tx.date).toLocaleDateString('id-ID')}</p>
              </div>
              <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}