#!/usr/bin/env node
/**
 * Set or update credentials for a tenant (or admin user).
 *
 * Usage:
 *   node scripts/set-credentials.mjs <tenantId> <username> <password> [--role=admin] [--type=doctor|hospital]
 *
 * Examples:
 *   node scripts/set-credentials.mjs nitesh-garwa admin secret123 --type=doctor
 *   node scripts/set-credentials.mjs __admin__ superadmin adminpass --role=admin
 *
 * Backend (env vars):
 *   AUTH_BACKEND=file  (default) — writes to data/credentials.json
 *   AUTH_BACKEND=mongo            — writes to MongoDB using MONGODB_URI
 */

import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = join(__dirname, "../data/credentials.json");
const AUTH_BACKEND = process.env.AUTH_BACKEND || "file";
const MONGODB_URI = process.env.MONGODB_URI;

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const [tenantId, username, password] = args;
const role = args.includes("--role=admin") ? "admin" : "tenant";

const typeArg = args.find(a => a.startsWith("--type="));
const tenantType = typeArg ? typeArg.replace("--type=", "") : (role === "admin" ? undefined : "doctor");

if (!tenantId || !username || !password) {
  console.error("Usage: node scripts/set-credentials.mjs <tenantId> <username> <password> [--role=admin] [--type=doctor|hospital]");
  console.error("");
  console.error("Examples:");
  console.error("  node scripts/set-credentials.mjs nitesh-garwa admin secret123 --type=doctor");
  console.error("  node scripts/set-credentials.mjs my-hospital admin secret123 --type=hospital");
  console.error("  node scripts/set-credentials.mjs __admin__ superadmin adminpass --role=admin");
  console.error("");
  console.error("Env vars:");
  console.error("  AUTH_BACKEND=file   Write to data/credentials.json (default)");
  console.error("  AUTH_BACKEND=mongo  Write to MongoDB (requires MONGODB_URI)");
  process.exit(1);
}

// ── Hash with scrypt ──────────────────────────────────────────────────────────

console.log(`Hashing password for "${tenantId}" / "${username}" (role: ${role}) …`);

const salt = randomBytes(32).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

const entry = { username, hash, salt, role, ...(tenantType ? { tenantType } : {}) };

// ── Write to backend ──────────────────────────────────────────────────────────

if (AUTH_BACKEND === "mongo") {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI env var is required when AUTH_BACKEND=mongo");
    process.exit(1);
  }
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  await db.collection("credentials").updateOne(
    { _id: tenantId },
    { $set: entry },
    { upsert: true }
  );
  await client.close();

  console.log("");
  console.log(`Credentials upserted in MongoDB for "${tenantId}"`);
  console.log(`  Role: ${role}`);
  if (tenantType) console.log(`  Type: ${tenantType}`);
} else {
  // File backend
  let credentials = {};
  try {
    credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  } catch {
    mkdirSync(dirname(CREDENTIALS_PATH), { recursive: true });
  }

  credentials[tenantId] = entry;
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2) + "\n");

  console.log("");
  console.log(`✓ Credentials written to ${CREDENTIALS_PATH}`);
  console.log(`  Role:  ${role}`);
  if (tenantType) console.log(`  Type:  ${tenantType}`);
}

console.log("");
console.log("Next: restart dev server (credentials read at request time)");
