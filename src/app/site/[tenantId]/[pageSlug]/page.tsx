import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllTenantPageParams, getTenantByPageSlug } from "@/platform/content";
import { SiteRenderer } from "@/platform/SiteRenderer";
import { isSiteExpired } from "@/lib/siteStatus";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";
import { ExpirationGuardPage } from "@/components/maintenance/ExpirationGuardPage";
import { DevPreviewAutoRedirect } from "./DevPreviewAutoRedirect";

type SitePageProps = {
  params: Promise<{
    tenantId: string;
    pageSlug: string;
  }>;
};

// No dynamic export needed - Next.js will automatically make this static
// because generateStaticParams is present and searchParams is removed.

export async function generateStaticParams() {
  const params = await getAllTenantPageParams();
  return params.map((item) => ({
    tenantId: item.tenantSlug,
    pageSlug: item.pageSlug,
  }));
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { tenantId, pageSlug } = await params;
  const tenant = await getTenantByPageSlug(tenantId, pageSlug);

  if (!tenant) return {};

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

export default async function SitePage({ params }: SitePageProps) {
  const { tenantId, pageSlug } = await params;
  const tenant = await getTenantByPageSlug(tenantId, pageSlug);

  if (!tenant) {
    notFound();
  }

  // Server-side safety: if already expired at build time, bake the maintenance page
  if (isSiteExpired(tenant.subscription.validUntil, tenant.subscription.graceUntil)) {
    return <MaintenancePage tenant={tenant} />;
  }

  return (
    <ExpirationGuardPage tenant={tenant}>
      <Suspense fallback={null}>
        <DevPreviewAutoRedirect />
      </Suspense>
      <SiteRenderer tenant={tenant} />
    </ExpirationGuardPage>
  );
}
