'use client';

import { useEffect, useState } from 'react';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', description: '', category: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/transactions', { credentials: 'include' })
      .then((res) => res.json())
      .then((res) => { if (res.success) setTransactions(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/transactions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ type: 'expense', amount: '', description: '', category: '', date: '' });
    setShowForm(false);
    fetchTransactions();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchTransactions();
  };

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Tambah Transaksi
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Tipe</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm mt-1">
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Jumlah (Rp)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm mt-1" placeholder="500000" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Deskripsi</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm mt-1" placeholder="Gaji bulanan" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Kategori</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm mt-1" placeholder="Salary" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Tanggal</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm mt-1" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 px-4 py-2">Batal</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Belum ada transaksi</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Keterangan</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Nominal</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-500">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-sm text-slate-800 font-medium">{tx.description}</td>
                  <td className="p-4 text-sm text-slate-500">{tx.category}</td>
                  <td className={`p-4 text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(tx.id)}
                      className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}