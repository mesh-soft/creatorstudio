import { listTenantPages, getAllTenants } from "@/platform/content";
import { CreatorStudioClient } from "./CreatorStudioClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  // Exclude Creator Studio from static export - it's dynamic admin interface
  return [];
}

type CreatorPageProps = {
  params: Promise<{
    tenantType: "doctor" | "hospital";
    tenantId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function CreatorPage({ params, searchParams }: CreatorPageProps) {
  const { tenantType, tenantId } = await params;
  const resolvedSearchParams = await searchParams;
  const pageSlug = resolvedSearchParams?.page ?? "home";
  const pages = listTenantPages(tenantType, tenantId).map((page) => page.slug);
  const safePageSlug = pages.includes(pageSlug) ? pageSlug : pages[0] ?? "home";

  return (
    <CreatorStudioClient
      tenantType={tenantType}
      tenantId={tenantId}
      pageSlug={safePageSlug}
      pages={pages}
    />
  );
}
