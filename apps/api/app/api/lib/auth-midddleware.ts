import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export const authenticate = (request: NextRequest) => {
  const token = 
    request.cookies.get('fintech_jwt_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('Token received:', token ? token.substring(0, 20) + '...' : 'none');

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  try {
    const payload = verifyToken(token);
    console.log('Payload:', payload);
    return { payload };
  } catch (err) {
    console.log('Token verify error:', err);
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
};