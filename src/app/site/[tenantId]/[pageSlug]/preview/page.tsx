import { notFound } from "next/navigation";
import { getTenantByPageSlug } from "@/platform/content";
import { LivePreviewClient } from "../../LivePreviewClient";
import type { Tenant } from "@/platform/types";

type PreviewPageProps = {
  params: Promise<{
    tenantId: string;
    pageSlug: string;
  }>;
  searchParams: Promise<{
    draft?: string;
  }>;
};

// Preview route is always dynamic
export const dynamic = "force-dynamic";

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { tenantId, pageSlug } = await params;
  const { draft } = await searchParams;
  
  const tenant = await getTenantByPageSlug(tenantId, pageSlug);
  if (!tenant) notFound();

  const draftTenant = draft ? parseDraftTenant(draft, tenant) : tenant;

  return <LivePreviewClient initialTenant={draftTenant} />;
}

function parseDraftTenant(encodedDraft: string, baseTenant: Tenant): Tenant {
  try {
    const binary = Buffer.from(encodedDraft, "base64").toString("latin1");
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return normalizeDraftTenant(deepMerge(baseTenant, parsed) as Tenant);
  } catch {
    return baseTenant;
  }
}

function normalizeDraftTenant(tenant: Tenant & { settings?: any[] }): Tenant {
  const urlSettings = Array.isArray(tenant.settings) ? tenant.settings.find(s => s._template === "urlSettings") : undefined;
  const presentation = Array.isArray(tenant.settings) ? tenant.settings.find(s => s._template === "presentation") : undefined;
  const seo = Array.isArray(tenant.settings) ? tenant.settings.find(s => s._template === "seo") : undefined;

  return {
    ...tenant,
    profile: {
      ...tenant.profile,
      degrees: Array.isArray(tenant.profile?.degrees) ? tenant.profile.degrees : [],
    },
    blocks: Array.isArray(tenant.blocks) ? tenant.blocks : [],
    // Flatten settings array back to root for renderer
    ...(urlSettings && {
      slug: urlSettings.slug ?? tenant.slug,
      title: urlSettings.title ?? tenant.title,
      path: urlSettings.path ?? tenant.path,
      isHome: urlSettings.isHome ?? tenant.isHome,
    }),
    ...(presentation && {
      presentation: presentation ?? tenant.presentation,
    }),
    ...(seo && {
      seo: seo ?? tenant.seo,
    }),
  };
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) return mergeArrays(base, patch) as T;
  if (typeof base !== "object" || base === null || typeof patch !== "object" || patch === null) {
    return patch as T;
  }

  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    const current = output[key];
    output[key] = deepMerge(current, value);
  }
  return output as T;
}

function mergeArrays(base: unknown[], patch: unknown[]) {
  const maxLength = Math.max(base.length, patch.length);
  const out: unknown[] = new Array(maxLength);

  for (let i = 0; i < maxLength; i += 1) {
    if (patch[i] === undefined) out[i] = base[i];
    else if (base[i] === undefined) out[i] = patch[i];
    else out[i] = deepMerge(base[i], patch[i]);
  }
  return out;
}
