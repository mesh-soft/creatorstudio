import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { getDb } from "@/lib/db";

export const MIN_PRICE = 999;

// ── Types ────────────────────────────────────────────────────────────────────

export interface Credential {
  username: string;
  hash: string;
  salt: string;
  role: "tenant" | "admin" | "reseller";
  tenantType?: "doctor" | "hospital";
}

export interface UserDoc extends Credential {
  _id?: string;
  commissionPercent?: number;
  resellerId?: string;
  resellerCanEdit?: boolean;
  subscription?: {
    plan: string;
    validFrom: string;
    validUntil: string;
    graceUntil: string;
    paymentStatus: "paid" | "pending" | "expired";
    amount: number;
    originalPrice: number;
    discountPercent: number;
    paymentId?: string;
    orderId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthStore {
  getCredentials(): Promise<Record<string, Credential>>;
  setCredential(tenantId: string, cred: Credential): Promise<void>;
  deleteCredential?(tenantId: string): Promise<void>;
  getUser?(tenantId: string): Promise<UserDoc | null>;
  listUsers?(filter?: { role?: string; resellerId?: string }): Promise<UserDoc[]>;
  updateUser?(tenantId: string, updates: Partial<UserDoc>): Promise<void>;
}

// ── File-based store ─────────────────────────────────────────────────────────

const CREDENTIALS_PATH = join(process.cwd(), "data", "credentials.json");

class FileAuthStore implements AuthStore {
  async getCredentials(): Promise<Record<string, Credential>> {
    const fromEnv = process.env.CREDENTIALS_JSON;
    if (fromEnv) { try { return JSON.parse(fromEnv); } catch {} }
    try { return JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8")); }
    catch { return {}; }
  }

  async setCredential(tenantId: string, cred: Credential): Promise<void> {
    const existing = await this.getCredentials();
    existing[tenantId] = cred;
    mkdirSync(dirname(CREDENTIALS_PATH), { recursive: true });
    writeFileSync(CREDENTIALS_PATH, JSON.stringify(existing, null, 2) + "\n");
  }

  async deleteCredential(tenantId: string): Promise<void> {
    const existing = await this.getCredentials();
    delete existing[tenantId];
    writeFileSync(CREDENTIALS_PATH, JSON.stringify(existing, null, 2) + "\n");
  }
}

// ── MongoDB store ────────────────────────────────────────────────────────────

class MongoAuthStore implements AuthStore {
  private coll = "users";

  async getCredentials(): Promise<Record<string, Credential>> {
    const env = process.env.CREDENTIALS_JSON;
    if (env) { try { return JSON.parse(env); } catch {} }
    const db = await getDb();
    const docs = await db.collection(this.coll).find({}, { projection: { username: 1, hash: 1, salt: 1, role: 1, tenantType: 1 } }).toArray();
    const out: Record<string, Credential> = {};
    for (const doc of docs) out[doc._id] = doc;
    return out;
  }

  async setCredential(tenantId: string, cred: Credential): Promise<void> {
    const db = await getDb();
    await db.collection(this.coll).updateOne(
      { _id: tenantId },
      { $set: { ...cred, updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } },
      { upsert: true }
    );
  }

  async deleteCredential(tenantId: string): Promise<void> {
    const db = await getDb();
    await db.collection(this.coll).deleteOne({ _id: tenantId });
  }

  async getUser(tenantId: string): Promise<UserDoc | null> {
    const db = await getDb();
    return await db.collection(this.coll).findOne({ _id: tenantId }) as UserDoc | null;
  }

  async listUsers(filter?: { role?: string; resellerId?: string }): Promise<UserDoc[]> {
    const db = await getDb();
    const q: any = {};
    if (filter?.role) q.role = filter.role;
    if (filter?.resellerId) q.resellerId = filter.resellerId;
    return await db.collection(this.coll).find(q).toArray() as UserDoc[];
  }

  async updateUser(tenantId: string, updates: Partial<UserDoc>): Promise<void> {
    const db = await getDb();
    await db.collection(this.coll).updateOne(
      { _id: tenantId },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    );
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

let _store: AuthStore | null = null;

export async function getAuthStore(): Promise<AuthStore> {
  if (_store) return _store;
  const backend = process.env.AUTH_BACKEND || "file";
  _store = backend === "mongo" ? new MongoAuthStore() : new FileAuthStore();
  return _store;
}

export { FileAuthStore, MongoAuthStore };
