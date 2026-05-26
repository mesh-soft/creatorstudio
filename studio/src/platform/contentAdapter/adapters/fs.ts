import fs from 'node:fs/promises';
import { statSync } from 'node:fs';
import path from 'node:path';
import type { ContentAdapter, ContentEntry } from '../types';

export function isVercelBuild(): boolean {
  return process.env.VERCEL === '1' && process.env.CI === '1';
}

export class FilesystemAdapter implements ContentAdapter {
  constructor(private root: string) {}

  private fullPath(p: string): string {
    return path.join(this.root, p);
  }

  async read(p: string): Promise<string> {
    return fs.readFile(this.fullPath(p), 'utf8');
  }

  async write(p: string, content: string): Promise<void> {
    const full = this.fullPath(p);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content, 'utf8');
  }

  async delete(p: string): Promise<void> {
    await fs.unlink(this.fullPath(p)).catch(() => {});
  }

  async list(dir: string): Promise<ContentEntry[]> {
    const full = this.fullPath(dir);
    try {
      const entries = await fs.readdir(full, { withFileTypes: true });
      return entries.map((e) => ({
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
      }));
    } catch {
      return [];
    }
  }

  async exists(p: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(p));
      return true;
    } catch {
      return false;
    }
  }
}

export function resolveMediaPath(
  tenantType: 'doctor' | 'hospital',
  tenantSlug: string
): string {
  return tenantType === 'doctor'
    ? `public/content/doctors/${tenantSlug}`
    : `public/content/hospitals/${tenantSlug}`;
}

export function resolveTenantDir(
  tenantType: 'doctor' | 'hospital',
  tenantSlug: string
): string {
  return tenantType === 'doctor'
    ? `content/doctors/${tenantSlug}`
    : `content/hospitals/${tenantSlug}`;
}

export function resolveContentDir(tenantType: 'doctor' | 'hospital'): string {
  return tenantType === 'doctor' ? 'content/doctors' : 'content/hospitals';
}
