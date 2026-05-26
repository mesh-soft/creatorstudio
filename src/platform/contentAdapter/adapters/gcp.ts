import type { ContentAdapter, ContentEntry } from "../types";

export interface GCPAdapterOptions {
  projectId: string;
  bucket: string;
  clientEmail: string;
  privateKey: string;
}

export class GCPAdapter implements ContentAdapter {
  private bucket: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private clientEmail: string;
  private privateKey: string;

  constructor(opts: GCPAdapterOptions) {
    this.bucket = opts.bucket;
    this.clientEmail = opts.clientEmail;
    this.privateKey = opts.privateKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;

    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: this.clientEmail,
      scope: "https://www.googleapis.com/auth/devstorage.read_write",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const toBase64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
    const jwt = `${toBase64(header)}.${toBase64(claim)}`;
    // GCP SA keys are in PKCS#8 format. Use crypto.subtle for signing.
    // For Node.js, we use crypto.sign with the raw key.
    const crypto = await import("node:crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(jwt);
    const sig = sign.sign(this.privateKey, "base64url");
    const signedJwt = `${jwt}.${sig}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GCP auth failed: ${err}`);
    }

    const data = await res.json() as { access_token: string; expires_in: number };
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.token!;
  }

  private async request(method: string, path: string, body?: string): Promise<Response> {
    const token = await this.getAccessToken();
    const url = `https://storage.googleapis.com/storage/v1/b/${this.bucket}/o/${encodeURIComponent(path)}`;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (body) headers["Content-Type"] = "application/json; charset=utf-8";

    return fetch(url, { method, headers, body });
  }

  private objectPath(p: string): string {
    return p;
  }

  async read(p: string): Promise<string> {
    const res = await this.request("GET", this.objectPath(p));
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Not found: ${p}`);
      throw new Error(`GCP read failed: ${await res.text()}`);
    }
    const data = await res.json() as { mediaLink?: string };
    if (data.mediaLink) {
      const token = await this.getAccessToken();
      const dl = await fetch(`${data.mediaLink}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return dl.text();
    }
    throw new Error(`No mediaLink for: ${p}`);
  }

  async write(p: string, content: string): Promise<void> {
    const encoded = Buffer.from(content).toString("base64");
    const res = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${this.bucket}/o?uploadType=media&name=${encodeURIComponent(p)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getAccessToken()}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: content,
      }
    );
    if (!res.ok) throw new Error(`GCP write failed: ${await res.text()}`);
  }

  async delete(p: string): Promise<void> {
    const res = await this.request("DELETE", this.objectPath(p));
    if (!res.ok && res.status !== 404) {
      throw new Error(`GCP delete failed: ${await res.text()}`);
    }
  }

  async list(dir: string): Promise<ContentEntry[]> {
    const prefix = dir.endsWith("/") ? dir : `${dir}/`;
    const token = await this.getAccessToken();
    const url = `https://storage.googleapis.com/storage/v1/b/${this.bucket}/o?delimiter=/&prefix=${encodeURIComponent(prefix)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`GCP list failed: ${await res.text()}`);
    }

    const data = await res.json() as { items?: Array<{ name: string }>; prefixes?: string[] };
    const entries: ContentEntry[] = [];

    if (data.prefixes) {
      for (const pfx of data.prefixes) {
        const name = pfx.slice(prefix.length).replace(/\/$/, "");
        if (name) entries.push({ name, type: "dir" });
      }
    }

    if (data.items) {
      for (const item of data.items) {
        const name = item.name.slice(prefix.length);
        if (name && !name.endsWith("/")) {
          entries.push({ name, type: "file" });
        }
      }
    }

    return entries;
  }

  async exists(p: string): Promise<boolean> {
    const res = await this.request("GET", this.objectPath(p));
    return res.ok;
  }
}
