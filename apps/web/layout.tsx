import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="flex h-screen bg-gray-50 text-gray-900">
        {/* Sidebar Lintas Modul */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-4 text-2xl font-bold border-b border-slate-700">
            PayPlatform
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="block p-2 rounded hover:bg-slate-800">
              Beranda
            </Link>
            {/* Link ini akan diarahkan ke MFE Dashboard berkat next.config.mjs */}
            <Link href="/dashboard" className="block p-2 rounded hover:bg-slate-800">
              Ringkasan Saldo
            </Link>
            <Link href="/transactions" className="block p-2 rounded hover:bg-slate-800">
              Riwayat Transaksi
            </Link>
          </nav>
        </aside>

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Workspace</h1>
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Keluar
            </button>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}