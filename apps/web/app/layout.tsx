// apps/web/app/layout.tsx
import './global.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        
        {/* Sidebar Kiri */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PayPlatform.
            </span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link href="/" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Beranda Shell
            </Link>
            
            {/* Routing ke MFE Dashboard */}
            <Link href="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              Dashboard
            </Link>

            {/* Routing ke MFE Transactions */}
            <Link href="/transactions" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6m-6-4h6m-6-4h6M9 8h.01M15 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Riwayat Transaksi
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">Admin User</p>
                <button className="text-xs text-slate-500 hover:text-red-600 transition">Logout</button>
              </div>
            </div>
          </div>
        </aside>

        {/* Area Konten Utama yang akan diisi oleh MFE */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h1 className="text-lg font-semibold text-slate-800">Workspace</h1>
            <div className="text-sm text-slate-500">April 2026</div>
          </header>
          
          {/* Children ini akan digantikan oleh halaman dari /dashboard atau /transactions */}
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}