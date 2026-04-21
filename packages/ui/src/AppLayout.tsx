'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export const AppLayout = ({ children, userName = "Admin User" }: { children: React.ReactNode, userName?: string }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    document.cookie = 'fintech_jwt_token=; path=/; max-age=0';
    document.cookie = 'fintech_user_role=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased w-full">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PayPlatform.
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="/" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50">
            Beranda
          </a>
          <a href="/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50">
            Dashboard
          </a>
          <a href="/transactions" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-blue-600 hover:bg-blue-50">
            Riwayat Transaksi
          </a>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Halo, {userName}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-left text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Workspace</h1>
        </header>
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};