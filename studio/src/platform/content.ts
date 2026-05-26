import type { PageContent, Tenant, TenantFolderEntry, TenantPage, TenantSite, TenantType } from "./types";
import { unwrapSiteSettingsToFlat } from "./siteSettingsNormalize";
import { getContentAdapter } from "./contentAdapter";
import { resolveContentDir } from "./contentAdapter";

export async function getTenant(tenantType: TenantType, tenantId: string): Promise<Tenant> {
  const entries = await readTenantFolders(tenantType);
  const entry = entries.find((item) => item.tenantSlug === tenantId);
  if (!entry) {
    throw new Error(`Tenant not found: ${tenantType}/${tenantId}`);
  }
  return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}

export async function getAllTenants(): Promise<Tenant[]> {
  const doctors = await readTenantFolders("doctor");
  const hospitals = await readTenantFolders("hospital");
  return [...doctors, ...hospitals].map((entry) =>
    composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages))
  );
}

export async function findTenantById(tenantId: string): Promise<Tenant | undefined> {
  const all = await getAllTenants();
  return all.find((tenant) => tenant.tenantId === tenantId);
}

export async function findTenantBySlug(tenantSlug: string): Promise<Tenant | undefined> {
  const doctors = await readTenantFolders("doctor");
  const hospitals = await readTenantFolders("hospital");
  const allEntries = [...doctors, ...hospitals];
  const entry = allEntries.find((item) => item.tenantSlug === tenantSlug);
  if (!entry) return undefined;
  return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}

export async function getAllTenantSlugs(): Promise<string[]> {
  const doctors = await readTenantFolders("doctor");
  const hospitals = await readTenantFolders("hospital");
  return [...doctors, ...hospitals].map((entry) => entry.tenantSlug);
}

export async function getTenantSiteBySlug(tenantType: TenantType, tenantSlug: string): Promise<TenantSite | undefined> {
  const folders = await readTenantFolders(tenantType);
  return folders.find((entry) => entry.tenantSlug === tenantSlug)?.site;
}

export async function listTenantPages(tenantType: TenantType, tenantSlug: string): Promise<TenantPage[]> {
  const folders = await readTenantFolders(tenantType);
  return folders.find((entry) => entry.tenantSlug === tenantSlug)?.pages ?? [];
}

function getUrlSettings(page: TenantPage) {
  const block = Array.isArray(page.settings) ? page.settings.find((s) => s._template === "urlSettings") : undefined;
  return {
    slug: block && "slug" in block ? block.slug : page.slug,
    title: block && "title" in block ? block.title : page.title,
    path: block && "path" in block ? block.path : page.path,
    isHome: block && "isHome" in block ? block.isHome : page.isHome,
  };
}

function getPagePresentation(page: TenantPage) {
  const block = Array.isArray(page.settings) ? page.settings.find((s) => s._template === "presentation") : undefined;
  return block ?? page.presentation;
}

function getPageSeo(page: TenantPage) {
  const block = Array.isArray(page.settings) ? page.settings.find((s) => s._template === "seo") : undefined;
  return block ?? page.seo;
}

export async function getTenantPageBySlug(
  tenantType: TenantType,
  tenantSlug: string,
  pageSlug: string
): Promise<TenantPage | undefined> {
  const pages = await listTenantPages(tenantType, tenantSlug);
  return pages.find((page) => getUrlSettings(page).slug === pageSlug);
}

export async function getTenantByPageSlug(tenantSlug: string, pageSlug: string): Promise<Tenant | undefined> {
  const doctors = await readTenantFolders("doctor");
  const hospitals = await readTenantFolders("hospital");
  const allEntries = [...doctors, ...hospitals];
  const entry = allEntries.find((item) => item.tenantSlug === tenantSlug);
  if (!entry) return undefined;

  const page = entry.pages.find((item) => getUrlSettings(item).slug === pageSlug);
  if (!page) return undefined;
  return composeTenant(entry.tenantSlug, entry.site, page);
}

export async function getAllTenantPageParams(): Promise<Array<{ tenantSlug: string; pageSlug: string }>> {
  const doctors = await readTenantFolders("doctor");
  const hospitals = await readTenantFolders("hospital");
  return [...doctors, ...hospitals].flatMap((entry) =>
    entry.pages.map((page) => ({
      tenantSlug: entry.tenantSlug,
      pageSlug: getUrlSettings(page).slug || "home",
    }))
  );
}

async function readTenantFolders(tenantType: TenantType): Promise<TenantFolderEntry[]> {
  const adapter = await getContentAdapter();
  const dir = resolveContentDir(tenantType);

  const exists = await adapter.exists(dir);
  if (!exists) return [];

  const entries = await adapter.list(dir);
  const dirs = entries.filter((e) => e.type === "dir");

  const results = await Promise.all(
    dirs.map((entry) => readTenantFolderEntry(adapter, dir, tenantType, entry.name))
  );

  return results.filter((entry): entry is TenantFolderEntry => entry !== null);
}

async function readTenantFolderEntry(
  adapter: Awaited<ReturnType<typeof getContentAdapter>>,
  parentDir: string,
  tenantType: TenantType,
  tenantSlug: string
): Promise<TenantFolderEntry | null> {
  const tenantDir = `${parentDir}/${tenantSlug}`;
  const flatSiteFile = `${tenantDir}/site.json`;
  const siteIndexFile = `${tenantDir}/site/index.json`;

  let siteFileToRead: string;
  if (await adapter.exists(flatSiteFile)) {
    siteFileToRead = flatSiteFile;
  } else if (await adapter.exists(siteIndexFile)) {
    siteFileToRead = siteIndexFile;
  } else {
    return null;
  }

  const raw = await adapter.read(siteFileToRead);
  const storedSite = unwrapSiteSettingsToFlat(
    JSON.parse(raw) as Record<string, unknown>
  ) as TenantSite;
  const pages = await readTenantPages(adapter, tenantDir, storedSite);
  const site = applyHomePageSiteOverrides(storedSite, pages);

  return {
    tenantSlug,
    tenantType,
    site,
    pages,
  };
}

async function readTenantPages(
  adapter: Awaited<ReturnType<typeof getContentAdapter>>,
  tenantDir: string,
  site: TenantSite
): Promise<TenantPage[]> {
  const pagesDir = `${tenantDir}/pages`;
  const exists = await adapter.exists(pagesDir);
  if (!exists) return site.pages ?? [];

  const entries = await adapter.list(pagesDir);
  const jsonFiles = entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));

  const pages = await Promise.all(
    jsonFiles.map(async (entry) => {
      const raw = await adapter.read(`${pagesDir}/${entry.name}`);
      return JSON.parse(raw) as TenantPage;
    })
  );

  return pages.sort((a, b) => {
    const aUrl = getUrlSettings(a);
    const bUrl = getUrlSettings(b);
    const aIsHome = aUrl.isHome;
    const bIsHome = bUrl.isHome;
    const aSlug = aUrl.slug ?? "";
    const bSlug = bUrl.slug ?? "";
    return Number(Boolean(bIsHome)) - Number(Boolean(aIsHome)) || aSlug.localeCompare(bSlug);
  });
}

function applyHomePageSiteOverrides(site: TenantSite, pages: TenantPage[]): TenantSite {
  const homePage = pages.find((page) => getUrlSettings(page).slug === "home" || getUrlSettings(page).isHome);
  if (!homePage) return site;

  const presentation = getPagePresentation(homePage);
  const seo = getPageSeo(homePage);

  return {
    ...site,
    presentation: presentation && "style" in presentation ? (presentation as any) : site.presentation,
    seo: seo ?? site.seo,
  };
}

const defaultSubscription = {
  plan: "free",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const defaultDomains = {
  primary: "localhost:3000",
};

function composeTenant(tenantSlug: string, site: TenantSite, page: TenantPage): Tenant {
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
  const pagePres = getPagePresentation(page);
  const presentation = {
    themeId: pagePres?.themeId ?? sitePresentation.themeId,
    variantPresetId: pagePres?.variantPresetId ?? sitePresentation.variantPresetId,
    styleId: pagePres?.styleId ?? sitePresentation.styleId,
    style: sitePresentation.style,
  };

  const seo = {
    ...site.seo,
    ...(getPageSeo(page) ?? {}),
  };

  const urlSettings = getUrlSettings(page);
  const slug = urlSettings.slug;
  const title = urlSettings.title;
  const isHome = urlSettings.isHome;
  const pathValue = urlSettings.path;
  const pagePath = typeof pathValue === "string" && pathValue.startsWith("/") ? pathValue : `/${pathValue ?? slug}`;

  return {
    ...site,
    tenantId: tenantSlug,
    presentation,
    seo,
    subscription: site.subscription ?? defaultSubscription,
    domains: site.domains ?? defaultDomains,
    slug: slug || "home",
    title: title || "Home",
    path: pagePath,
    isHome: isHome || false,
    blocks: Array.isArray(page.blocks) ? page.blocks : [],
  };
}

function getHomePage(pages: TenantPage[]): TenantPage {
  const explicitHome = pages.find((page) => getUrlSettings(page).isHome);
  if (explicitHome) return explicitHome;

  const rootPath = pages.find((page) => getUrlSettings(page).path === "/");
  if (rootPath) return rootPath;

  if (pages[0]) return pages[0];

  return {
    slug: "home",
    title: "Home",
    path: "/",
    isHome: true,
    blocks: [],
  };
}
