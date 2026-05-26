#!/usr/bin/env node
/**
 * Set or update credentials for a tenant (or admin user).
 *
 * Usage:
 *   node scripts/set-credentials.mjs <tenantId> <username> <password> [--role=admin] [--type=doctor|hospital]
 *
 * Examples:
 *   node scripts/set-credentials.mjs nitesh-garwa admin secret123 --type=doctor
 *   node scripts/set-credentials.mjs __admin__    superadmin  adminpass --role=admin
 *
 * After running, either:
 *   a) Commit data/credentials.json to git and redeploy   (simplest for local dev)
 *   b) Copy the file contents and paste into the CREDENTIALS_JSON env var on Vercel
 *      (keeps hashes out of the repo — recommended for production)
 */

import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = join(__dirname, "../data/credentials.json");

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
  process.exit(1);
}

// ── Hash with scrypt ──────────────────────────────────────────────────────────

console.log(`Hashing password for "${tenantId}" / "${username}" (role: ${role}) …`);

const salt = randomBytes(32).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

// ── Read → merge → write ──────────────────────────────────────────────────────

let credentials = {};
try {
  credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
} catch {
  // File doesn't exist yet — start fresh
  mkdirSync(dirname(CREDENTIALS_PATH), { recursive: true });
}

const existed = tenantId in credentials;
const entry = { username, hash, salt, role, ...(tenantType ? { tenantType } : {}) };
credentials[tenantId] = entry;

writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2) + "\n");

console.log("");
console.log(`✓ Credentials ${existed ? "updated" : "created"} for "${tenantId}"`);
console.log(`  Role:  ${role}`);
if (tenantType) console.log(`  Type:  ${tenantType}`);
console.log(`  File:  ${CREDENTIALS_PATH}`);
console.log("");
console.log("Next steps:");
console.log("  Local dev  →  restart the dev server (credentials are read at request time)");
console.log("  Vercel     →  copy the file contents into CREDENTIALS_JSON env var in the dashboard");
console.log("             →  OR commit data/credentials.json and redeploy (hashes only, no plaintext)");
