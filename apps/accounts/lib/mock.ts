/**
 * Deterministic mock data so the zone can be demoed without a database.
 * In production these functions would call the core-banking API.
 */

export type Account = {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Investment";
  balance: number;
};

export type Movement = {
  date: string;
  description: string;
  /** Negative = money out. */
  amount: number;
};

export const accounts: Account[] = [
  { id: "ac-daily", name: "Daily Spending", type: "Checking", balance: 8_450_000 },
  { id: "ac-save", name: "Emergency Fund", type: "Savings", balance: 47_300_000 },
  { id: "ac-invest", name: "Money Market", type: "Investment", balance: 22_180_000 },
];

export const movements: Movement[] = [
  { date: "2026-10-24", description: "Monthly salary", amount: 15_000_000 },
  { date: "2026-10-23", description: "Groceries", amount: -1_250_000 },
  { date: "2026-10-22", description: "Electric & water", amount: -450_000 },
  { date: "2026-10-21", description: "Transfer to Emergency Fund", amount: -2_000_000 },
  { date: "2026-10-20", description: "Dividend payout", amount: 310_000 },
  { date: "2026-10-19", description: "Coffee shop", amount: -85_000 },
];
