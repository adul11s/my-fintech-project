import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { SCHEMA } from "./schema";
import { hashSecret } from "./crypto";

/** Repo-root/.data — zones run `next start` with cwd = apps/<zone>, so ../../../ = repo root. */
const DATA_DIR = path.resolve(process.cwd(), "..", "..", ".data");
export const DB_PATH = path.join(DATA_DIR, "qupi.sqlite");

let db: Database.Database | null = null;

export function getStore(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  conn.exec(SCHEMA);
  seed(conn);
  db = conn;
  return db;
}

function seed(conn: Database.Database) {
  const row = conn.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (row.n > 0) return;
  const now = Date.now();
  conn.exec("BEGIN");
  try {
    conn.prepare(
      "INSERT INTO users (id, email, name, password_hash, pin_hash, created_at) VALUES (?,?,?,?,?,?)"
    ).run("u-demo", "joji@qupi.id", "Joji", hashSecret("demo1234"), hashSecret("123456"), now);
    conn.prepare("INSERT INTO wallets (user_id, balance) VALUES (?,?)").run("u-demo", 12_500_000);
    conn.prepare("INSERT INTO credit_lines (user_id, credit_limit, activated) VALUES (?,?,1)").run("u-demo", 20_000_000);
    conn.prepare(
      "INSERT INTO ledger (user_id, kind, amount, counterparty, note, created_at) VALUES (?,?,?,?,?,?)"
    ).run("u-demo", "topup", 25_000_000, "Bank Demo", "Seed top up", now - 8 * 86400_000);
    conn.prepare(
      "INSERT INTO ledger (user_id, kind, amount, counterparty, note, created_at) VALUES (?,?,?,?,?,?)"
    ).run("u-demo", "qris", -750_000, "Warung Kopi Nusantara", "QRIS transfer", now - 2 * 86400_000);
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}
