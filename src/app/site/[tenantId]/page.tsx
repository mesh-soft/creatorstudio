import { notFound, redirect } from "next/navigation";
import { getAllTenantSlugs, listTenantPages, findTenantBySlug } from "@/platform/content";

type TenantRootPageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export function generateStaticParams() {
  return getAllTenantSlugs().map((tenantSlug) => ({ tenantId: tenantSlug }));
}

export default async function TenantRootPage({ params }: TenantRootPageProps) {
  const { tenantId } = await params;
  const tenant = findTenantBySlug(tenantId);
  if (!tenant) notFound();

  const pages = listTenantPages(tenant.tenantType, tenantId);
  const home = pages.find((page) => page.isHome) ?? pages.find((page) => page.path === "/") ?? pages[0];
  if (!home) notFound();

  redirect(`/site/${tenantId}/${home.slug}`);
}
