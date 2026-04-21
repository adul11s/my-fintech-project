import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Secret key untuk JWT (di dunia nyata, simpan ini di .env)
const JWT_SECRET = new TextEncoder().encode('fintech-secret-key-2026');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Hardcode user untuk contoh (Ganti dengan query ke Database/Prisma nanti)
    if (email === 'admin@payplatform.com' && password === 'admin123') {
      
      // 1. Generate JWT Token menggunakan 'jose'
      const token = await new SignJWT({ 
        email, 
        role: 'ADMIN',
        permissions: ['view_dashboard', 'manage_users', 'approve_transactions']
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h') // Token mati dalam 2 jam
        .sign(JWT_SECRET);

      // 2. Return Response sukses beserta token
      return NextResponse.json({ 
        success: true, 
        token, 
        user: { email, role: 'ADMIN' } 
      });
    }

    return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}