import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { findTenantBySlug, getAllTenantSlugs } from "@/platform/content";
import { SiteRenderer } from "@/platform/SiteRenderer";
import type { Tenant } from "@/platform/types";
import { SitePageClient } from "./SitePageClient";
import { LivePreviewClient } from "./LivePreviewClient";
import { DoctorDocument, HospitalDocument } from "../../../../tina/__generated__/types";
import client from "../../../../tina/__generated__/client";

type SitePageProps = {
  params: Promise<{
    tenantId: string;
  }>;
  searchParams?: Promise<{
    draft?: string;
    studio?: string;
  }>;
};

export function generateStaticParams() {
  return getAllTenantSlugs().map((tenantSlug) => ({
    tenantId: tenantSlug,
  }));
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { tenantId } = await params;
  const tenant = findTenantBySlug(tenantId);

  if (!tenant) {
    return {};
  }

  return {
    title: tenant.seo.title,
    description: tenant.seo.description,
    keywords: tenant.seo.keywords,
    openGraph: {
      title: tenant.seo.title,
      description: tenant.seo.description,
      images: tenant.seo.ogImage ? [tenant.seo.ogImage] : undefined,
    },
  };
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { tenantId } = await params;
  const tenant = findTenantBySlug(tenantId);

  if (!tenant) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const draftParam = resolvedSearchParams?.draft;
  const studioMode = resolvedSearchParams?.studio === "1";
  const draftTenant = draftParam ? parseDraftTenant(draftParam, tenant) : tenant;

  if (studioMode) {
    return <LivePreviewClient initialTenant={draftTenant} />;
  }

  const { isEnabled } = await draftMode();

  if (isEnabled) {
    const relativePath = `${tenantId}.json`;
    const isDoctor = tenant.tenantType === "doctor";
    const query = isDoctor ? DoctorDocument : HospitalDocument;

    try {
      const response = isDoctor
        ? await client.queries.doctor({ relativePath })
        : await client.queries.hospital({ relativePath });

      return <SitePageClient query={query} variables={{ relativePath }} data={response.data} />;
    } catch {
      return <SiteRenderer tenant={draftTenant} />;
    }
  }

  return <SiteRenderer tenant={draftTenant} />;
}

function parseDraftTenant(encodedDraft: string, baseTenant: Tenant): Tenant {
  try {
    const binary = Buffer.from(encodedDraft, "base64").toString("latin1");
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return deepMerge(baseTenant, parsed) as Tenant;
  } catch {
    return baseTenant;
  }
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
    if (patch[i] === undefined) {
      out[i] = base[i];
    } else if (base[i] === undefined) {
      out[i] = patch[i];
    } else {
      out[i] = deepMerge(base[i], patch[i]);
    }
  }
  return out;
}
