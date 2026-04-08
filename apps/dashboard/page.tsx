// apps/dashboard/app/page.tsx
export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ringkasan Keuangan</h2>
        <p className="text-slate-500 text-sm mt-1">Pantau arus kas dan saldo aktifmu hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Saldo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Saldo</h3>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">💳</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">Rp 45.000.000</div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <span className="mr-1">↑</span> +2.5% dari bulan lalu
          </p>
        </div>

        {/* Card Pemasukan */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Pemasukan</h3>
            <span className="p-2 bg-green-50 text-green-600 rounded-lg">↓</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">Rp 12.500.000</div>
        </div>

        {/* Card Pengeluaran */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Pengeluaran</h3>
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">↑</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">Rp 3.200.000</div>
        </div>
      </div>
    </div>
  );
}