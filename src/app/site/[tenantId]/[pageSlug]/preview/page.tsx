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
  
  const tenant = getTenantByPageSlug(tenantId, pageSlug);
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

function normalizeDraftTenant(tenant: Tenant): Tenant {
  return {
    ...tenant,
    profile: {
      ...tenant.profile,
      degrees: Array.isArray(tenant.profile.degrees) ? tenant.profile.degrees : [],
    },
    content: {
      headline: typeof tenant.content?.headline === "string" ? tenant.content.headline : "",
      subheadline: typeof tenant.content?.subheadline === "string" ? tenant.content.subheadline : "",
      copy: typeof tenant.content?.copy === "object" && tenant.content.copy !== null && !Array.isArray(tenant.content.copy) ? tenant.content.copy : {},
      services: Array.isArray(tenant.content?.services) ? tenant.content.services : [],
      timings: Array.isArray(tenant.content?.timings) ? tenant.content.timings : [],
      gallery: Array.isArray(tenant.content?.gallery) ? tenant.content.gallery : [],
      faqs: Array.isArray(tenant.content?.faqs) ? tenant.content.faqs : [],
      testimonials: Array.isArray(tenant.content?.testimonials) ? tenant.content.testimonials : [],
      stats: Array.isArray(tenant.content?.stats) ? tenant.content.stats : [],
      blocks: Array.isArray(tenant.content?.blocks) ? tenant.content.blocks : [],
    },
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
