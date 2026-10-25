/** SQLite DDL + users seed for the QUPI demo. All money stored as INTEGER rupiah. */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  balance INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS credit_lines (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  credit_limit INTEGER NOT NULL,
  activated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL,
  counterparty TEXT,
  note TEXT,
  ref TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS paylater_tx (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL,
  billed_outstanding INTEGER NOT NULL,
  tenor_months INTEGER NOT NULL,
  per_installment INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS installments (
  id TEXT PRIMARY KEY,
  tx_id TEXT NOT NULL REFERENCES paylater_tx(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  seq INTEGER NOT NULL,
  due_at INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'due',
  paid_at INTEGER
);
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  provider TEXT NOT NULL,
  number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  paid_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS qris_tx (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_inst_user ON installments(user_id, status);
`;
