import { NextResponse } from 'next/server';

export async function GET() {
  // Simulasi data dari Database
  const mockTransactions = [
    { id: 'TRX-001', date: '2026-04-07', amount: 1500000, type: 'CREDIT', note: 'Topup Saldo' },
    { id: 'TRX-002', date: '2026-04-06', amount: 50000, type: 'DEBIT', note: 'Pembayaran Listrik' },
    { id: 'TRX-003', date: '2026-04-05', amount: 300000, type: 'DEBIT', note: 'Transfer ke Budi' },
  ];

  return NextResponse.json({
    success: true,
    data: mockTransactions
  });
}