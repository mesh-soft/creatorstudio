import { notFound } from "next/navigation";
import { listTenantPages } from "@/platform/content";
import { CreatorStudioClient } from "../../[tenantType]/[tenantId]/CreatorStudioClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type CollectionPathProps = {
  params: Promise<{ path: string[] }>;
};

const COLLECTION_TO_TENANT_TYPE: Record<string, "doctor" | "hospital"> = {
  doctorSite: "doctor",
  hospitalSite: "hospital",
};

/**
 * Parse the clean URL path segments into structured routing info.
 *
 * Path format: edit/<collection>/~/<tenantId>[/pages/<pageSlug>]
 * Example:     edit/doctorSite/~/nitesh-garwa/pages/home
 *
 * Returns null if the path is not a valid content route (e.g. media, graphql).
 */
function parsePath(segments: string[]): {
  action: string;
  collection: string;
  tenantId: string;
  tenantType: "doctor" | "hospital";
  pageSlug: string;
} | null {
  // segments: ["edit", "doctorSite", "~", "nitesh-garwa", "pages", "home"]
  const tildeIndex = segments.indexOf("~");
  if (tildeIndex < 0) return null;

  const action = segments[0]; // "edit"
  const collection = segments[tildeIndex - 1]; // "doctorSite"
  const tenantId = segments[tildeIndex + 1]; // "nitesh-garwa"
  const tenantType = COLLECTION_TO_TENANT_TYPE[collection];

  if (!tenantId || !tenantType) return null;

  // Remaining segments after tenantId: ["pages", "home"] → pageSlug = "home"
  const afterTenant = segments.slice(tildeIndex + 2); // ["pages", "home"]
  const pagesIndex = afterTenant.indexOf("pages");
  const pageSlug =
    pagesIndex >= 0 ? afterTenant[pagesIndex + 1]?.replace(/\.json$/, "") ?? "home" : "home";

  return { action, collection, tenantId, tenantType, pageSlug };
}

export default async function CollectionEditorPage({ params }: CollectionPathProps) {
  const { path } = await params;

  const parsed = parsePath(path);
  if (!parsed) notFound();

  const { tenantType, tenantId, pageSlug } = parsed;

  const pages = listTenantPages(tenantType, tenantId)
    .map((page) => {
      const urlSettings = Array.isArray(page.settings)
        ? page.settings.find((s) => s._template === "urlSettings")
        : undefined;
      return urlSettings?.slug ?? page.slug;
    })
    .filter((slug): slug is string => Boolean(slug));

  const safePageSlug = pages.includes(pageSlug) ? pageSlug : pages[0] ?? "home";

  return (
    <CreatorStudioClient
      key={`${tenantType}:${tenantId}`}
      tenantType={tenantType}
      tenantId={tenantId}
      pageSlug={safePageSlug}
      pages={pages}
    />
  );
}
