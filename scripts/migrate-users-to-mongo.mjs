#!/usr/bin/env node
/**
 * Migrate users from data/credentials.json → MongoDB users collection.
 *
 * Usage:
 *   node scripts/migrate-users-to-mongo.mjs
 *   (reads MONGODB_URI from .env.local automatically)
 *
 * Does NOT delete the JSON file — it's read-only. Safe to run multiple times (upsert).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local manually (scripts don't auto-load Next.js env files)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const CREDENTIALS_PATH = join(process.cwd(), "data", "credentials.json");
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI env var is required");
  process.exit(1);
}

let credentials = {};
try {
  credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
} catch {
  console.error("No data/credentials.json found — nothing to migrate");
  process.exit(0);
}

const { MongoClient } = await import("mongodb");
const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db();
const users = db.collection("users");

let count = 0;
for (const [tenantId, entry] of Object.entries(credentials)) {
  const role = tenantId === "__admin__" ? "admin" : (entry.role || "user");
  const doc = {
    _id: tenantId,
    username: entry.username,
    hash: entry.hash,
    salt: entry.salt,
    role,
    tenantType: entry.tenantType || (role === "admin" ? undefined : "doctor"),
    resellerCanEdit: true,
    updatedAt: new Date().toISOString(),
  };

  await users.updateOne(
    { _id: tenantId },
    { $set: doc, $setOnInsert: { createdAt: new Date().toISOString() } },
    { upsert: true }
  );
  count++;
}

await client.close();
console.log(`Migrated ${count} users to MongoDB.`);
console.log("Set AUTH_BACKEND=mongo in your env to use MongoDB auth.");
