import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllTenantPageParams, getTenantByPageSlug } from "@/platform/content";
import { SiteRenderer } from "@/platform/SiteRenderer";
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

  return (
    <>
      <Suspense fallback={null}>
        <DevPreviewAutoRedirect />
      </Suspense>
      <SiteRenderer tenant={tenant} />
    </>
  );
}
