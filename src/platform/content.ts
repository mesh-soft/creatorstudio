import fs from "node:fs";
import path from "node:path";
import type { PageContent, Tenant, TenantFolderEntry, TenantPage, TenantSite, TenantType } from "./types";

const contentRoot = path.join(process.cwd(), "content");

export function getTenant(tenantType: TenantType, tenantId: string): Tenant {
  const entries = readTenantFolders(tenantType);
  const entry = entries.find((item) => item.tenantSlug === tenantId);
  if (!entry) {
    throw new Error(`Tenant not found: ${tenantType}/${tenantId}`);
  }
  return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}

export function getAllTenants(): Tenant[] {
  return [...readTenantFolders("doctor"), ...readTenantFolders("hospital")].map((entry) =>
    composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages))
  );
}

export function findTenantById(tenantId: string): Tenant | undefined {
  return getAllTenants().find((tenant) => tenant.tenantId === tenantId);
}

export function findTenantBySlug(tenantSlug: string): Tenant | undefined {
  const allEntries = [...readTenantFolders("doctor"), ...readTenantFolders("hospital")];
  const entry = allEntries.find((item) => item.tenantSlug === tenantSlug);
  if (!entry) return undefined;
  return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}

export function getAllTenantSlugs(): string[] {
  return [...readTenantFolders("doctor"), ...readTenantFolders("hospital")].map((entry) => entry.tenantSlug);
}

export function getTenantSiteBySlug(tenantType: TenantType, tenantSlug: string): TenantSite | undefined {
  return readTenantFolders(tenantType).find((entry) => entry.tenantSlug === tenantSlug)?.site;
}

export function listTenantPages(tenantType: TenantType, tenantSlug: string): TenantPage[] {
  return readTenantFolders(tenantType).find((entry) => entry.tenantSlug === tenantSlug)?.pages ?? [];
}

export function getTenantPageBySlug(
  tenantType: TenantType,
  tenantSlug: string,
  pageSlug: string
): TenantPage | undefined {
  return listTenantPages(tenantType, tenantSlug).find((page) => page.slug === pageSlug);
}

export function getTenantByPageSlug(tenantSlug: string, pageSlug: string): Tenant | undefined {
  const allEntries = [...readTenantFolders("doctor"), ...readTenantFolders("hospital")];
  const entry = allEntries.find((item) => item.tenantSlug === tenantSlug);
  if (!entry) return undefined;

  const page = entry.pages.find((item) => item.slug === pageSlug);
  if (!page) return undefined;
  return composeTenant(entry.tenantSlug, entry.site, page);
}

export function getAllTenantPageParams(): Array<{ tenantSlug: string; pageSlug: string }> {
  return [...readTenantFolders("doctor"), ...readTenantFolders("hospital")].flatMap((entry) =>
    entry.pages.map((page) => ({
      tenantSlug: entry.tenantSlug,
      pageSlug: page.slug,
    }))
  );
}

function readTenantFolders(tenantType: TenantType): TenantFolderEntry[] {
  const directory = path.join(contentRoot, tenantType === "doctor" ? "doctors" : "hospitals");
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory())
    .map((tenantSlug) => readTenantFolderEntry(directory, tenantType, tenantSlug))
    .filter((entry): entry is TenantFolderEntry => entry !== null);
}

function readTenantFolderEntry(
  tenantTypeDirectory: string,
  tenantType: TenantType,
  tenantSlug: string
): TenantFolderEntry | null {
  const tenantDirectory = path.join(tenantTypeDirectory, tenantSlug);
  const siteFile = path.join(tenantDirectory, "site.json");
  const siteDirectory = path.join(tenantDirectory, "site");
  const siteIndexFile = path.join(siteDirectory, "index.json");

  let siteFileToRead: string;
  if (fs.existsSync(siteFile)) {
    siteFileToRead = siteFile;
  } else if (fs.existsSync(siteIndexFile)) {
    siteFileToRead = siteIndexFile;
  } else {
    return null;
  }

  const storedSite = JSON.parse(fs.readFileSync(siteFileToRead, "utf8")) as TenantSite;
  const pages = readTenantPages(tenantDirectory, storedSite);
  const site = applyHomePageSiteOverrides(storedSite, pages);

  return {
    tenantSlug,
    tenantType,
    site,
    pages,
  };
}

function readTenantPages(tenantDirectory: string, site: TenantSite): TenantPage[] {
  const pagesDirectory = path.join(tenantDirectory, "pages");
  if (fs.existsSync(pagesDirectory)) {
    return fs
      .readdirSync(pagesDirectory)
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => JSON.parse(fs.readFileSync(path.join(pagesDirectory, entry), "utf8")) as TenantPage)
      .sort((a, b) => Number(Boolean(b.isHome)) - Number(Boolean(a.isHome)) || a.slug.localeCompare(b.slug));
  }

  return site.pages ?? [];
}

function applyHomePageSiteOverrides(site: TenantSite, pages: TenantPage[]): TenantSite {
  const homePage = pages.find((page) => page.slug === "home" || page.isHome) as Partial<TenantSite> | undefined;
  if (!homePage) return site;

  return {
    ...site,
    tenantId: homePage.tenantId ?? site.tenantId,
    tenantType: homePage.tenantType ?? site.tenantType,
    status: homePage.status ?? site.status,
    subscription: homePage.subscription ?? site.subscription,
    domains: homePage.domains ?? site.domains,
    profile: homePage.profile ?? site.profile,
    business: homePage.business ?? site.business,
    presentation: homePage.presentation && "style" in homePage.presentation ? homePage.presentation : site.presentation,
    seo: homePage.seo ?? site.seo,
  };
}

const defaultSubscription = {
  plan: "free",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
};

const defaultDomains = {
  primary: "localhost:3000",
};

function composeTenant(tenantSlug: string, site: TenantSite, page: TenantPage): Tenant {
  // Merge site-level and page-level presentation (page overrides site)
  const defaultPresentation = {
    themeId: "default",
    variantPresetId: "minimal",
    styleId: "default",
    style: {
      colors: {
        primary: "#2296F3",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1e293b",
      },
      shape: {
        radius: "8px",
      },
      typography: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
      },
    },
  };
  const sitePresentation = site.presentation ?? defaultPresentation;
  const presentation = {
    themeId: page.presentation?.themeId ?? sitePresentation.themeId,
    variantPresetId: page.presentation?.variantPresetId ?? sitePresentation.variantPresetId,
    styleId: page.presentation?.styleId ?? sitePresentation.styleId,
    style: sitePresentation.style, // Style overrides are always from site level
  };

  // Merge site-level and page-level SEO (page overrides site)
  const seo = {
    ...site.seo,
    ...(page.seo ?? {}),
  };

  const { slug, title, isHome, content } = page;
  const pagePath = typeof page.path === "string" && page.path.startsWith("/") ? page.path : `/${page.path ?? slug}`;

  return {
    ...site,
    tenantId: tenantSlug,
    presentation,
    seo,
    subscription: site.subscription ?? defaultSubscription,
    domains: site.domains ?? defaultDomains,
    slug,
    title,
    path: pagePath,
    isHome,
    content: normalizePageContent(content),
  };
}

function normalizePageContent(content: Partial<PageContent> | undefined): PageContent {
  return {
    headline: typeof content?.headline === "string" ? content.headline : "",
    subheadline: typeof content?.subheadline === "string" ? content.subheadline : "",
    copy: isRecord(content?.copy) ? content.copy : {},
    services: Array.isArray(content?.services) ? content.services : [],
    timings: Array.isArray(content?.timings) ? content.timings : [],
    gallery: Array.isArray(content?.gallery) ? content.gallery : [],
    faqs: Array.isArray(content?.faqs) ? content.faqs : [],
    testimonials: Array.isArray(content?.testimonials) ? content.testimonials : [],
    stats: Array.isArray(content?.stats) ? content.stats : [],
    blocks: Array.isArray(content?.blocks) ? content.blocks : [],
  };
}

function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getHomePage(pages: TenantPage[]): TenantPage {
  const explicitHome = pages.find((page) => page.isHome);
  if (explicitHome) return explicitHome;

  const rootPath = pages.find((page) => page.path === "/");
  if (rootPath) return rootPath;

  if (pages[0]) return pages[0];

  return {
    slug: "home",
    title: "Home",
    path: "/",
    isHome: true,
    content: {
      headline: "",
      subheadline: "",
      copy: {},
      services: [],
      timings: [],
      gallery: [],
      faqs: [],
      testimonials: [],
      stats: [],
      blocks: [],
    },
  };
}
