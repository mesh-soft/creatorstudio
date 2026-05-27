#!/usr/bin/env node
/**
 * Migrate users from data/credentials.json → MongoDB users collection.
 *
 * Usage:
 *   MONGODB_URI=mongodb://... node scripts/migrate-users-to-mongo.mjs
 *
 * Does NOT delete the JSON file — it's read-only. Safe to run multiple times (upsert).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

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
