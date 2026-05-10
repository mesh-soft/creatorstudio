import { listTenantPages } from "@/platform/content";
import { CreatorStudioClient } from "./CreatorStudioClient";

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
  const pageSlug = (await searchParams)?.page ?? "home";
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
