import fs from "node:fs";
import path from "node:path";
import type { Tenant, TenantType } from "./types";

const contentRoot = path.join(process.cwd(), "content");

export function getTenant(tenantType: TenantType, tenantId: string): Tenant {
  const folder = tenantType === "doctor" ? "doctors" : "hospitals";
  const file = path.join(contentRoot, folder, `${tenantId}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Tenant;
}

export function getAllTenants(): Tenant[] {
  return [...readTenantFolder("doctors"), ...readTenantFolder("hospitals")];
}

export function findTenantById(tenantId: string): Tenant | undefined {
  return getAllTenants().find((tenant) => tenant.tenantId === tenantId);
}

export function findTenantBySlug(tenantSlug: string): Tenant | undefined {
  return getAllTenantsWithSlug().find((entry) => entry.slug === tenantSlug)?.tenant;
}

export function getAllTenantSlugs(): string[] {
  return getAllTenantsWithSlug().map((entry) => entry.slug);
}

function readTenantFolder(folder: "doctors" | "hospitals"): Tenant[] {
  const directory = path.join(contentRoot, folder);
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Tenant);
}

function getAllTenantsWithSlug(): Array<{ slug: string; tenant: Tenant }> {
  return [...readTenantFolderWithSlug("doctors"), ...readTenantFolderWithSlug("hospitals")];
}

function readTenantFolderWithSlug(
  folder: "doctors" | "hospitals"
): Array<{ slug: string; tenant: Tenant }> {
  const directory = path.join(contentRoot, folder);
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const slug = file.replace(/\.json$/i, "");
      const tenant = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Tenant;
      return { slug, tenant };
    });
}
