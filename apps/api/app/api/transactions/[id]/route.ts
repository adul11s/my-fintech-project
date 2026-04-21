import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-midddleware';

// PUT update transaction
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (auth.error) return auth.error;

  const { type, amount, description, category, date } = await request.json();

  const transaction = await prisma.transaction.updateMany({
    where: { id: params.id, userId: auth.payload!.userId },
    data: { type, amount, description, category, date: date ? new Date(date) : undefined },
  });

  if (transaction.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE transaction
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (auth.error) return auth.error;

  const deleted = await prisma.transaction.deleteMany({
    where: { id: params.id, userId: auth.payload!.userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}