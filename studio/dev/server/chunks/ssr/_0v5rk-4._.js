module.exports = [
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/metadata.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addMetadata",
    ()=>addMetadata,
    "hashFromQuery",
    ()=>hashFromQuery
]);
const SYSTEM_KEYS = /* @__PURE__ */ new Set([
    "__typename",
    "_sys",
    "_internalSys",
    "_values",
    "_internalValues",
    "_content_source",
    "_tina_metadata"
]);
const addMetadata = (id, obj, path = [])=>{
    if (obj === null) return obj;
    if (isScalarOrUndefined(obj)) return obj;
    if (obj instanceof String) return obj.valueOf();
    if (Array.isArray(obj)) {
        return obj.map((item, index)=>addMetadata(id, item, [
                ...path,
                index
            ]));
    }
    const next = {};
    for (const [key, value] of Object.entries(obj)){
        if (SYSTEM_KEYS.has(key)) {
            next[key] = value;
        } else {
            next[key] = addMetadata(id, value, [
                ...path,
                key
            ]);
        }
    }
    if (next && typeof next === "object" && "type" in next && next.type === "root") {
        return next;
    }
    return {
        ...next,
        _content_source: {
            queryId: id,
            path
        }
    };
};
function isScalarOrUndefined(value) {
    const type = typeof value;
    if (type === "string") return true;
    if (type === "number") return true;
    if (type === "boolean") return true;
    if (type === "undefined") return true;
    if (value == null) return true;
    if (value instanceof String) return true;
    if (value instanceof Number) return true;
    if (value instanceof Boolean) return true;
    return false;
}
const hashFromQuery = (input)=>{
    let hash = 0;
    for(let i = 0; i < input.length; i++){
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char & 4294967295;
    }
    return Math.abs(hash).toString(36);
};
;
}),
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/quick-edit-css.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QUICK_EDIT_BODY_CLASS",
    ()=>QUICK_EDIT_BODY_CLASS,
    "QUICK_EDIT_CSS",
    ()=>QUICK_EDIT_CSS,
    "QUICK_EDIT_STYLE_ID",
    ()=>QUICK_EDIT_STYLE_ID
]);
const QUICK_EDIT_CSS = `
  [data-tina-field] {
    outline: 2px dashed rgba(34,150,254,0.5);
    transition: box-shadow ease-out 150ms;
  }
  [data-tina-field]:hover {
    box-shadow: inset 100vi 100vh rgba(34,150,254,0.3);
    outline: 2px solid rgba(34,150,254,1);
    cursor: pointer;
  }
  [data-tina-field-overlay] {
    outline: 2px dashed rgba(34,150,254,0.5);
    position: relative;
  }
  [data-tina-field-overlay]:hover {
    cursor: pointer;
    outline: 2px solid rgba(34,150,254,1);
  }
  [data-tina-field-overlay]::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 20;
    transition: opacity ease-out 150ms;
    background-color: rgba(34,150,254,0.3);
    opacity: 0;
  }
  [data-tina-field-overlay]:hover::after {
    opacity: 1;
  }
`;
const QUICK_EDIT_BODY_CLASS = "__tina-quick-editing-enabled";
const QUICK_EDIT_STYLE_ID = "__tina-bridge-quick-edit-style";
;
}),
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tinaField",
    ()=>tinaField
]);
const tinaField = (object, property, index)=>{
    const contentSource = object == null ? void 0 : object._content_source;
    if (!contentSource) {
        return "";
    }
    const { queryId, path } = contentSource;
    if (!property) {
        return `${queryId}---${path.join(".")}`;
    }
    const fullPath = typeof index === "number" ? [
        ...path,
        property,
        index
    ] : [
        ...path,
        property
    ];
    return `${queryId}---${fullPath.join(".")}`;
};
;
}),
"[project]/packages/tinacms/packages/tinacms/dist/react.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEditState",
    ()=>useEditState,
    "useTina",
    ()=>useTina
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/metadata.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$quick$2d$edit$2d$css$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/quick-edit-css.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-ssr] (ecmascript)");
;
;
;
;
;
function useTina(props) {
    const stringifiedQuery = JSON.stringify({
        query: props.query,
        variables: props.variables
    });
    const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashFromQuery"])(stringifiedQuery), [
        stringifiedQuery
    ]);
    const processedData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>{
        if (props.data) {
            const dataCopy = JSON.parse(JSON.stringify(props.data));
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addMetadata"])(id, dataCopy, []);
        }
    }, [
        props.data,
        id
    ]);
    const [data, setData] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(processedData);
    const [isClient, setIsClient] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [quickEditEnabled, setQuickEditEnabled] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [isInTinaIframe, setIsInTinaIframe] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        setIsClient(true);
        setData(processedData);
        parent.postMessage({
            type: "url-changed"
        });
    }, [
        id,
        processedData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (quickEditEnabled) {
            let mouseDownHandler = function(e) {
                const attributeNames = e.target.getAttributeNames();
                const tinaAttribute = attributeNames.find((name)=>name.startsWith("data-tina-field"));
                let fieldName;
                if (tinaAttribute) {
                    e.preventDefault();
                    e.stopPropagation();
                    fieldName = e.target.getAttribute(tinaAttribute);
                } else {
                    const ancestor = e.target.closest("[data-tina-field], [data-tina-field-overlay]");
                    if (ancestor) {
                        const attributeNames2 = ancestor.getAttributeNames();
                        const tinaAttribute2 = attributeNames2.find((name)=>name.startsWith("data-tina-field"));
                        if (tinaAttribute2) {
                            e.preventDefault();
                            e.stopPropagation();
                            fieldName = ancestor.getAttribute(tinaAttribute2);
                        }
                    }
                }
                if (fieldName && isInTinaIframe) {
                    parent.postMessage({
                        type: "field:selected",
                        fieldName
                    }, window.location.origin);
                }
            };
            const style = document.createElement("style");
            style.type = "text/css";
            style.textContent = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$quick$2d$edit$2d$css$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QUICK_EDIT_CSS"];
            document.head.appendChild(style);
            document.body.classList.add("__tina-quick-editing-enabled");
            document.addEventListener("click", mouseDownHandler, true);
            return ()=>{
                document.removeEventListener("click", mouseDownHandler, true);
                document.body.classList.remove("__tina-quick-editing-enabled");
                style.remove();
            };
        }
    }, [
        quickEditEnabled,
        isInTinaIframe
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (props == null ? void 0 : props.experimental___selectFormByFormId) {
            parent.postMessage({
                type: "user-select-form",
                formId: props.experimental___selectFormByFormId()
            });
        }
    }, [
        id
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        const { experimental___selectFormByFormId, ...rest } = props;
        parent.postMessage({
            type: "open",
            ...rest,
            id
        }, window.location.origin);
        const handleMessage = (event)=>{
            if (event.data.type === "quickEditEnabled") {
                setQuickEditEnabled(event.data.value);
            }
            if (event.data.id === id && event.data.type === "updateData") {
                const rawData = event.data.data;
                const newlyProcessedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addMetadata"])(id, JSON.parse(JSON.stringify(rawData)), []);
                setData(newlyProcessedData);
                setIsInTinaIframe(true);
                const anyTinaField = document.querySelector("[data-tina-field]");
                if (anyTinaField) {
                    parent.postMessage({
                        type: "quick-edit",
                        value: true
                    }, window.location.origin);
                } else {
                    parent.postMessage({
                        type: "quick-edit",
                        value: false
                    }, window.location.origin);
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return ()=>{
            window.removeEventListener("message", handleMessage);
            parent.postMessage({
                type: "close",
                id
            }, window.location.origin);
        };
    }, [
        id,
        setQuickEditEnabled
    ]);
    return {
        data,
        isClient
    };
}
function useEditState() {
    const [edit, setEdit] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    return {
        edit
    };
}
;
}),
"[project]/src/platform/catalog.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPreset",
    ()=>getPreset,
    "getThemeBlocks",
    ()=>getThemeBlocks,
    "stylePresets",
    ()=>stylePresets,
    "themeLayouts",
    ()=>themeLayouts,
    "variantPresets",
    ()=>variantPresets
]);
const stylePresets = {
    "doctor-teal-clean": {
        name: "Clinical Emerald",
        colors: {
            primary: "#0D9488",
            secondary: "#99F6E4",
            accent: "#0F766E",
            background: "#FAFAFA",
            surface: "#FFFFFF",
            text: "#134E4A"
        },
        shape: {
            radius: "8px"
        },
        typography: {
            heading: "Inter, system-ui, sans-serif",
            body: "Inter, system-ui, sans-serif"
        }
    },
    "doctor-premium-warm": {
        name: "Warm Patient-Centric",
        colors: {
            primary: "#7C2D12",
            secondary: "#FDBA74",
            accent: "#9A3412",
            background: "#FFFBF0",
            surface: "#FFFFFF",
            text: "#431407"
        },
        shape: {
            radius: "16px"
        },
        typography: {
            heading: "Merriweather, serif",
            body: "Inter, sans-serif"
        }
    },
    "doctor-bright-child": {
        name: "Pediatric Playful",
        colors: {
            primary: "#2563EB",
            secondary: "#F472B6",
            accent: "#FACC15",
            background: "#F8FAFC",
            surface: "#FFFFFF",
            text: "#1E3A8A"
        },
        shape: {
            radius: "24px"
        },
        typography: {
            heading: "Outfit, sans-serif",
            body: "Inter, sans-serif"
        }
    },
    "doctor-derma-minimal": {
        name: "Minimalist Aesthetic",
        colors: {
            primary: "#BE185D",
            secondary: "#F9A8D4",
            accent: "#9D174D",
            background: "#FFFFFF",
            surface: "#FFF1F2",
            text: "#831843"
        },
        shape: {
            radius: "2px"
        },
        typography: {
            heading: "Inter, sans-serif",
            body: "Inter, sans-serif"
        }
    },
    "doctor-slate-precision": {
        name: "Modern Specialist",
        colors: {
            primary: "#0F172A",
            secondary: "#64748B",
            accent: "#3B82F6",
            background: "#FFFFFF",
            surface: "#F8FAFC",
            text: "#1E293B"
        },
        shape: {
            radius: "4px"
        },
        typography: {
            heading: "Plus Jakarta Sans, sans-serif",
            body: "Plus Jakarta Sans, sans-serif"
        }
    },
    "hospital-blue-modern": {
        name: "Trusted Institution",
        colors: {
            primary: "#1E3A8A",
            secondary: "#BFDBFE",
            accent: "#2563EB",
            background: "#F1F5F9",
            surface: "#FFFFFF",
            text: "#1E293B"
        },
        shape: {
            radius: "10px"
        },
        typography: {
            heading: "Inter, sans-serif",
            body: "Inter, sans-serif"
        }
    },
    "hospital-green-trust": {
        name: "Wellness & Recovery",
        colors: {
            primary: "#064E3B",
            secondary: "#A7F3D0",
            accent: "#059669",
            background: "#F0FDF4",
            surface: "#FFFFFF",
            text: "#064E3B"
        },
        shape: {
            radius: "12px"
        },
        typography: {
            heading: "Fraunces, serif",
            body: "Inter, sans-serif"
        }
    },
    "hospital-red-emergency": {
        name: "High-Response Emergency",
        colors: {
            primary: "#991B1B",
            secondary: "#FECACA",
            accent: "#DC2626",
            background: "#FFFFFF",
            surface: "#FEF2F2",
            text: "#450A0A"
        },
        shape: {
            radius: "4px"
        },
        typography: {
            heading: "Roboto, sans-serif",
            body: "Roboto, sans-serif"
        }
    },
    "hospital-indigo-specialty": {
        name: "Corporate Specialty",
        colors: {
            primary: "#312E81",
            secondary: "#C7D2FE",
            accent: "#4F46E5",
            background: "#F5F3FF",
            surface: "#FFFFFF",
            text: "#1E1B4B"
        },
        shape: {
            radius: "20px"
        },
        typography: {
            heading: "Outfit, sans-serif",
            body: "Inter, sans-serif"
        }
    },
    "hospital-community-soft": {
        name: "Friendly Local Clinic",
        colors: {
            primary: "#365314",
            secondary: "#D9F99D",
            accent: "#65A30D",
            background: "#F7FEE7",
            surface: "#FFFFFF",
            text: "#1A2E05"
        },
        shape: {
            radius: "32px"
        },
        typography: {
            heading: "Lora, serif",
            body: "Inter, sans-serif"
        }
    }
};
const variantPresets = {
    doctor: {
        "doctor-classic": {
            hero: "split",
            profile: "credentials",
            services: "cards",
            timings: "table",
            gallery: "grid",
            faq: "accordion",
            cta: "banner"
        },
        "doctor-editorial": {
            hero: "centered",
            profile: "editorial",
            services: "list",
            timings: "list",
            gallery: "showcase",
            faq: "list",
            cta: "inline"
        },
        "doctor-compact": {
            hero: "compact",
            profile: "credentials",
            services: "compact",
            timings: "chips",
            gallery: "strip",
            faq: "accordion",
            cta: "sticky"
        },
        "doctor-premium": {
            hero: "profile-card",
            profile: "editorial",
            services: "featured",
            timings: "cards",
            gallery: "showcase",
            faq: "two-column",
            cta: "floating"
        },
        "doctor-specialist": {
            hero: "credential",
            profile: "timeline",
            services: "treatment-grid",
            timings: "cards",
            gallery: "grid",
            faq: "checklist",
            cta: "booking-panel"
        }
    },
    hospital: {
        "hospital-standard": {
            hero: "hospital",
            profile: "overview",
            services: "departments",
            timings: "emergency",
            gallery: "facility",
            faq: "search",
            cta: "emergency"
        },
        "hospital-emergency": {
            hero: "emergency",
            profile: "overview",
            services: "departments",
            timings: "emergency",
            gallery: "facility",
            faq: "accordion",
            cta: "emergency"
        },
        "hospital-specialty": {
            hero: "specialty",
            profile: "leadership",
            services: "programs",
            timings: "table",
            gallery: "showcase",
            faq: "two-column",
            cta: "banner"
        },
        "hospital-community": {
            hero: "community",
            profile: "overview",
            services: "cards",
            timings: "list",
            gallery: "grid",
            faq: "list",
            cta: "inline"
        },
        "hospital-network": {
            hero: "network",
            profile: "overview",
            services: "departments",
            timings: "cards",
            gallery: "facility",
            faq: "search",
            cta: "emergency"
        }
    }
};
const themeLayouts = {
    "doctor-standard": [
        {
            _template: "header",
            enabled: true
        },
        {
            _template: "hero",
            enabled: true
        },
        {
            _template: "profile",
            enabled: true
        },
        {
            _template: "awards",
            enabled: true
        },
        {
            _template: "services",
            enabled: true
        },
        {
            _template: "gallery",
            enabled: true
        },
        {
            _template: "cta",
            enabled: true
        }
    ],
    "doctor-profile-heavy": [
        {
            _template: "header",
            enabled: true
        },
        {
            _template: "hero",
            enabled: true
        },
        {
            _template: "profile",
            enabled: true
        },
        {
            _template: "awards",
            enabled: true
        },
        {
            _template: "timings",
            enabled: true
        },
        {
            _template: "faq",
            enabled: true
        },
        {
            _template: "cta",
            enabled: true
        }
    ],
    "doctor-service-heavy": [
        {
            _template: "header",
            enabled: true
        },
        {
            _template: "hero",
            enabled: true
        },
        {
            _template: "services",
            enabled: true
        },
        {
            _template: "timings",
            enabled: true
        },
        {
            _template: "profile",
            enabled: true
        },
        {
            _template: "awards",
            enabled: true
        },
        {
            _template: "cta",
            enabled: true
        }
    ],
    "hospital-standard": [
        {
            _template: "header",
            enabled: true
        },
        {
            _template: "hero",
            enabled: true
        },
        {
            _template: "services",
            enabled: true
        },
        {
            _template: "timings",
            enabled: true
        },
        {
            _template: "gallery",
            enabled: true
        },
        {
            _template: "cta",
            enabled: true
        }
    ],
    "hospital-emergency-first": [
        {
            _template: "header",
            enabled: true
        },
        {
            _template: "timings",
            enabled: true
        },
        {
            _template: "hero",
            enabled: true
        },
        {
            _template: "services",
            enabled: true
        },
        {
            _template: "cta",
            enabled: true
        }
    ]
};
function getPreset(tenant) {
    const typePresets = variantPresets[tenant.tenantType];
    if (!typePresets) {
        return Object.values(variantPresets.doctor)[0];
    }
    const presetId = tenant.presentation?.variantPresetId;
    const preset = typePresets[presetId];
    if (preset) return preset;
    const firstPreset = Object.values(typePresets)[0];
    return firstPreset ?? Object.values(variantPresets.doctor)[0];
}
function getThemeBlocks(tenant) {
    const themeId = tenant.presentation?.themeId;
    return themeLayouts[themeId] ?? themeLayouts["doctor-standard"];
}
}),
"[project]/src/platform/SiteRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteRenderer",
    ()=>SiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f$tinacms$2f$dist$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/tinacms/dist/react.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/platform/catalog.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const defaultStyle = {
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
};
function SiteRenderer({ tenant, pageSlug = "home", previewLinks = false, tinaDocument, studioMode = false }) {
    const preset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPreset"])(tenant);
    const styleId = tenant.presentation?.styleId;
    const catalogStyle = styleId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stylePresets"][styleId] : undefined;
    const style = catalogStyle ?? tenant.presentation?.style ?? defaultStyle;
    const colors = style.colors ?? defaultStyle.colors;
    const shape = style.shape ?? defaultStyle.shape;
    const typography = style.typography ?? defaultStyle.typography;
    const cssVars = {
        "--primary": colors.primary,
        "--secondary": colors.secondary,
        "--accent": colors.accent,
        "--site-bg": colors.background,
        "--surface": colors.surface,
        "--site-text": colors.text,
        "--radius": shape.radius,
        "--heading": typography.heading,
        "--body": typography.body,
        "--background": colors.background
    };
    const themeBlocks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemeBlocks"])(tenant);
    const pageBlocks = Array.isArray(tenant.blocks) && tenant.blocks.length > 0 ? tenant.blocks : themeBlocks;
    const hasPageHeader = pageBlocks.some((b)=>b._template === "header" && b.enabled !== false);
    const showGlobalHeader = !hasPageHeader && (tenant.header?.show ?? true);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `site-shell ${tenant.tenantType}`,
        style: cssVars,
        children: [
            previewLinks ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewHeader, {
                tenant: tenant
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 67,
                columnNumber: 23
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                className: "tenant-site",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubscriptionBar, {
                        tenant: tenant
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    showGlobalHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                        tenant: tenant,
                        logo: tenant.header?.logo,
                        navLinks: tenant.header?.navLinks,
                        sectionField: studioMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tinaField"])(tenant, "header") : undefined
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    renderBlocks(tenant, preset, pageBlocks, tinaDocument, studioMode)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function renderBlocks(tenant, preset, blocks, tinaDocument, studioMode = false) {
    const tinaBlocks = Array.isArray(tinaDocument?.blocks) ? tinaDocument.blocks ?? [] : [];
    return blocks.map((block, index)=>{
        if (block.enabled === false || block.enabled === "false") return null;
        const key = `${block._template}-${index}`;
        const tinaBlock = tinaBlocks[index] ?? undefined;
        const sectionField = tinaBlock ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tinaField"])(tinaBlock) : undefined;
        switch(block._template){
            case "header":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                    tenant: tenant,
                    logo: block.logo || tenant.header?.logo,
                    navLinks: block.navLinks || tenant.header?.navLinks,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this);
            case "awards":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Awards, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 119,
                    columnNumber: 11
                }, this);
            case "hero":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Hero, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.hero,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 129,
                    columnNumber: 16
                }, this);
            case "profile":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Profile, {
                    tenant: tenant,
                    variant: preset.profile,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 132,
                    columnNumber: 11
                }, this);
            case "services":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Services, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.services,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this);
            case "timings":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Timings, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.timings,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 156,
                    columnNumber: 11
                }, this);
            case "gallery":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Gallery, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.gallery,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 169,
                    columnNumber: 11
                }, this);
            case "faq":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FAQ, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.faq,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 182,
                    columnNumber: 11
                }, this);
            case "cta":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CTA, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.cta,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 195,
                    columnNumber: 11
                }, this);
            case "testimonials":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Testimonials, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 208,
                    columnNumber: 11
                }, this);
            case "stats":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Stats, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 219,
                    columnNumber: 11
                }, this);
            case "text":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextBlock, {
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 229,
                    columnNumber: 16
                }, this);
            default:
                return null;
        }
    });
}
function Header({ tenant, logo, navLinks, sectionField, studioMode }) {
    const displayLogo = logo || tenant.profile.photo;
    const links = Array.isArray(navLinks) && navLinks.length > 0 ? navLinks : [
        "Services",
        "About",
        "Contact"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "site-header",
        "data-tina-field": sectionField,
        style: {
            padding: "20px 40px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: displayLogo,
                        alt: "Logo",
                        style: {
                            height: "40px",
                            width: "40px",
                            borderRadius: "50%",
                            objectFit: "cover"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            fontSize: "18px"
                        },
                        children: tenant.profile.displayName
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: {
                    display: "flex",
                    gap: "24px"
                },
                children: links.map((link, i)=>{
                    const [label, url] = link.includes("|") ? link.split("|") : [
                        link,
                        "#"
                    ];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: url,
                        style: {
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--site-text)",
                            opacity: 0.8,
                            textDecoration: "none"
                        },
                        children: label
                    }, i, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 262,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, this);
}
function Awards({ tenant, block, blockIndex, sectionField, studioMode }) {
    const awards = Array.isArray(block.items) && block.items.length > 0 ? block.items : [
        {
            title: "Best Healthcare Provider",
            year: "2023",
            organization: "Global Health Awards"
        },
        {
            title: "Excellence in Surgery",
            year: "2022",
            organization: "National Medical Board"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block awards-section",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "Recognition",
                title: block.title ?? "Awards & Achievements"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "awards-grid",
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px"
                },
                children: awards.map((award, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "award-card",
                        style: {
                            textAlign: "center",
                            padding: "24px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "24px",
                                    marginBottom: "12px"
                                },
                                children: "🏆"
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 296,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.title` : undefined,
                                style: {
                                    fontSize: "18px",
                                    marginBottom: "4px"
                                },
                                children: award.title
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 297,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "14px",
                                    opacity: 0.6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.organization` : undefined,
                                        children: award.organization
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 299,
                                        columnNumber: 15
                                    }, this),
                                    " •",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.year` : undefined,
                                        children: award.year
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 300,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 298,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 295,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 291,
        columnNumber: 5
    }, this);
}
function PreviewHeader({ tenant }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "preview-header",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: tenant.profile.displayName
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `/site/${tenant.tenantId}`,
                        children: "View Site"
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/admin/index.html",
                        children: "Tina Admin"
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 315,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 311,
        columnNumber: 5
    }, this);
}
function SubscriptionBar({ tenant }) {
    const plan = tenant.subscription?.plan ?? "free";
    if (plan === "pro" || plan === "enterprise") return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "subscription-bar",
        style: {
            background: "rgba(0,0,0,0.05)",
            color: "var(--site-text)",
            padding: "8px 20px",
            fontSize: "12px",
            borderBottom: "1px solid rgba(0,0,0,0.05)"
        },
        children: [
            "Built with ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: "Creator Studio"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 327,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 326,
        columnNumber: 5
    }, this);
}
function Hero({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: `hero hero-${variant}`,
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hero-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                        field: tinaDocument ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tinaField"])(tinaDocument, "profile.specialty") : undefined,
                        editPath: studioMode ? "profile.specialty" : undefined,
                        children: tenant.profile.specialty
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
                        level: 1,
                        editPath: studioMode ? `blocks.${blockIndex}.headline` : undefined,
                        children: block.headline
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 358,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                        editPath: studioMode ? `blocks.${blockIndex}.subheadline` : undefined,
                        children: block.subheadline
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 364,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ButtonGroup, {
                        tenant: tenant
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 369,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 351,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hero-image-wrapper",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ImagePrimitive, {
                    src: tenant.profile.photo,
                    alt: tenant.profile.displayName,
                    className: "hero-photo"
                }, void 0, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 372,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 371,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
function Profile({ tenant, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: `block profile profile-${variant}`,
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "profile-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                        children: tenant.tenantType === "doctor" ? "Expertise" : "About Us"
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 394,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
                        level: 2,
                        editPath: studioMode ? "profile.displayName" : undefined,
                        children: tenant.profile.displayName
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                        editPath: studioMode ? "profile.bio" : undefined,
                        children: tenant.profile.bio
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 398,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "chip-row",
                        children: safeArray(tenant.profile.degrees).map((degree, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "chip",
                                children: degree
                            }, `${degree}-${index}`, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 401,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 399,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 393,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                className: "profile-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card-metric",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: [
                                    tenant.profile.experienceYears,
                                    "+"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 409,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Years Experience"
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 410,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 408,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                        style: {
                            margin: "16px 0",
                            opacity: 0.1
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 412,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        children: [
                            "Registration: ",
                            tenant.profile.registrationNumber
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 413,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 407,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 392,
        columnNumber: 5
    }, this);
}
function Services({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "Services",
                title: block.title ?? "What We Offer"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 438,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `services services-${variant}`,
                children: safeArray(block.items).map((service, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "service-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "icon",
                                children: iconFor(service.icon)
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.title` : undefined,
                                children: service.title
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 443,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                editPath: studioMode ? `blocks.${blockIndex}.items.${index}.description` : undefined,
                                children: service.description
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 444,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${service?.title ?? "service"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 441,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 439,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 437,
        columnNumber: 5
    }, this);
}
function Timings({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "Schedule",
                title: block.title ?? "Visiting Hours"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 471,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `timings timings-${variant}`,
                children: safeArray(block.items).map((timing, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "timing-row",
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 0",
                            borderBottom: "1px solid rgba(0,0,0,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.day` : undefined,
                                children: timing.day
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 475,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "right"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.primary` : undefined,
                                        children: timing.primary
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 477,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 478,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        style: {
                                            opacity: 0.6
                                        },
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.secondary` : undefined,
                                        children: timing.secondary
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 479,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 476,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${timing?.day ?? "timing"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 474,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 472,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 470,
        columnNumber: 5
    }, this);
}
function Gallery({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "Gallery",
                title: block.title ?? "Clinic Photos"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `gallery gallery-${variant}`,
                children: safeArray(block.items).map((image, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gallery-item",
                        style: {
                            overflow: "hidden",
                            borderRadius: "var(--radius)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ImagePrimitive, {
                            src: image.src,
                            alt: image.alt,
                            style: {
                                transition: "transform 0.5s ease"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/platform/SiteRenderer.tsx",
                            lineNumber: 511,
                            columnNumber: 13
                        }, this)
                    }, `${image?.src ?? "image"}-${index}`, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 510,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 508,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 506,
        columnNumber: 5
    }, this);
}
function FAQ({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "FAQ",
                title: block.title ?? "Frequently Asked Questions"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 538,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `faq faq-${variant}`,
                children: safeArray(block.items).map((faq, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "faq-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.question` : undefined,
                                children: faq.question
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 542,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                editPath: studioMode ? `blocks.${blockIndex}.items.${index}.answer` : undefined,
                                children: faq.answer
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 543,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${faq?.question ?? "faq"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 541,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 539,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 537,
        columnNumber: 5
    }, this);
}
function CTA({ tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: `cta cta-${variant}`,
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cta-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
                        level: 2,
                        editPath: studioMode ? `blocks.${blockIndex}.title` : undefined,
                        children: block.title ?? "Ready to book?"
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 571,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                        editPath: studioMode ? `blocks.${blockIndex}.body` : undefined,
                        children: block.body
                    }, void 0, false, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 574,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 570,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ButtonGroup, {
                tenant: tenant
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 576,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 569,
        columnNumber: 5
    }, this);
}
function TextBlock({ block, blockIndex, sectionField, studioMode }) {
    if (!block.heading && !block.body) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block text-block",
        sectionField: sectionField,
        children: [
            block.heading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
                level: 2,
                editPath: studioMode ? `blocks.${blockIndex}.heading` : undefined,
                children: block.heading
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 586,
                columnNumber: 24
            }, this) : null,
            block.body ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                editPath: studioMode ? `blocks.${blockIndex}.body` : undefined,
                children: block.body
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 587,
                columnNumber: 21
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 585,
        columnNumber: 5
    }, this);
}
function BlockTitle({ kicker, title }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "block-title",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                children: kicker
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 595,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
                level: 2,
                children: title
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 596,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 594,
        columnNumber: 5
    }, this);
}
function Section({ className, children, sectionField }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: className,
        "data-tina-field": sectionField,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 611,
        columnNumber: 5
    }, this);
}
function Eyebrow({ children, field, editPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eyebrow",
        "data-tina-field": field,
        "data-edit-path": editPath,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 619,
        columnNumber: 5
    }, this);
}
function Heading({ level, children, field, editPath }) {
    const Tag = level === 1 ? "h1" : "h2";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        "data-tina-field": field,
        "data-edit-path": editPath,
        style: {
            fontFamily: "var(--heading)"
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 638,
        columnNumber: 5
    }, this);
}
function Text({ children, field, editPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        "data-tina-field": field,
        "data-edit-path": editPath,
        style: {
            fontFamily: "var(--body)"
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 646,
        columnNumber: 5
    }, this);
}
function Card({ children, className = "", style = {} }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `card ${className}`,
        style: style,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 653,
        columnNumber: 10
    }, this);
}
function ImagePrimitive({ src, alt, className = "", style = {} }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        className: className,
        src: src,
        alt: alt,
        loading: "lazy",
        style: style
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 657,
        columnNumber: 10
    }, this);
}
function ButtonGroup({ tenant }) {
    const whatsapp = tenant.business?.whatsapp?.replace(/\D/g, "") ?? "";
    const phone = tenant.business?.phone ?? "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "button-row",
        children: [
            whatsapp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                className: "btn primary",
                href: `https://wa.me/${whatsapp}`,
                children: "WhatsApp"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 667,
                columnNumber: 9
            }, this),
            phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                className: "btn secondary",
                href: `tel:${phone}`,
                children: "Call Us"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 672,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 665,
        columnNumber: 5
    }, this);
}
function safeArray(value) {
    return Array.isArray(value) ? value : [];
}
function iconFor(icon) {
    const icons = {
        heart: "♡",
        activity: "∿",
        scan: "⌖",
        cross: "+",
        users: "◎"
    };
    return icons[icon ?? ""] ?? "•";
}
function Testimonials({ tenant, block, blockIndex, sectionField, studioMode }) {
    const testimonials = safeArray(block.items);
    if (testimonials.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block testimonials-section",
        sectionField: sectionField,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                kicker: block.kicker ?? "Testimonials",
                title: block.title ?? "What our patients say"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 714,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "testimonials-grid",
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px"
                },
                children: testimonials.map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "testimonial-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                editPath: studioMode ? `blocks.${blockIndex}.items.${i}.quote` : undefined,
                                children: [
                                    '"',
                                    t.quote,
                                    '"'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 718,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: "16px",
                                    fontWeight: "bold"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.author` : undefined,
                                    children: [
                                        "- ",
                                        t.author || "Patient"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                                    lineNumber: 720,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 719,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 717,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 715,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 713,
        columnNumber: 5
    }, this);
}
function Stats({ tenant, block, blockIndex, sectionField, studioMode }) {
    const stats = safeArray(block.items);
    if (stats.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
        className: "block stats-section",
        sectionField: sectionField,
        style: {
            background: "var(--primary)",
            color: "white",
            borderRadius: "var(--radius)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-around",
                gap: "24px",
                textAlign: "center"
            },
            children: stats.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "stat-item",
                    style: {
                        flex: "1 1 200px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: "3rem",
                                fontWeight: 800,
                                marginBottom: "8px"
                            },
                            "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.value` : undefined,
                            children: s.value
                        }, void 0, false, {
                            fileName: "[project]/src/platform/SiteRenderer.tsx",
                            lineNumber: 750,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: "1rem",
                                opacity: 0.8,
                                textTransform: "uppercase",
                                letterSpacing: "1px"
                            },
                            "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.label` : undefined,
                            children: s.label
                        }, void 0, false, {
                            fileName: "[project]/src/platform/SiteRenderer.tsx",
                            lineNumber: 753,
                            columnNumber: 13
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 749,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 747,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 746,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/site/[tenantId]/[pageSlug]/DevPreviewAutoRedirect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DevPreviewAutoRedirect",
    ()=>DevPreviewAutoRedirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
function DevPreviewAutoRedirect() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Only redirect in development mode if studio or draft is detected
        if ("TURBOPACK compile-time truthy", 1) {
            const isStudio = searchParams.get("studio") === "1";
            const hasDraft = searchParams.has("draft");
            if ((isStudio || hasDraft) && !pathname.endsWith("/preview")) {
                router.replace(`${pathname}/preview?${searchParams.toString()}`);
            }
        }
    }, [
        pathname,
        searchParams,
        router
    ]);
    return null;
}
}),
];

//# sourceMappingURL=_0v5rk-4._.js.map