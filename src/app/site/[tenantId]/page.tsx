import { notFound, redirect } from "next/navigation";
import { getAllTenantSlugs, listTenantPages, findTenantBySlug } from "@/platform/content";
import { isSiteExpired } from "@/lib/siteStatus";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";

type TenantRootPageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getAllTenantSlugs();
  return slugs.map((tenantSlug) => ({ tenantId: tenantSlug }));
}

export default async function TenantRootPage({ params }: TenantRootPageProps) {
  const { tenantId } = await params;
  const tenant = await findTenantBySlug(tenantId);
  if (!tenant) notFound();

  if (isSiteExpired(tenant.subscription.validUntil, tenant.subscription.graceUntil)) {
    return <MaintenancePage tenant={tenant} />;
  }

  const pages = await listTenantPages(tenant.tenantType, tenantId);
  const home = pages.find((page) => page.isHome) ?? pages.find((page) => page.path === "/") ?? pages[0];
  if (!home) notFound();

  redirect(`/site/${tenantId}/${home.slug}`);
}
