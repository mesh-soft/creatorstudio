import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import type { ContentAdapter, ContentEntry } from "../types";

export interface S3AdapterOptions {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

export class S3Adapter implements ContentAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(opts: S3AdapterOptions) {
    this.bucket = opts.bucket;
    this.client = new S3Client({
      region: opts.region,
      endpoint: opts.endpoint,
      credentials: {
        accessKeyId: opts.accessKeyId,
        secretAccessKey: opts.secretAccessKey,
      },
    });
  }

  async read(p: string): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: p });
    const res = await this.client.send(cmd);
    const body = await res.Body?.transformToString("utf8");
    if (!body) throw new Error(`Empty content at: ${p}`);
    return body;
  }

  async write(p: string, content: string): Promise<void> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: p,
      Body: content,
      ContentType: "application/json",
    });
    await this.client.send(cmd);
  }

  async delete(p: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: p }));
  }

  async list(dir: string): Promise<ContentEntry[]> {
    const prefix = dir.endsWith("/") ? dir : `${dir}/`;
    const cmd = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      Delimiter: "/",
    });
    const res = await this.client.send(cmd);

    const entries: ContentEntry[] = [];

    if (res.CommonPrefixes) {
      for (const cp of res.CommonPrefixes) {
        const name = (cp.Prefix ?? "").slice(prefix.length).replace(/\/$/, "");
        if (name) entries.push({ name, type: "dir" });
      }
    }

    if (res.Contents) {
      for (const obj of res.Contents) {
        const name = (obj.Key ?? "").slice(prefix.length);
        if (name && !name.endsWith("/")) {
          entries.push({ name, type: "file" });
        }
      }
    }

    return entries;
  }

  async exists(p: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: p }));
      return true;
    } catch { return false; }
  }
}
