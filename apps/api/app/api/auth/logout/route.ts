import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('fintech_jwt_token', '', { maxAge: 0 });
  response.cookies.set('fintech_user_role', '', { maxAge: 0 });
  return response;
}