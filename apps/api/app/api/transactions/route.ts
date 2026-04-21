import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';
import { authenticate } from '../lib/auth-midddleware';

// GET all transactions for logged-in user
export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');  // income | expense
  const limit = parseInt(searchParams.get('limit') || '20');

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: auth.payload!.userId,
      ...(type ? { type } : {}),
    },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, data: transactions });
}

// POST create transaction
export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { type, amount, description, category, date } = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        userId: auth.payload!.userId,
        type,
        amount,
        description,
        category,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}