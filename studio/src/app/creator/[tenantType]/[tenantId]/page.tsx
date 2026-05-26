import { redirect, notFound } from "next/navigation";
import { listTenantPages } from "@/platform/content";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type CreatorPageProps = {
  params: Promise<{
    tenantType: "doctor" | "hospital";
    tenantId: string;
  }>;
  searchParams?: Promise<{ page?: string }>;
};

const TENANT_TYPE_TO_COLLECTION: Record<string, string> = {
  doctor: "doctorSite",
  hospital: "hospitalSite",
};

export default async function CreatorPage({ params, searchParams }: CreatorPageProps) {
  const { tenantType, tenantId } = await params;
  const resolvedSearchParams = await searchParams;
  const pageSlug = resolvedSearchParams?.page ?? "home";

  const collection = TENANT_TYPE_TO_COLLECTION[tenantType];
  if (!collection) notFound();

  const pages = (await listTenantPages(tenantType, tenantId))
    .map((page) => {
      const urlSettings = Array.isArray(page.settings)
        ? page.settings.find((s) => s._template === "urlSettings")
        : undefined;
      return urlSettings?.slug ?? page.slug;
    })
    .filter((slug): slug is string => Boolean(slug));

  const safeSlug = pages.includes(pageSlug) ? pageSlug : pages[0] ?? "home";

  redirect(`/creator/collections/edit/${collection}/~/${tenantId}/pages/${safeSlug}`);
}
