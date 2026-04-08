// apps/web/app/page.tsx
export default function HomePage() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Selamat Datang di PayPlatform 👋
      </h2>
      <p className="text-slate-600">
        Ini adalah aplikasi utama (Shell). Silakan pilih menu di *sidebar* kiri untuk melihat MFE Dashboard atau Riwayat Transaksi.
      </p>
    </div>
  );
}