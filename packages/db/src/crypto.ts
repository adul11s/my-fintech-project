import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

function scryptPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString("hex");
}

export function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptPassword(secret, salt)}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = Buffer.from(scryptPassword(secret, salt), "hex");
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

/** Deterministic pseudo-amount for bill inquiry (hash of provider+number). */
export function pseudoBillAmount(provider: string, number: string): number {
  const h = createHash("sha256").update(`${provider}::${number.toLowerCase()}`).digest();
  const base = h.readUInt32BE(0);
  const table: Record<string, [number, number]> = {
    PLN: [80_000, 1_800_000],
    "Paket Data": [50_000, 300_000],
    PDAM: [40_000, 400_000],
    Telkom: [100_000, 700_000],
  };
  const [lo, hi] = table[provider] ?? [30_000, 500_000];
  return Math.round((lo + (base % (hi - lo))) / 500) * 500;
}
