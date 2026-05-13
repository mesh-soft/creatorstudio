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

export function getTenantPageBySlug(
  tenantType: TenantType,
  tenantSlug: string,
  pageSlug: string
): TenantPage | undefined {
  return listTenantPages(tenantType, tenantSlug).find((page) => getUrlSettings(page).slug === pageSlug);
}

export function getTenantByPageSlug(tenantSlug: string, pageSlug: string): Tenant | undefined {
  const allEntries = [...readTenantFolders("doctor"), ...readTenantFolders("hospital")];
  const entry = allEntries.find((item) => item.tenantSlug === tenantSlug);
  if (!entry) return undefined;

  const page = entry.pages.find((item) => getUrlSettings(item).slug === pageSlug);
  if (!page) return undefined;
  return composeTenant(entry.tenantSlug, entry.site, page);
}

export function getAllTenantPageParams(): Array<{ tenantSlug: string; pageSlug: string }> {
  return [...readTenantFolders("doctor"), ...readTenantFolders("hospital")].flatMap((entry) =>
    entry.pages.map((page) => ({
      tenantSlug: entry.tenantSlug,
      pageSlug: getUrlSettings(page).slug || "home",
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
      .sort((a, b) => {
        const aUrl = getUrlSettings(a);
        const bUrl = getUrlSettings(b);
        const aIsHome = aUrl.isHome;
        const bIsHome = bUrl.isHome;
        const aSlug = aUrl.slug ?? "";
        const bSlug = bUrl.slug ?? "";
        return Number(Boolean(bIsHome)) - Number(Boolean(aIsHome)) || aSlug.localeCompare(bSlug);
      });
  }

  return site.pages ?? [];
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
  const pagePres = getPagePresentation(page);
  const presentation = {
    themeId: pagePres?.themeId ?? sitePresentation.themeId,
    variantPresetId: pagePres?.variantPresetId ?? sitePresentation.variantPresetId,
    styleId: pagePres?.styleId ?? sitePresentation.styleId,
    style: sitePresentation.style, // Style overrides are always from site level
  };

  // Merge site-level and page-level SEO (page overrides site)
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
