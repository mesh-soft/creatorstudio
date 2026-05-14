module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.0x3dzn~oxb6tn.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/platform/content.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findTenantById",
    ()=>findTenantById,
    "findTenantBySlug",
    ()=>findTenantBySlug,
    "getAllTenantPageParams",
    ()=>getAllTenantPageParams,
    "getAllTenantSlugs",
    ()=>getAllTenantSlugs,
    "getAllTenants",
    ()=>getAllTenants,
    "getTenant",
    ()=>getTenant,
    "getTenantByPageSlug",
    ()=>getTenantByPageSlug,
    "getTenantPageBySlug",
    ()=>getTenantPageBySlug,
    "getTenantSiteBySlug",
    ()=>getTenantSiteBySlug,
    "listTenantPages",
    ()=>listTenantPages
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const contentRoot = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "content");
function getTenant(tenantType, tenantId) {
    const entries = readTenantFolders(tenantType);
    const entry = entries.find((item)=>item.tenantSlug === tenantId);
    if (!entry) {
        throw new Error(`Tenant not found: ${tenantType}/${tenantId}`);
    }
    return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}
function getAllTenants() {
    return [
        ...readTenantFolders("doctor"),
        ...readTenantFolders("hospital")
    ].map((entry)=>composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages)));
}
function findTenantById(tenantId) {
    return getAllTenants().find((tenant)=>tenant.tenantId === tenantId);
}
function findTenantBySlug(tenantSlug) {
    const allEntries = [
        ...readTenantFolders("doctor"),
        ...readTenantFolders("hospital")
    ];
    const entry = allEntries.find((item)=>item.tenantSlug === tenantSlug);
    if (!entry) return undefined;
    return composeTenant(entry.tenantSlug, entry.site, getHomePage(entry.pages));
}
function getAllTenantSlugs() {
    return [
        ...readTenantFolders("doctor"),
        ...readTenantFolders("hospital")
    ].map((entry)=>entry.tenantSlug);
}
function getTenantSiteBySlug(tenantType, tenantSlug) {
    return readTenantFolders(tenantType).find((entry)=>entry.tenantSlug === tenantSlug)?.site;
}
function listTenantPages(tenantType, tenantSlug) {
    return readTenantFolders(tenantType).find((entry)=>entry.tenantSlug === tenantSlug)?.pages ?? [];
}
function getUrlSettings(page) {
    const block = Array.isArray(page.settings) ? page.settings.find((s)=>s._template === "urlSettings") : undefined;
    return {
        slug: block && "slug" in block ? block.slug : page.slug,
        title: block && "title" in block ? block.title : page.title,
        path: block && "path" in block ? block.path : page.path,
        isHome: block && "isHome" in block ? block.isHome : page.isHome
    };
}
function getPagePresentation(page) {
    const block = Array.isArray(page.settings) ? page.settings.find((s)=>s._template === "presentation") : undefined;
    return block ?? page.presentation;
}
function getPageSeo(page) {
    const block = Array.isArray(page.settings) ? page.settings.find((s)=>s._template === "seo") : undefined;
    return block ?? page.seo;
}
function getTenantPageBySlug(tenantType, tenantSlug, pageSlug) {
    return listTenantPages(tenantType, tenantSlug).find((page)=>getUrlSettings(page).slug === pageSlug);
}
function getTenantByPageSlug(tenantSlug, pageSlug) {
    const allEntries = [
        ...readTenantFolders("doctor"),
        ...readTenantFolders("hospital")
    ];
    const entry = allEntries.find((item)=>item.tenantSlug === tenantSlug);
    if (!entry) return undefined;
    const page = entry.pages.find((item)=>getUrlSettings(item).slug === pageSlug);
    if (!page) return undefined;
    return composeTenant(entry.tenantSlug, entry.site, page);
}
function getAllTenantPageParams() {
    return [
        ...readTenantFolders("doctor"),
        ...readTenantFolders("hospital")
    ].flatMap((entry)=>entry.pages.map((page)=>({
                tenantSlug: entry.tenantSlug,
                pageSlug: getUrlSettings(page).slug || "home"
            })));
}
function readTenantFolders(tenantType) {
    const directory = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(contentRoot, tenantType === "doctor" ? "doctors" : "hospitals");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(directory)) {
        return [];
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(directory).filter((entry)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(directory, entry)).isDirectory()).map((tenantSlug)=>readTenantFolderEntry(directory, tenantType, tenantSlug)).filter((entry)=>entry !== null);
}
function readTenantFolderEntry(tenantTypeDirectory, tenantType, tenantSlug) {
    const tenantDirectory = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(tenantTypeDirectory, tenantSlug);
    const siteFile = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(tenantDirectory, "site.json");
    const siteDirectory = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(tenantDirectory, "site");
    const siteIndexFile = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(siteDirectory, "index.json");
    let siteFileToRead;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(siteFile)) {
        siteFileToRead = siteFile;
    } else if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(siteIndexFile)) {
        siteFileToRead = siteIndexFile;
    } else {
        return null;
    }
    const storedSite = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(siteFileToRead, "utf8"));
    const pages = readTenantPages(tenantDirectory, storedSite);
    const site = applyHomePageSiteOverrides(storedSite, pages);
    return {
        tenantSlug,
        tenantType,
        site,
        pages
    };
}
function readTenantPages(tenantDirectory, site) {
    const pagesDirectory = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(tenantDirectory, "pages");
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(pagesDirectory)) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(pagesDirectory).filter((entry)=>entry.endsWith(".json")).map((entry)=>JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(pagesDirectory, entry), "utf8"))).sort((a, b)=>{
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
function applyHomePageSiteOverrides(site, pages) {
    const homePage = pages.find((page)=>getUrlSettings(page).slug === "home" || getUrlSettings(page).isHome);
    if (!homePage) return site;
    const presentation = getPagePresentation(homePage);
    const seo = getPageSeo(homePage);
    return {
        ...site,
        presentation: presentation && "style" in presentation ? presentation : site.presentation,
        seo: seo ?? site.seo
    };
}
const defaultSubscription = {
    plan: "free",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};
const defaultDomains = {
    primary: "localhost:3000"
};
function composeTenant(tenantSlug, site, page) {
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
                text: "#1e293b"
            },
            shape: {
                radius: "8px"
            },
            typography: {
                heading: "Inter, system-ui, sans-serif",
                body: "Inter, system-ui, sans-serif"
            }
        }
    };
    const sitePresentation = site.presentation ?? defaultPresentation;
    const pagePres = getPagePresentation(page);
    const presentation = {
        themeId: pagePres?.themeId ?? sitePresentation.themeId,
        variantPresetId: pagePres?.variantPresetId ?? sitePresentation.variantPresetId,
        styleId: pagePres?.styleId ?? sitePresentation.styleId,
        style: sitePresentation.style
    };
    // Merge site-level and page-level SEO (page overrides site)
    const seo = {
        ...site.seo,
        ...getPageSeo(page) ?? {}
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
        blocks: Array.isArray(page.blocks) ? page.blocks : []
    };
}
function getHomePage(pages) {
    const explicitHome = pages.find((page)=>getUrlSettings(page).isHome);
    if (explicitHome) return explicitHome;
    const rootPath = pages.find((page)=>getUrlSettings(page).path === "/");
    if (rootPath) return rootPath;
    if (pages[0]) return pages[0];
    return {
        slug: "home",
        title: "Home",
        path: "/",
        isHome: true,
        blocks: []
    };
}
}),
"[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CreatorStudioClient",
    ()=>CreatorStudioClient
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CreatorStudioClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CreatorStudioClient() from the server but CreatorStudioClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx <module evaluation>", "CreatorStudioClient");
}),
"[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CreatorStudioClient",
    ()=>CreatorStudioClient
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CreatorStudioClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CreatorStudioClient() from the server but CreatorStudioClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx", "CreatorStudioClient");
}),
"[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$creator$2f5b$tenantType$5d2f5b$tenantId$5d2f$CreatorStudioClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$creator$2f5b$tenantType$5d2f5b$tenantId$5d2f$CreatorStudioClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$creator$2f5b$tenantType$5d2f5b$tenantId$5d2f$CreatorStudioClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/app/creator/[tenantType]/[tenantId]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreatorPage,
    "dynamic",
    ()=>dynamic,
    "dynamicParams",
    ()=>dynamicParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/platform/content.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$creator$2f5b$tenantType$5d2f5b$tenantId$5d2f$CreatorStudioClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx [app-rsc] (ecmascript)");
;
;
;
const dynamic = "force-dynamic";
const dynamicParams = true;
async function CreatorPage({ params, searchParams }) {
    const { tenantType, tenantId } = await params;
    const resolvedSearchParams = await searchParams;
    const pageSlug = resolvedSearchParams?.page ?? "home";
    const pages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listTenantPages"])(tenantType, tenantId).map((page)=>{
        const urlSettings = Array.isArray(page.settings) ? page.settings.find((s)=>s._template === "urlSettings") : undefined;
        return urlSettings?.slug ?? page.slug;
    }).filter((slug)=>Boolean(slug));
    const safePageSlug = pages.includes(pageSlug) ? pageSlug : pages[0] ?? "home";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$creator$2f5b$tenantType$5d2f5b$tenantId$5d2f$CreatorStudioClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CreatorStudioClient"], {
        tenantType: tenantType,
        tenantId: tenantId,
        pageSlug: safePageSlug,
        pages: pages
    }, void 0, false, {
        fileName: "[project]/src/app/creator/[tenantType]/[tenantId]/page.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/creator/[tenantType]/[tenantId]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/creator/[tenantType]/[tenantId]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0fix_n5._.js.map