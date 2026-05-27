import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const REPLAY_WINDOW = 300;
const FUTURE_SLACK  = 30;

export function verifyGemSignature(
  timestampHeader: string | null,
  signatureHeader: string | null,
  rawBody: string,
): boolean {
  const secret = process.env.GEMINI_WEBHOOK_SECRET;
  if (!secret || !timestampHeader || !signatureHeader) return false;

  const ts  = parseInt(timestampHeader, 10);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts)) return false;
  if (ts < now - REPLAY_WINDOW || ts > now + FUTURE_SLACK) return false;

  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const expected = createHmac("sha256", secret)
    .update(`${ts}.${bodyHash}`, "utf8")
    .digest("hex");

  if (!signatureHeader.startsWith("sha256=")) return false;
  const received = signatureHeader.slice(7);

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(received, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
