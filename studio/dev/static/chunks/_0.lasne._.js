(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/metadata.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/quick-edit-css.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/tinacms/packages/tinacms/dist/react.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEditState",
    ()=>useEditState,
    "useTina",
    ()=>useTina
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/metadata.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$quick$2d$edit$2d$css$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/quick-edit-css.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
function useTina(props) {
    _s();
    const stringifiedQuery = JSON.stringify({
        query: props.query,
        variables: props.variables
    });
    const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "useTina.useMemo[id]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hashFromQuery"])(stringifiedQuery)
    }["useTina.useMemo[id]"], [
        stringifiedQuery
    ]);
    const processedData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "useTina.useMemo[processedData]": ()=>{
            if (props.data) {
                const dataCopy = JSON.parse(JSON.stringify(props.data));
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMetadata"])(id, dataCopy, []);
            }
        }
    }["useTina.useMemo[processedData]"], [
        props.data,
        id
    ]);
    const [data, setData] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(processedData);
    const [isClient, setIsClient] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [quickEditEnabled, setQuickEditEnabled] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [isInTinaIframe, setIsInTinaIframe] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "useTina.useEffect": ()=>{
            setIsClient(true);
            setData(processedData);
            parent.postMessage({
                type: "url-changed"
            });
        }
    }["useTina.useEffect"], [
        id,
        processedData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "useTina.useEffect": ()=>{
            if (quickEditEnabled) {
                let mouseDownHandler = {
                    "useTina.useEffect.mouseDownHandler": function(e) {
                        const attributeNames = e.target.getAttributeNames();
                        const tinaAttribute = attributeNames.find({
                            "useTina.useEffect.mouseDownHandler.tinaAttribute": (name)=>name.startsWith("data-tina-field")
                        }["useTina.useEffect.mouseDownHandler.tinaAttribute"]);
                        let fieldName;
                        if (tinaAttribute) {
                            e.preventDefault();
                            e.stopPropagation();
                            fieldName = e.target.getAttribute(tinaAttribute);
                        } else {
                            const ancestor = e.target.closest("[data-tina-field], [data-tina-field-overlay]");
                            if (ancestor) {
                                const attributeNames2 = ancestor.getAttributeNames();
                                const tinaAttribute2 = attributeNames2.find({
                                    "useTina.useEffect.mouseDownHandler.tinaAttribute2": (name)=>name.startsWith("data-tina-field")
                                }["useTina.useEffect.mouseDownHandler.tinaAttribute2"]);
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
                    }
                }["useTina.useEffect.mouseDownHandler"];
                const style = document.createElement("style");
                style.type = "text/css";
                style.textContent = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$quick$2d$edit$2d$css$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QUICK_EDIT_CSS"];
                document.head.appendChild(style);
                document.body.classList.add("__tina-quick-editing-enabled");
                document.addEventListener("click", mouseDownHandler, true);
                return ({
                    "useTina.useEffect": ()=>{
                        document.removeEventListener("click", mouseDownHandler, true);
                        document.body.classList.remove("__tina-quick-editing-enabled");
                        style.remove();
                    }
                })["useTina.useEffect"];
            }
        }
    }["useTina.useEffect"], [
        quickEditEnabled,
        isInTinaIframe
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "useTina.useEffect": ()=>{
            if (props == null ? void 0 : props.experimental___selectFormByFormId) {
                parent.postMessage({
                    type: "user-select-form",
                    formId: props.experimental___selectFormByFormId()
                });
            }
        }
    }["useTina.useEffect"], [
        id
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "useTina.useEffect": ()=>{
            const { experimental___selectFormByFormId, ...rest } = props;
            parent.postMessage({
                type: "open",
                ...rest,
                id
            }, window.location.origin);
            const handleMessage = {
                "useTina.useEffect.handleMessage": (event)=>{
                    if (event.data.type === "quickEditEnabled") {
                        setQuickEditEnabled(event.data.value);
                    }
                    if (event.data.id === id && event.data.type === "updateData") {
                        const rawData = event.data.data;
                        const newlyProcessedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$metadata$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMetadata"])(id, JSON.parse(JSON.stringify(rawData)), []);
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
                }
            }["useTina.useEffect.handleMessage"];
            window.addEventListener("message", handleMessage);
            return ({
                "useTina.useEffect": ()=>{
                    window.removeEventListener("message", handleMessage);
                    parent.postMessage({
                        type: "close",
                        id
                    }, window.location.origin);
                }
            })["useTina.useEffect"];
        }
    }["useTina.useEffect"], [
        id,
        setQuickEditEnabled
    ]);
    return {
        data,
        isClient
    };
}
_s(useTina, "CUB9rrA20RgY6RNgmOH1Ybq+08o=");
function useEditState() {
    _s1();
    const [edit, setEdit] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "useEditState.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                parent.postMessage({
                    type: "isEditMode"
                }, window.location.origin);
                window.addEventListener("message", {
                    "useEditState.useEffect": (event)=>{
                        var _a;
                        if (((_a = event.data) == null ? void 0 : _a.type) === "tina:editMode") {
                            setEdit(true);
                        }
                    }
                }["useEditState.useEffect"]);
            }
        }
    }["useEditState.useEffect"], []);
    return {
        edit
    };
}
_s1(useEditState, "pWgw86UVg7fQ7klzca34Se5w2lo=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/platform/catalog.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/platform/SiteRenderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteRenderer",
    ()=>SiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f$tinacms$2f$dist$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/tinacms/dist/react.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/tinacms/packages/@tinacms/bridge/dist/tina-field.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/platform/catalog.ts [app-client] (ecmascript)");
"use client";
;
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
function SiteRenderer(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(45);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 45; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant, pageSlug: t1, previewLinks: t2, tinaDocument, studioMode: t3 } = t0;
    t1 === undefined ? "home" : t1;
    const previewLinks = t2 === undefined ? false : t2;
    const studioMode = t3 === undefined ? false : t3;
    let t10;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[1] !== previewLinks || $[2] !== studioMode || $[3] !== tenant || $[4] !== tinaDocument) {
        const preset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPreset"])(tenant);
        const styleId = tenant.presentation?.styleId;
        const catalogStyle = styleId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stylePresets"][styleId] : undefined;
        const style = catalogStyle ?? tenant.presentation?.style ?? defaultStyle;
        const colors = style.colors ?? defaultStyle.colors;
        const shape = style.shape ?? defaultStyle.shape;
        const typography = style.typography ?? defaultStyle.typography;
        let t11;
        if ($[12] !== colors.accent || $[13] !== colors.background || $[14] !== colors.primary || $[15] !== colors.secondary || $[16] !== colors.surface || $[17] !== colors.text || $[18] !== shape.radius || $[19] !== typography.body || $[20] !== typography.heading) {
            t11 = {
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
            $[12] = colors.accent;
            $[13] = colors.background;
            $[14] = colors.primary;
            $[15] = colors.secondary;
            $[16] = colors.surface;
            $[17] = colors.text;
            $[18] = shape.radius;
            $[19] = typography.body;
            $[20] = typography.heading;
            $[21] = t11;
        } else {
            t11 = $[21];
        }
        const cssVars = t11;
        let t12;
        if ($[22] !== tenant) {
            t12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeBlocks"])(tenant);
            $[22] = tenant;
            $[23] = t12;
        } else {
            t12 = $[23];
        }
        const themeBlocks = t12;
        const pageBlocks = Array.isArray(tenant.blocks) && tenant.blocks.length > 0 ? tenant.blocks : themeBlocks;
        let t13;
        if ($[24] !== pageBlocks) {
            t13 = pageBlocks.some(_SiteRendererPageBlocksSome);
            $[24] = pageBlocks;
            $[25] = t13;
        } else {
            t13 = $[25];
        }
        const hasPageHeader = t13;
        const showGlobalHeader = !hasPageHeader && (tenant.header?.show ?? true);
        t8 = `site-shell ${tenant.tenantType}`;
        t9 = cssVars;
        if ($[26] !== previewLinks || $[27] !== tenant) {
            t10 = previewLinks ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewHeader, {
                tenant: tenant
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 116,
                columnNumber: 28
            }, this) : null;
            $[26] = previewLinks;
            $[27] = tenant;
            $[28] = t10;
        } else {
            t10 = $[28];
        }
        t4 = "tenant-site";
        if ($[29] !== tenant) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubscriptionBar, {
                tenant: tenant
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 125,
                columnNumber: 12
            }, this);
            $[29] = tenant;
            $[30] = t5;
        } else {
            t5 = $[30];
        }
        if ($[31] !== showGlobalHeader || $[32] !== studioMode || $[33] !== tenant) {
            t6 = showGlobalHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                tenant: tenant,
                logo: tenant.header?.logo,
                navLinks: tenant.header?.navLinks,
                sectionField: studioMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tinaField"])(tenant, "header") : undefined
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 132,
                columnNumber: 32
            }, this);
            $[31] = showGlobalHeader;
            $[32] = studioMode;
            $[33] = tenant;
            $[34] = t6;
        } else {
            t6 = $[34];
        }
        t7 = renderBlocks(tenant, preset, pageBlocks, tinaDocument, studioMode);
        $[1] = previewLinks;
        $[2] = studioMode;
        $[3] = tenant;
        $[4] = tinaDocument;
        $[5] = t10;
        $[6] = t4;
        $[7] = t5;
        $[8] = t6;
        $[9] = t7;
        $[10] = t8;
        $[11] = t9;
    } else {
        t10 = $[5];
        t4 = $[6];
        t5 = $[7];
        t6 = $[8];
        t7 = $[9];
        t8 = $[10];
        t9 = $[11];
    }
    let t11;
    if ($[35] !== t4 || $[36] !== t5 || $[37] !== t6 || $[38] !== t7) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
            className: t4,
            children: [
                t5,
                t6,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 163,
            columnNumber: 11
        }, this);
        $[35] = t4;
        $[36] = t5;
        $[37] = t6;
        $[38] = t7;
        $[39] = t11;
    } else {
        t11 = $[39];
    }
    let t12;
    if ($[40] !== t10 || $[41] !== t11 || $[42] !== t8 || $[43] !== t9) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: t8,
            style: t9,
            children: [
                t10,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 174,
            columnNumber: 11
        }, this);
        $[40] = t10;
        $[41] = t11;
        $[42] = t8;
        $[43] = t9;
        $[44] = t12;
    } else {
        t12 = $[44];
    }
    return t12;
}
_c = SiteRenderer;
function _SiteRendererPageBlocksSome(b) {
    return b._template === "header" && b.enabled !== false;
}
function renderBlocks(tenant, preset, blocks, tinaDocument, studioMode = false) {
    const tinaBlocks = Array.isArray(tinaDocument?.blocks) ? tinaDocument.blocks ?? [] : [];
    return blocks.map((block, index)=>{
        if (block.enabled === false || block.enabled === "false") return null;
        const key = `${block._template}-${index}`;
        const tinaBlock = tinaBlocks[index] ?? undefined;
        const sectionField = tinaBlock ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tinaField"])(tinaBlock) : undefined;
        switch(block._template){
            case "header":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                    tenant: tenant,
                    logo: block.logo || tenant.header?.logo,
                    navLinks: block.navLinks || tenant.header?.navLinks,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 201,
                    columnNumber: 16
                }, this);
            case "awards":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Awards, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 203,
                    columnNumber: 16
                }, this);
            case "hero":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Hero, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.hero,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 205,
                    columnNumber: 16
                }, this);
            case "profile":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Profile, {
                    tenant: tenant,
                    variant: preset.profile,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 207,
                    columnNumber: 16
                }, this);
            case "services":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Services, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.services,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 209,
                    columnNumber: 16
                }, this);
            case "timings":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Timings, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.timings,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 211,
                    columnNumber: 16
                }, this);
            case "gallery":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Gallery, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.gallery,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 213,
                    columnNumber: 16
                }, this);
            case "faq":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FAQ, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.faq,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 215,
                    columnNumber: 16
                }, this);
            case "cta":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CTA, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    variant: preset.cta,
                    sectionField: sectionField,
                    tinaDocument: tinaDocument,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 217,
                    columnNumber: 16
                }, this);
            case "testimonials":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Testimonials, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 219,
                    columnNumber: 16
                }, this);
            case "stats":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Stats, {
                    tenant: tenant,
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 221,
                    columnNumber: 16
                }, this);
            case "text":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TextBlock, {
                    block: block,
                    blockIndex: index,
                    sectionField: sectionField,
                    studioMode: studioMode
                }, key, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 223,
                    columnNumber: 16
                }, this);
            default:
                return null;
        }
    });
}
function Header(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(23);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 23; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant, logo, navLinks, sectionField } = t0;
    const displayLogo = logo || tenant.profile.photo;
    let t1;
    if ($[1] !== navLinks) {
        t1 = Array.isArray(navLinks) && navLinks.length > 0 ? navLinks : [
            "Services",
            "About",
            "Contact"
        ];
        $[1] = navLinks;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const links = t1;
    let t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            padding: "20px 40px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        };
        t3 = {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        };
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            objectFit: "cover"
        };
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== displayLogo) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: displayLogo,
            alt: "Logo",
            style: t4
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 288,
            columnNumber: 10
        }, this);
        $[6] = displayLogo;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = {
            fontSize: "18px"
        };
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    let t7;
    if ($[9] !== tenant.profile.displayName) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
            style: t6,
            children: tenant.profile.displayName
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 305,
            columnNumber: 10
        }, this);
        $[9] = tenant.profile.displayName;
        $[10] = t7;
    } else {
        t7 = $[10];
    }
    let t8;
    if ($[11] !== t5 || $[12] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t3,
            children: [
                t5,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 313,
            columnNumber: 10
        }, this);
        $[11] = t5;
        $[12] = t7;
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    let t9;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            display: "flex",
            gap: "24px"
        };
        $[14] = t9;
    } else {
        t9 = $[14];
    }
    let t10;
    if ($[15] !== links) {
        t10 = links.map(_HeaderLinksMap);
        $[15] = links;
        $[16] = t10;
    } else {
        t10 = $[16];
    }
    let t11;
    if ($[17] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            style: t9,
            children: t10
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 340,
            columnNumber: 11
        }, this);
        $[17] = t10;
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] !== sectionField || $[20] !== t11 || $[21] !== t8) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "site-header",
            "data-tina-field": sectionField,
            style: t2,
            children: [
                t8,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 348,
            columnNumber: 11
        }, this);
        $[19] = sectionField;
        $[20] = t11;
        $[21] = t8;
        $[22] = t12;
    } else {
        t12 = $[22];
    }
    return t12;
}
_c1 = Header;
function _HeaderLinksMap(link, i) {
    const [label, url] = link.includes("|") ? link.split("|") : [
        link,
        "#"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
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
        lineNumber: 360,
        columnNumber: 10
    }, this);
}
function Awards(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(20);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 20; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, sectionField, studioMode } = t0;
    let t1;
    if ($[1] !== block.items) {
        t1 = Array.isArray(block.items) && block.items.length > 0 ? block.items : [
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
        $[1] = block.items;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const awards = t1;
    const t2 = block.kicker ?? "Recognition";
    const t3 = block.title ?? "Awards & Achievements";
    let t4;
    if ($[3] !== t2 || $[4] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
            kicker: t2,
            title: t3
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 403,
            columnNumber: 10
        }, this);
        $[3] = t2;
        $[4] = t3;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
        };
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    let t6;
    if ($[7] !== awards || $[8] !== blockIndex || $[9] !== studioMode) {
        let t7;
        if ($[11] !== blockIndex || $[12] !== studioMode) {
            t7 = ({
                "Awards[awards.map()]": (award, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "award-card",
                        style: {
                            textAlign: "center",
                            padding: "24px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "24px",
                                    marginBottom: "12px"
                                },
                                children: "🏆"
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 429,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.title` : undefined,
                                style: {
                                    fontSize: "18px",
                                    marginBottom: "4px"
                                },
                                children: award.title
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 432,
                                columnNumber: 22
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "14px",
                                    opacity: 0.6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.organization` : undefined,
                                        children: award.organization
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 438,
                                        columnNumber: 14
                                    }, this),
                                    " •",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.year` : undefined,
                                        children: award.year
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 438,
                                        columnNumber: 138
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 435,
                                columnNumber: 32
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 426,
                        columnNumber: 47
                    }, this)
            })["Awards[awards.map()]"];
            $[11] = blockIndex;
            $[12] = studioMode;
            $[13] = t7;
        } else {
            t7 = $[13];
        }
        t6 = awards.map(t7);
        $[7] = awards;
        $[8] = blockIndex;
        $[9] = studioMode;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[14] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "awards-grid",
            style: t5,
            children: t6
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 456,
            columnNumber: 10
        }, this);
        $[14] = t6;
        $[15] = t7;
    } else {
        t7 = $[15];
    }
    let t8;
    if ($[16] !== sectionField || $[17] !== t4 || $[18] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block awards-section",
            sectionField: sectionField,
            children: [
                t4,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 464,
            columnNumber: 10
        }, this);
        $[16] = sectionField;
        $[17] = t4;
        $[18] = t7;
        $[19] = t8;
    } else {
        t8 = $[19];
    }
    return t8;
}
_c2 = Awards;
function PreviewHeader(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(11);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 11; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant } = t0;
    let t1;
    if ($[1] !== tenant.profile.displayName) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
            children: tenant.profile.displayName
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 487,
            columnNumber: 10
        }, this);
        $[1] = tenant.profile.displayName;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const t2 = `/site/${tenant.tenantId}`;
    let t3;
    if ($[3] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: t2,
            children: "View Site"
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 496,
            columnNumber: 10
        }, this);
        $[3] = t2;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: "/admin/index.html",
            children: "Tina Admin"
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 504,
            columnNumber: 10
        }, this);
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== t3) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-4",
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 511,
            columnNumber: 10
        }, this);
        $[6] = t3;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== t1 || $[9] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "preview-header",
            children: [
                t1,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 519,
            columnNumber: 10
        }, this);
        $[8] = t1;
        $[9] = t5;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    return t6;
}
_c3 = PreviewHeader;
function SubscriptionBar(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(3);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 3; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant } = t0;
    const plan = tenant.subscription?.plan ?? "free";
    if (plan === "pro" || plan === "enterprise") {
        return null;
    }
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            background: "rgba(0,0,0,0.05)",
            color: "var(--site-text)",
            padding: "8px 20px",
            fontSize: "12px",
            borderBottom: "1px solid rgba(0,0,0,0.05)"
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "subscription-bar",
            style: t1,
            children: [
                "Built with ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                    children: "Creator Studio"
                }, void 0, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 558,
                    columnNumber: 66
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 558,
            columnNumber: 10
        }, this);
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    return t2;
}
_c4 = SubscriptionBar;
function Hero(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(28);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 28; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant, block, blockIndex, variant, sectionField, tinaDocument, studioMode } = t0;
    const t1 = `hero hero-${variant}`;
    let t2;
    if ($[1] !== tinaDocument) {
        t2 = tinaDocument ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$tinacms$2f$packages$2f40$tinacms$2f$bridge$2f$dist$2f$tina$2d$field$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tinaField"])(tinaDocument, "profile.specialty") : undefined;
        $[1] = tinaDocument;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const t3 = studioMode ? "profile.specialty" : undefined;
    let t4;
    if ($[3] !== t2 || $[4] !== t3 || $[5] !== tenant.profile.specialty) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
            field: t2,
            editPath: t3,
            children: tenant.profile.specialty
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 594,
            columnNumber: 10
        }, this);
        $[3] = t2;
        $[4] = t3;
        $[5] = tenant.profile.specialty;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const t5 = studioMode ? `blocks.${blockIndex}.headline` : undefined;
    let t6;
    if ($[7] !== block.headline || $[8] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
            level: 1,
            editPath: t5,
            children: block.headline
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 605,
            columnNumber: 10
        }, this);
        $[7] = block.headline;
        $[8] = t5;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    const t7 = studioMode ? `blocks.${blockIndex}.subheadline` : undefined;
    let t8;
    if ($[10] !== block.subheadline || $[11] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
            editPath: t7,
            children: block.subheadline
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 615,
            columnNumber: 10
        }, this);
        $[10] = block.subheadline;
        $[11] = t7;
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    let t9;
    if ($[13] !== tenant) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ButtonGroup, {
            tenant: tenant
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 624,
            columnNumber: 10
        }, this);
        $[13] = tenant;
        $[14] = t9;
    } else {
        t9 = $[14];
    }
    let t10;
    if ($[15] !== t4 || $[16] !== t6 || $[17] !== t8 || $[18] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hero-content",
            children: [
                t4,
                t6,
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 632,
            columnNumber: 11
        }, this);
        $[15] = t4;
        $[16] = t6;
        $[17] = t8;
        $[18] = t9;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] !== tenant.profile.displayName || $[21] !== tenant.profile.photo) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hero-image-wrapper",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImagePrimitive, {
                src: tenant.profile.photo,
                alt: tenant.profile.displayName,
                className: "hero-photo"
            }, void 0, false, {
                fileName: "[project]/src/platform/SiteRenderer.tsx",
                lineNumber: 643,
                columnNumber: 47
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 643,
            columnNumber: 11
        }, this);
        $[20] = tenant.profile.displayName;
        $[21] = tenant.profile.photo;
        $[22] = t11;
    } else {
        t11 = $[22];
    }
    let t12;
    if ($[23] !== sectionField || $[24] !== t1 || $[25] !== t10 || $[26] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: t1,
            sectionField: sectionField,
            children: [
                t10,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 652,
            columnNumber: 11
        }, this);
        $[23] = sectionField;
        $[24] = t1;
        $[25] = t10;
        $[26] = t11;
        $[27] = t12;
    } else {
        t12 = $[27];
    }
    return t12;
}
_c5 = Hero;
function Profile(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(34);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 34; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant, variant, sectionField, studioMode } = t0;
    const t1 = `block profile profile-${variant}`;
    const t2 = tenant.tenantType === "doctor" ? "Expertise" : "About Us";
    let t3;
    if ($[1] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
            children: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 681,
            columnNumber: 10
        }, this);
        $[1] = t2;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const t4 = studioMode ? "profile.displayName" : undefined;
    let t5;
    if ($[3] !== t4 || $[4] !== tenant.profile.displayName) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
            level: 2,
            editPath: t4,
            children: tenant.profile.displayName
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 690,
            columnNumber: 10
        }, this);
        $[3] = t4;
        $[4] = tenant.profile.displayName;
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    const t6 = studioMode ? "profile.bio" : undefined;
    let t7;
    if ($[6] !== t6 || $[7] !== tenant.profile.bio) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
            editPath: t6,
            children: tenant.profile.bio
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 700,
            columnNumber: 10
        }, this);
        $[6] = t6;
        $[7] = tenant.profile.bio;
        $[8] = t7;
    } else {
        t7 = $[8];
    }
    let t8;
    if ($[9] !== tenant.profile.degrees) {
        t8 = safeArray(tenant.profile.degrees).map(_ProfileAnonymous);
        $[9] = tenant.profile.degrees;
        $[10] = t8;
    } else {
        t8 = $[10];
    }
    let t9;
    if ($[11] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "chip-row",
            children: t8
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 717,
            columnNumber: 10
        }, this);
        $[11] = t8;
        $[12] = t9;
    } else {
        t9 = $[12];
    }
    let t10;
    if ($[13] !== t3 || $[14] !== t5 || $[15] !== t7 || $[16] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "profile-info",
            children: [
                t3,
                t5,
                t7,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 725,
            columnNumber: 11
        }, this);
        $[13] = t3;
        $[14] = t5;
        $[15] = t7;
        $[16] = t9;
        $[17] = t10;
    } else {
        t10 = $[17];
    }
    let t11;
    if ($[18] !== tenant.profile.experienceYears) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
            children: [
                tenant.profile.experienceYears,
                "+"
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 736,
            columnNumber: 11
        }, this);
        $[18] = tenant.profile.experienceYears;
        $[19] = t11;
    } else {
        t11 = $[19];
    }
    let t12;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "Years Experience"
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 744,
            columnNumber: 11
        }, this);
        $[20] = t12;
    } else {
        t12 = $[20];
    }
    let t13;
    if ($[21] !== t11) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "card-metric",
            children: [
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 751,
            columnNumber: 11
        }, this);
        $[21] = t11;
        $[22] = t13;
    } else {
        t13 = $[22];
    }
    let t14;
    if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
            style: {
                margin: "16px 0",
                opacity: 0.1
            }
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 759,
            columnNumber: 11
        }, this);
        $[23] = t14;
    } else {
        t14 = $[23];
    }
    let t15;
    if ($[24] !== tenant.profile.registrationNumber) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
            children: [
                "Registration: ",
                tenant.profile.registrationNumber
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 769,
            columnNumber: 11
        }, this);
        $[24] = tenant.profile.registrationNumber;
        $[25] = t15;
    } else {
        t15 = $[25];
    }
    let t16;
    if ($[26] !== t13 || $[27] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
            className: "profile-card",
            children: [
                t13,
                t14,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 777,
            columnNumber: 11
        }, this);
        $[26] = t13;
        $[27] = t15;
        $[28] = t16;
    } else {
        t16 = $[28];
    }
    let t17;
    if ($[29] !== sectionField || $[30] !== t1 || $[31] !== t10 || $[32] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: t1,
            sectionField: sectionField,
            children: [
                t10,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 786,
            columnNumber: 11
        }, this);
        $[29] = sectionField;
        $[30] = t1;
        $[31] = t10;
        $[32] = t16;
        $[33] = t17;
    } else {
        t17 = $[33];
    }
    return t17;
}
_c6 = Profile;
function _ProfileAnonymous(degree, index) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "chip",
        children: degree
    }, `${degree}-${index}`, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 798,
        columnNumber: 10
    }, this);
}
function Services(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, variant, sectionField, studioMode } = t0;
    const t1 = block.kicker ?? "Services";
    const t2 = block.title ?? "What We Offer";
    let t3;
    if ($[1] !== t1 || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
            kicker: t1,
            title: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 819,
            columnNumber: 10
        }, this);
        $[1] = t1;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const t4 = `services services-${variant}`;
    let t5;
    if ($[4] !== block.items || $[5] !== blockIndex || $[6] !== studioMode) {
        let t6;
        if ($[8] !== blockIndex || $[9] !== studioMode) {
            t6 = ({
                "Services[(anonymous)()]": (service, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "service-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "icon",
                                children: iconFor(service.icon)
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 832,
                                columnNumber: 135
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.title` : undefined,
                                children: service.title
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 832,
                                columnNumber: 188
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                editPath: studioMode ? `blocks.${blockIndex}.items.${index}.description` : undefined,
                                children: service.description
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 832,
                                columnNumber: 298
                            }, this)
                        ]
                    }, `${service?.title ?? "service"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 832,
                        columnNumber: 56
                    }, this)
            })["Services[(anonymous)()]"];
            $[8] = blockIndex;
            $[9] = studioMode;
            $[10] = t6;
        } else {
            t6 = $[10];
        }
        t5 = safeArray(block.items).map(t6);
        $[4] = block.items;
        $[5] = blockIndex;
        $[6] = studioMode;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[11] !== t4 || $[12] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 850,
            columnNumber: 10
        }, this);
        $[11] = t4;
        $[12] = t5;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== sectionField || $[15] !== t3 || $[16] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block",
            sectionField: sectionField,
            children: [
                t3,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 859,
            columnNumber: 10
        }, this);
        $[14] = sectionField;
        $[15] = t3;
        $[16] = t6;
        $[17] = t7;
    } else {
        t7 = $[17];
    }
    return t7;
}
_c7 = Services;
function Timings(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, variant, sectionField, studioMode } = t0;
    const t1 = block.kicker ?? "Schedule";
    const t2 = block.title ?? "Visiting Hours";
    let t3;
    if ($[1] !== t1 || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
            kicker: t1,
            title: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 888,
            columnNumber: 10
        }, this);
        $[1] = t1;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const t4 = `timings timings-${variant}`;
    let t5;
    if ($[4] !== block.items || $[5] !== blockIndex || $[6] !== studioMode) {
        let t6;
        if ($[8] !== blockIndex || $[9] !== studioMode) {
            t6 = ({
                "Timings[(anonymous)()]": (timing, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "timing-row",
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 0",
                            borderBottom: "1px solid rgba(0,0,0,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.day` : undefined,
                                children: timing.day
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 906,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "right"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.primary` : undefined,
                                        children: timing.primary
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 908,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 908,
                                        columnNumber: 131
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        style: {
                                            opacity: 0.6
                                        },
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.secondary` : undefined,
                                        children: timing.secondary
                                    }, void 0, false, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 908,
                                        columnNumber: 137
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 906,
                                columnNumber: 125
                            }, this)
                        ]
                    }, `${timing?.day ?? "timing"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 901,
                        columnNumber: 54
                    }, this)
            })["Timings[(anonymous)()]"];
            $[8] = blockIndex;
            $[9] = studioMode;
            $[10] = t6;
        } else {
            t6 = $[10];
        }
        t5 = safeArray(block.items).map(t6);
        $[4] = block.items;
        $[5] = blockIndex;
        $[6] = studioMode;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[11] !== t4 || $[12] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 928,
            columnNumber: 10
        }, this);
        $[11] = t4;
        $[12] = t5;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== sectionField || $[15] !== t3 || $[16] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block",
            sectionField: sectionField,
            children: [
                t3,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 937,
            columnNumber: 10
        }, this);
        $[14] = sectionField;
        $[15] = t3;
        $[16] = t6;
        $[17] = t7;
    } else {
        t7 = $[17];
    }
    return t7;
}
_c8 = Timings;
function Gallery(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, variant, sectionField } = t0;
    const t1 = block.kicker ?? "Gallery";
    const t2 = block.title ?? "Clinic Photos";
    let t3;
    if ($[1] !== t1 || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
            kicker: t1,
            title: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 964,
            columnNumber: 10
        }, this);
        $[1] = t1;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const t4 = `gallery gallery-${variant}`;
    let t5;
    if ($[4] !== block.items) {
        t5 = safeArray(block.items).map(_GalleryAnonymous);
        $[4] = block.items;
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    let t6;
    if ($[6] !== t4 || $[7] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 982,
            columnNumber: 10
        }, this);
        $[6] = t4;
        $[7] = t5;
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    let t7;
    if ($[9] !== sectionField || $[10] !== t3 || $[11] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block",
            sectionField: sectionField,
            children: [
                t3,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 991,
            columnNumber: 10
        }, this);
        $[9] = sectionField;
        $[10] = t3;
        $[11] = t6;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    return t7;
}
_c9 = Gallery;
function _GalleryAnonymous(image, index) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "gallery-item",
        style: {
            overflow: "hidden",
            borderRadius: "var(--radius)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImagePrimitive, {
            src: image.src,
            alt: image.alt,
            style: {
                transition: "transform 0.5s ease"
            }
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1005,
            columnNumber: 6
        }, this)
    }, `${image?.src ?? "image"}-${index}`, false, {
        fileName: "[project]/src/platform/SiteRenderer.tsx",
        lineNumber: 1002,
        columnNumber: 10
    }, this);
}
function FAQ(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, variant, sectionField, studioMode } = t0;
    const t1 = block.kicker ?? "FAQ";
    const t2 = block.title ?? "Frequently Asked Questions";
    let t3;
    if ($[1] !== t1 || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
            kicker: t1,
            title: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1028,
            columnNumber: 10
        }, this);
        $[1] = t1;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const t4 = `faq faq-${variant}`;
    let t5;
    if ($[4] !== block.items || $[5] !== blockIndex || $[6] !== studioMode) {
        let t6;
        if ($[8] !== blockIndex || $[9] !== studioMode) {
            t6 = ({
                "FAQ[(anonymous)()]": (faq, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        className: "faq-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${index}.question` : undefined,
                                children: faq.question
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 1041,
                                columnNumber: 117
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                editPath: studioMode ? `blocks.${blockIndex}.items.${index}.answer` : undefined,
                                children: faq.answer
                            }, void 0, false, {
                                fileName: "[project]/src/platform/SiteRenderer.tsx",
                                lineNumber: 1041,
                                columnNumber: 229
                            }, this)
                        ]
                    }, `${faq?.question ?? "faq"}-${index}`, true, {
                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                        lineNumber: 1041,
                        columnNumber: 47
                    }, this)
            })["FAQ[(anonymous)()]"];
            $[8] = blockIndex;
            $[9] = studioMode;
            $[10] = t6;
        } else {
            t6 = $[10];
        }
        t5 = safeArray(block.items).map(t6);
        $[4] = block.items;
        $[5] = blockIndex;
        $[6] = studioMode;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[11] !== t4 || $[12] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1059,
            columnNumber: 10
        }, this);
        $[11] = t4;
        $[12] = t5;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== sectionField || $[15] !== t3 || $[16] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block",
            sectionField: sectionField,
            children: [
                t3,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1068,
            columnNumber: 10
        }, this);
        $[14] = sectionField;
        $[15] = t3;
        $[16] = t6;
        $[17] = t7;
    } else {
        t7 = $[17];
    }
    return t7;
}
_c10 = FAQ;
function CTA(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(17);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 17; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant, block, blockIndex, variant, sectionField, studioMode } = t0;
    const t1 = `cta cta-${variant}`;
    const t2 = studioMode ? `blocks.${blockIndex}.title` : undefined;
    const t3 = block.title ?? "Ready to book?";
    let t4;
    if ($[1] !== t2 || $[2] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
            level: 2,
            editPath: t2,
            children: t3
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1099,
            columnNumber: 10
        }, this);
        $[1] = t2;
        $[2] = t3;
        $[3] = t4;
    } else {
        t4 = $[3];
    }
    const t5 = studioMode ? `blocks.${blockIndex}.body` : undefined;
    let t6;
    if ($[4] !== block.body || $[5] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
            editPath: t5,
            children: block.body
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1109,
            columnNumber: 10
        }, this);
        $[4] = block.body;
        $[5] = t5;
        $[6] = t6;
    } else {
        t6 = $[6];
    }
    let t7;
    if ($[7] !== t4 || $[8] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "cta-content",
            children: [
                t4,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1118,
            columnNumber: 10
        }, this);
        $[7] = t4;
        $[8] = t6;
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] !== tenant) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ButtonGroup, {
            tenant: tenant
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1127,
            columnNumber: 10
        }, this);
        $[10] = tenant;
        $[11] = t8;
    } else {
        t8 = $[11];
    }
    let t9;
    if ($[12] !== sectionField || $[13] !== t1 || $[14] !== t7 || $[15] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: t1,
            sectionField: sectionField,
            children: [
                t7,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1135,
            columnNumber: 10
        }, this);
        $[12] = sectionField;
        $[13] = t1;
        $[14] = t7;
        $[15] = t8;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    return t9;
}
_c11 = CTA;
function TextBlock(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, sectionField, studioMode } = t0;
    if (!block.heading && !block.body) {
        return null;
    }
    let t1;
    if ($[1] !== block.heading || $[2] !== blockIndex || $[3] !== studioMode) {
        t1 = block.heading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
            level: 2,
            editPath: studioMode ? `blocks.${blockIndex}.heading` : undefined,
            children: block.heading
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1165,
            columnNumber: 26
        }, this) : null;
        $[1] = block.heading;
        $[2] = blockIndex;
        $[3] = studioMode;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    let t2;
    if ($[5] !== block.body || $[6] !== blockIndex || $[7] !== studioMode) {
        t2 = block.body ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
            editPath: studioMode ? `blocks.${blockIndex}.body` : undefined,
            children: block.body
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1175,
            columnNumber: 23
        }, this) : null;
        $[5] = block.body;
        $[6] = blockIndex;
        $[7] = studioMode;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] !== sectionField || $[10] !== t1 || $[11] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
            className: "block text-block",
            sectionField: sectionField,
            children: [
                t1,
                t2
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1185,
            columnNumber: 10
        }, this);
        $[9] = sectionField;
        $[10] = t1;
        $[11] = t2;
        $[12] = t3;
    } else {
        t3 = $[12];
    }
    return t3;
}
_c12 = TextBlock;
function BlockTitle(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { kicker, title } = t0;
    let t1;
    if ($[1] !== kicker) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
            children: kicker
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1209,
            columnNumber: 10
        }, this);
        $[1] = kicker;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== title) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Heading, {
            level: 2,
            children: title
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1217,
            columnNumber: 10
        }, this);
        $[3] = title;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t1 || $[6] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "block-title",
            children: [
                t1,
                t2
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1225,
            columnNumber: 10
        }, this);
        $[5] = t1;
        $[6] = t2;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    return t3;
}
_c13 = BlockTitle;
function Section(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { className, children, sectionField } = t0;
    let t1;
    if ($[1] !== children || $[2] !== className || $[3] !== sectionField) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: className,
            "data-tina-field": sectionField,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1249,
            columnNumber: 10
        }, this);
        $[1] = children;
        $[2] = className;
        $[3] = sectionField;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    return t1;
}
_c14 = Section;
function Eyebrow(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { children, field, editPath } = t0;
    let t1;
    if ($[1] !== children || $[2] !== editPath || $[3] !== field) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "eyebrow",
            "data-tina-field": field,
            "data-edit-path": editPath,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1274,
            columnNumber: 10
        }, this);
        $[1] = children;
        $[2] = editPath;
        $[3] = field;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    return t1;
}
_c15 = Eyebrow;
function Heading(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(7);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 7; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { level, children, field, editPath } = t0;
    const Tag = level === 1 ? "h1" : "h2";
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            fontFamily: "var(--heading)"
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== Tag || $[3] !== children || $[4] !== editPath || $[5] !== field) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
            "data-tina-field": field,
            "data-edit-path": editPath,
            style: t1,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1310,
            columnNumber: 10
        }, this);
        $[2] = Tag;
        $[3] = children;
        $[4] = editPath;
        $[5] = field;
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    return t2;
}
_c16 = Heading;
function Text(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(6);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 6; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { children, field, editPath } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            fontFamily: "var(--body)"
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== children || $[3] !== editPath || $[4] !== field) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            "data-tina-field": field,
            "data-edit-path": editPath,
            style: t1,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1345,
            columnNumber: 10
        }, this);
        $[2] = children;
        $[3] = editPath;
        $[4] = field;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    return t2;
}
_c17 = Text;
function Card(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(7);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 7; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { children, className: t1, style: t2 } = t0;
    const className = t1 === undefined ? "" : t1;
    let t3;
    if ($[1] !== t2) {
        t3 = t2 === undefined ? {} : t2;
        $[1] = t2;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const style = t3;
    const t4 = `card ${className}`;
    let t5;
    if ($[3] !== children || $[4] !== style || $[5] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
            className: t4,
            style: style,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1381,
            columnNumber: 10
        }, this);
        $[3] = children;
        $[4] = style;
        $[5] = t4;
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    return t5;
}
_c18 = Card;
function ImagePrimitive(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { src, alt, className: t1, style: t2 } = t0;
    const className = t1 === undefined ? "" : t1;
    let t3;
    if ($[1] !== t2) {
        t3 = t2 === undefined ? {} : t2;
        $[1] = t2;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const style = t3;
    let t4;
    if ($[3] !== alt || $[4] !== className || $[5] !== src || $[6] !== style) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            className: className,
            src: src,
            alt: alt,
            loading: "lazy",
            style: style
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1417,
            columnNumber: 10
        }, this);
        $[3] = alt;
        $[4] = className;
        $[5] = src;
        $[6] = style;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    return t4;
}
_c19 = ImagePrimitive;
function ButtonGroup(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { tenant } = t0;
    let t1;
    if ($[1] !== tenant.business?.whatsapp) {
        t1 = tenant.business?.whatsapp?.replace(/\D/g, "") ?? "";
        $[1] = tenant.business?.whatsapp;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const whatsapp = t1;
    const phone = tenant.business?.phone ?? "";
    let t2;
    if ($[3] !== whatsapp) {
        t2 = whatsapp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            className: "btn primary",
            href: `https://wa.me/${whatsapp}`,
            children: "WhatsApp"
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1451,
            columnNumber: 22
        }, this);
        $[3] = whatsapp;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== phone) {
        t3 = phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            className: "btn secondary",
            href: `tel:${phone}`,
            children: "Call Us"
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1459,
            columnNumber: 19
        }, this);
        $[5] = phone;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t2 || $[8] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "button-row",
            children: [
                t2,
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1467,
            columnNumber: 10
        }, this);
        $[7] = t2;
        $[8] = t3;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    return t4;
}
_c20 = ButtonGroup;
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
function Testimonials(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(32);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 32; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, sectionField, studioMode } = t0;
    let T0;
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    if ($[1] !== block.items || $[2] !== block.kicker || $[3] !== block.title || $[4] !== blockIndex || $[5] !== sectionField || $[6] !== studioMode) {
        t7 = Symbol.for("react.early_return_sentinel");
        bb0: {
            const testimonials = safeArray(block.items);
            if (testimonials.length === 0) {
                t7 = null;
                break bb0;
            }
            T0 = Section;
            t4 = "block testimonials-section";
            t5 = sectionField;
            const t8 = block.kicker ?? "Testimonials";
            const t9 = block.title ?? "What our patients say";
            if ($[15] !== t8 || $[16] !== t9) {
                t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                    kicker: t8,
                    title: t9
                }, void 0, false, {
                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                    lineNumber: 1525,
                    columnNumber: 14
                }, this);
                $[15] = t8;
                $[16] = t9;
                $[17] = t6;
            } else {
                t6 = $[17];
            }
            t1 = "testimonials-grid";
            if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
                t2 = {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px"
                };
                $[18] = t2;
            } else {
                t2 = $[18];
            }
            let t10;
            if ($[19] !== blockIndex || $[20] !== studioMode) {
                t10 = ({
                    "Testimonials[testimonials.map()]": (t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                            className: "testimonial-card",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Text, {
                                    editPath: studioMode ? `blocks.${blockIndex}.items.${i}.quote` : undefined,
                                    children: [
                                        '"',
                                        t.quote,
                                        '"'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                                    lineNumber: 1546,
                                    columnNumber: 100
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: "16px",
                                        fontWeight: "bold"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.author` : undefined,
                                        children: [
                                            "- ",
                                            t.author || "Patient"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/platform/SiteRenderer.tsx",
                                        lineNumber: 1549,
                                        columnNumber: 16
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                                    lineNumber: 1546,
                                    columnNumber: 200
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/platform/SiteRenderer.tsx",
                            lineNumber: 1546,
                            columnNumber: 57
                        }, this)
                })["Testimonials[testimonials.map()]"];
                $[19] = blockIndex;
                $[20] = studioMode;
                $[21] = t10;
            } else {
                t10 = $[21];
            }
            t3 = testimonials.map(t10);
        }
        $[1] = block.items;
        $[2] = block.kicker;
        $[3] = block.title;
        $[4] = blockIndex;
        $[5] = sectionField;
        $[6] = studioMode;
        $[7] = T0;
        $[8] = t1;
        $[9] = t2;
        $[10] = t3;
        $[11] = t4;
        $[12] = t5;
        $[13] = t6;
        $[14] = t7;
    } else {
        T0 = $[7];
        t1 = $[8];
        t2 = $[9];
        t3 = $[10];
        t4 = $[11];
        t5 = $[12];
        t6 = $[13];
        t7 = $[14];
    }
    if (t7 !== Symbol.for("react.early_return_sentinel")) {
        return t7;
    }
    let t8;
    if ($[22] !== t1 || $[23] !== t2 || $[24] !== t3) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            style: t2,
            children: t3
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1588,
            columnNumber: 10
        }, this);
        $[22] = t1;
        $[23] = t2;
        $[24] = t3;
        $[25] = t8;
    } else {
        t8 = $[25];
    }
    let t9;
    if ($[26] !== T0 || $[27] !== t4 || $[28] !== t5 || $[29] !== t6 || $[30] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            className: t4,
            sectionField: t5,
            children: [
                t6,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1598,
            columnNumber: 10
        }, this);
        $[26] = T0;
        $[27] = t4;
        $[28] = t5;
        $[29] = t6;
        $[30] = t8;
        $[31] = t9;
    } else {
        t9 = $[31];
    }
    return t9;
}
_c21 = Testimonials;
function Stats(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(26);
    if ($[0] !== "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229") {
        for(let $i = 0; $i < 26; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0a724767e2c64192849483e11b0dbad27d752456082adbd859893effcba07229";
    }
    const { block, blockIndex, sectionField, studioMode } = t0;
    let T0;
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    if ($[1] !== block.items || $[2] !== blockIndex || $[3] !== sectionField || $[4] !== studioMode) {
        t6 = Symbol.for("react.early_return_sentinel");
        bb0: {
            const stats = safeArray(block.items);
            if (stats.length === 0) {
                t6 = null;
                break bb0;
            }
            T0 = Section;
            t3 = "block stats-section";
            t4 = sectionField;
            if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
                t5 = {
                    background: "var(--primary)",
                    color: "white",
                    borderRadius: "var(--radius)"
                };
                t1 = {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    gap: "24px",
                    textAlign: "center"
                };
                $[12] = t1;
                $[13] = t5;
            } else {
                t1 = $[12];
                t5 = $[13];
            }
            let t7;
            if ($[14] !== blockIndex || $[15] !== studioMode) {
                t7 = ({
                    "Stats[stats.map()]": (s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "stat-item",
                            style: {
                                flex: "1 1 200px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: "3rem",
                                        fontWeight: 800,
                                        marginBottom: "8px"
                                    },
                                    "data-edit-path": studioMode ? `blocks.${blockIndex}.items.${i}.value` : undefined,
                                    children: s.value
                                }, void 0, false, {
                                    fileName: "[project]/src/platform/SiteRenderer.tsx",
                                    lineNumber: 1666,
                                    columnNumber: 14
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    lineNumber: 1670,
                                    columnNumber: 113
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/platform/SiteRenderer.tsx",
                            lineNumber: 1664,
                            columnNumber: 43
                        }, this)
                })["Stats[stats.map()]"];
                $[14] = blockIndex;
                $[15] = studioMode;
                $[16] = t7;
            } else {
                t7 = $[16];
            }
            t2 = stats.map(t7);
        }
        $[1] = block.items;
        $[2] = blockIndex;
        $[3] = sectionField;
        $[4] = studioMode;
        $[5] = T0;
        $[6] = t1;
        $[7] = t2;
        $[8] = t3;
        $[9] = t4;
        $[10] = t5;
        $[11] = t6;
    } else {
        T0 = $[5];
        t1 = $[6];
        t2 = $[7];
        t3 = $[8];
        t4 = $[9];
        t5 = $[10];
        t6 = $[11];
    }
    if (t6 !== Symbol.for("react.early_return_sentinel")) {
        return t6;
    }
    let t7;
    if ($[17] !== t1 || $[18] !== t2) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t1,
            children: t2
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1710,
            columnNumber: 10
        }, this);
        $[17] = t1;
        $[18] = t2;
        $[19] = t7;
    } else {
        t7 = $[19];
    }
    let t8;
    if ($[20] !== T0 || $[21] !== t3 || $[22] !== t4 || $[23] !== t5 || $[24] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            className: t3,
            sectionField: t4,
            style: t5,
            children: t7
        }, void 0, false, {
            fileName: "[project]/src/platform/SiteRenderer.tsx",
            lineNumber: 1719,
            columnNumber: 10
        }, this);
        $[20] = T0;
        $[21] = t3;
        $[22] = t4;
        $[23] = t5;
        $[24] = t7;
        $[25] = t8;
    } else {
        t8 = $[25];
    }
    return t8;
}
_c22 = Stats;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19, _c20, _c21, _c22;
__turbopack_context__.k.register(_c, "SiteRenderer");
__turbopack_context__.k.register(_c1, "Header");
__turbopack_context__.k.register(_c2, "Awards");
__turbopack_context__.k.register(_c3, "PreviewHeader");
__turbopack_context__.k.register(_c4, "SubscriptionBar");
__turbopack_context__.k.register(_c5, "Hero");
__turbopack_context__.k.register(_c6, "Profile");
__turbopack_context__.k.register(_c7, "Services");
__turbopack_context__.k.register(_c8, "Timings");
__turbopack_context__.k.register(_c9, "Gallery");
__turbopack_context__.k.register(_c10, "FAQ");
__turbopack_context__.k.register(_c11, "CTA");
__turbopack_context__.k.register(_c12, "TextBlock");
__turbopack_context__.k.register(_c13, "BlockTitle");
__turbopack_context__.k.register(_c14, "Section");
__turbopack_context__.k.register(_c15, "Eyebrow");
__turbopack_context__.k.register(_c16, "Heading");
__turbopack_context__.k.register(_c17, "Text");
__turbopack_context__.k.register(_c18, "Card");
__turbopack_context__.k.register(_c19, "ImagePrimitive");
__turbopack_context__.k.register(_c20, "ButtonGroup");
__turbopack_context__.k.register(_c21, "Testimonials");
__turbopack_context__.k.register(_c22, "Stats");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/site/[tenantId]/LivePreviewClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LivePreviewClient",
    ()=>LivePreviewClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$SiteRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/platform/SiteRenderer.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function LivePreviewClient({ initialTenant }) {
    _s();
    const [tenant, setTenant] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTenant);
    const [uiEditingEnabled, setUiEditingEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const undoStack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([])[0];
    const redoStack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([])[0];
    const inlineOverlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({})[0];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePreviewClient.useEffect": ()=>{
            setTenant(initialTenant);
        }
    }["LivePreviewClient.useEffect"], [
        initialTenant
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePreviewClient.useEffect": ()=>{
            const params = new URLSearchParams(window.location.search);
            setUiEditingEnabled(params.get("ui") === "1");
        }
    }["LivePreviewClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePreviewClient.useEffect": ()=>{
            const onMessage = {
                "LivePreviewClient.useEffect.onMessage": (event)=>{
                    const data = event.data;
                    if (!data || data.type !== "studio:draft-update") return;
                    // Merge incoming left-panel draft BUT keep any inline edits authoritative
                    // until they are explicitly changed/cleared.
                    setTenant({
                        "LivePreviewClient.useEffect.onMessage": (previous)=>{
                            const merged = deepMerge(previous, data.payload);
                            // Flatten settings array to root on the fly for the renderer
                            const urlSettings = Array.isArray(merged.settings) ? merged.settings.find({
                                "LivePreviewClient.useEffect.onMessage": (s)=>s._template === "urlSettings"
                            }["LivePreviewClient.useEffect.onMessage"]) : undefined;
                            const presentation = Array.isArray(merged.settings) ? merged.settings.find({
                                "LivePreviewClient.useEffect.onMessage": (s_0)=>s_0._template === "presentation"
                            }["LivePreviewClient.useEffect.onMessage"]) : undefined;
                            const seo = Array.isArray(merged.settings) ? merged.settings.find({
                                "LivePreviewClient.useEffect.onMessage": (s_1)=>s_1._template === "seo"
                            }["LivePreviewClient.useEffect.onMessage"]) : undefined;
                            if (urlSettings) {
                                merged.slug = urlSettings.slug ?? merged.slug;
                                merged.title = urlSettings.title ?? merged.title;
                                merged.path = urlSettings.path ?? merged.path;
                                merged.isHome = urlSettings.isHome ?? merged.isHome;
                            }
                            if (presentation) {
                                merged.presentation = presentation;
                            }
                            if (seo) {
                                merged.seo = seo;
                            }
                            const withInline = applyOverlay(merged, inlineOverlay);
                            return withInline;
                        }
                    }["LivePreviewClient.useEffect.onMessage"]);
                }
            }["LivePreviewClient.useEffect.onMessage"];
            window.addEventListener("message", onMessage);
            return ({
                "LivePreviewClient.useEffect": ()=>window.removeEventListener("message", onMessage)
            })["LivePreviewClient.useEffect"];
        }
    }["LivePreviewClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePreviewClient.useEffect": ()=>{
            if (!uiEditingEnabled) return;
            const root = document.querySelector(".tenant-site");
            if (!root) return;
            const onClick = {
                "LivePreviewClient.useEffect.onClick": (event_0)=>{
                    const target = event_0.target;
                    const node = target?.closest("[data-edit-path]");
                    const path = node?.dataset?.editPath;
                    if (!node || !path) return;
                    event_0.preventDefault();
                    event_0.stopPropagation();
                    enableInlineEditing(node, path);
                }
            }["LivePreviewClient.useEffect.onClick"];
            root.addEventListener("click", onClick, true);
            return ({
                "LivePreviewClient.useEffect": ()=>root.removeEventListener("click", onClick, true)
            })["LivePreviewClient.useEffect"];
        }
    }["LivePreviewClient.useEffect"], [
        tenant,
        uiEditingEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePreviewClient.useEffect": ()=>{
            if (!uiEditingEnabled) return;
            const onKeyDown = {
                "LivePreviewClient.useEffect.onKeyDown": (event_1)=>{
                    const metaOrCtrl = event_1.metaKey || event_1.ctrlKey;
                    if (!metaOrCtrl) return;
                    const key = event_1.key.toLowerCase();
                    const isUndo = key === "z" && !event_1.shiftKey;
                    const isRedo = key === "y" && !event_1.shiftKey || key === "z" && event_1.shiftKey;
                    if (!isUndo && !isRedo) return;
                    // Only handle when focus is on body/contenteditable (avoid fighting Tina editor).
                    const active = document.activeElement;
                    const activeTag = active?.tagName?.toLowerCase();
                    const isTypingInInput = activeTag === "input" || activeTag === "textarea" || activeTag === "select" || active?.isContentEditable;
                    if (!isTypingInInput) {
                        event_1.preventDefault();
                        event_1.stopPropagation();
                    }
                    if (isUndo) {
                        const op = undoStack.pop();
                        if (!op) return;
                        redoStack.push(op);
                        applyOperation(op.path, op.before);
                        return;
                    }
                    const op_0 = redoStack.pop();
                    if (!op_0) return;
                    undoStack.push(op_0);
                    applyOperation(op_0.path, op_0.after);
                }
            }["LivePreviewClient.useEffect.onKeyDown"];
            window.addEventListener("keydown", onKeyDown, true);
            return ({
                "LivePreviewClient.useEffect": ()=>window.removeEventListener("keydown", onKeyDown, true)
            })["LivePreviewClient.useEffect"];
        }
    }["LivePreviewClient.useEffect"], [
        uiEditingEnabled,
        undoStack,
        redoStack
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$platform$2f$SiteRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SiteRenderer"], {
        tenant: tenant,
        studioMode: uiEditingEnabled
    }, void 0, false, {
        fileName: "[project]/src/app/site/[tenantId]/LivePreviewClient.tsx",
        lineNumber: 125,
        columnNumber: 10
    }, this);
    //TURBOPACK unreachable
    ;
    function enableInlineEditing(node_0, path_0) {
        if (node_0.isContentEditable) return;
        const previous_0 = node_0.textContent ?? "";
        node_0.setAttribute("contenteditable", "true");
        node_0.focus();
        const range = document.createRange();
        range.selectNodeContents(node_0);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        const commit = (cancel = false)=>{
            node_0.removeAttribute("contenteditable");
            node_0.removeEventListener("blur", onBlur);
            node_0.removeEventListener("keydown", onKeyDown_0);
            if (cancel) {
                node_0.textContent = previous_0;
                return;
            }
            const value = (node_0.textContent ?? "").trim();
            const patch = buildPathPatch(path_0, value);
            setTenant((previousTenant)=>deepMerge(previousTenant, patch));
            inlineOverlay[path_0] = value;
            undoStack.push({
                path: path_0,
                before: previous_0.trim(),
                after: value
            });
            redoStack.length = 0;
            const message = {
                type: "studio:inline-edit",
                path: path_0,
                value
            };
            window.parent.postMessage(message, window.location.origin);
        };
        const onBlur = ()=>commit(false);
        const onKeyDown_0 = (event_2)=>{
            if (event_2.key === "Enter") {
                event_2.preventDefault();
                node_0.blur();
            }
            if (event_2.key === "Escape") {
                event_2.preventDefault();
                commit(true);
            }
        };
        node_0.addEventListener("blur", onBlur);
        node_0.addEventListener("keydown", onKeyDown_0);
    }
    function applyOperation(path_1, value_0) {
        const patch_0 = buildPathPatch(path_1, value_0);
        setTenant((previousTenant_0)=>deepMerge(previousTenant_0, patch_0));
        inlineOverlay[path_1] = value_0;
        const message_0 = {
            type: "studio:inline-edit",
            path: path_1,
            value: value_0
        };
        window.parent.postMessage(message_0, window.location.origin);
    }
}
_s(LivePreviewClient, "aZ+tT78trPBNyhRfmo7eVOSK/Zk=");
_c = LivePreviewClient;
function deepMerge(base, patch) {
    if (patch === null || patch === undefined) return base;
    if (Array.isArray(base) && Array.isArray(patch)) return mergeArrays(base, patch);
    if (typeof base !== "object" || base === null || typeof patch !== "object" || patch === null) {
        return patch;
    }
    const output = {
        ...base
    };
    for (const [key, value] of Object.entries(patch)){
        const current = output[key];
        output[key] = deepMerge(current, value);
    }
    return output;
}
function mergeArrays(base, patch) {
    const maxLength = Math.max(base.length, patch.length);
    const out = new Array(maxLength);
    for(let i = 0; i < maxLength; i += 1){
        if (patch[i] === undefined) {
            out[i] = base[i];
        } else if (base[i] === undefined) {
            out[i] = patch[i];
        } else {
            out[i] = deepMerge(base[i], patch[i]);
        }
    }
    return out;
}
function buildPathPatch(path, value) {
    const root = {};
    const segments = path.split(".").filter(Boolean);
    let cursor = root;
    for(let index = 0; index < segments.length - 1; index += 1){
        const segment = segments[index];
        const next = segments[index + 1];
        const nextIsIndex = /^\d+$/.test(next);
        const isIndex = /^\d+$/.test(segment);
        if (isIndex && Array.isArray(cursor)) {
            const numericIndex = Number(segment);
            if (cursor[numericIndex] === undefined) {
                cursor[numericIndex] = nextIsIndex ? [] : {};
            }
            cursor = cursor[numericIndex];
            continue;
        }
        if (!Array.isArray(cursor)) {
            const record = cursor;
            if (record[segment] === undefined) {
                record[segment] = nextIsIndex ? [] : {};
            }
            cursor = record[segment];
        }
    }
    const last = segments[segments.length - 1];
    if (Array.isArray(cursor) && /^\d+$/.test(last)) {
        cursor[Number(last)] = value;
    } else if (!Array.isArray(cursor)) {
        cursor[last] = value;
    }
    return root;
}
function applyOverlay(base, overlay) {
    let out = base;
    for (const [path, value] of Object.entries(overlay)){
        out = deepMerge(out, buildPathPatch(path, value));
    }
    return out;
}
var _c;
__turbopack_context__.k.register(_c, "LivePreviewClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0.lasne._.js.map