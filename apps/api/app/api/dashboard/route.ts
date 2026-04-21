import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';
import { authenticate } from '../lib/auth-midddleware';

export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (auth.error) return auth.error;

  const userId = auth.payload!.userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalIncome, totalExpense, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'income', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ]);

  const income = totalIncome._sum.amount || 0;
  const expense = totalExpense._sum.amount || 0;

  return NextResponse.json({
    success: true,
    data: {
      totalSaldo: income - expense,
      pemasukanBulanIni: income,
      pengeluaranBulanIni: expense,
      recentTransactions,
    },
  });
}