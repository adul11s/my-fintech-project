import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fintech_jwt_token')?.value;
  const urlPath = request.nextUrl.pathname;

  // 1. Audit Log Sistem
  console.log(`[AUDIT LOG] ${new Date().toISOString()} | Path: ${urlPath} | Token: ${token ? 'Ada' : 'Kosong'}`);

  // 2. Proteksi Halaman (RBAC Sederhana)
  // Abaikan proteksi untuk halaman login atau API publik
  if (!urlPath.startsWith('/login')) {
    if (!token) {
      // Jika belum login, tendang ke halaman login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Hanya jalankan middleware ini pada route tertentu agar tidak memberatkan aset statis
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};