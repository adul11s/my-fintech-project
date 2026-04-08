'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Asumsikan kamu sudah buat packages/auth/index.ts di langkah sebelumnya
import { login as setAuthCookies } from '@my-fintech-project/auth'; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@payplatform.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Simpan token ke Cookies agar terbaca di MFE Dashboard & Transactions
        setAuthCookies(data.token, data.user.role);
        
        // Redirect ke halaman utama
        router.push('/');
        router.refresh(); // Refresh state Next.js
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login PayPlatform</h1>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Masuk Sistem'}
        </button>
      </form>
    </div>
  );
}