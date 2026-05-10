import { defineConfig } from "tinacms";
import type { TinaField } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const tenantFields: TinaField[] = [
  { type: "string", name: "tenantId", label: "Tenant ID", required: true },
  {
    type: "string",
    name: "tenantType",
    label: "Tenant Type",
    options: ["doctor", "hospital"],
    required: true,
  },
  {
    type: "string",
    name: "status",
    label: "Status",
    options: ["active", "trial", "past_due", "grace", "suspended", "cancelled", "archived"],
  },
  {
    type: "object",
    name: "subscription",
    label: "Subscription",
    fields: [
      { type: "string", name: "plan", label: "Plan" },
      { type: "string", name: "billingCycle", label: "Billing Cycle", options: ["monthly", "yearly"] },
      { type: "string", name: "validFrom", label: "Valid From (YYYY-MM-DD)" },
      { type: "string", name: "validUntil", label: "Valid Until (YYYY-MM-DD)" },
      { type: "string", name: "graceUntil", label: "Grace Until (YYYY-MM-DD)" },
      { type: "string", name: "paymentStatus", label: "Payment Status" },
    ],
  },
  {
    type: "object",
    name: "domains",
    label: "Domains",
    fields: [
      { type: "string", name: "primary", label: "Primary Domain" },
      { type: "string", name: "aliases", label: "Aliases", list: true },
    ],
  },
  {
    type: "object",
    name: "profile",
    label: "Profile",
    fields: [
      { type: "string", name: "displayName", label: "Display Name", required: true },
      { type: "string", name: "specialty", label: "Specialty" },
      { type: "string", name: "degrees", label: "Degrees / Badges", list: true },
      { type: "string", name: "registrationNumber", label: "Registration Number" },
      { type: "number", name: "experienceYears", label: "Experience Years" },
      { type: "string", name: "bio", label: "Bio", ui: { component: "textarea" } },
      { type: "string", name: "photo", label: "Photo URL" },
    ],
  },
  {
    type: "object",
    name: "business",
    label: "Business",
    fields: [
      { type: "string", name: "clinicName", label: "Clinic / Hospital Name" },
      { type: "string", name: "phone", label: "Phone" },
      { type: "string", name: "whatsapp", label: "WhatsApp" },
      { type: "string", name: "email", label: "Email" },
      { type: "string", name: "address", label: "Address", ui: { component: "textarea" } },
      { type: "string", name: "mapUrl", label: "Map URL" },
    ],
  },
  {
    type: "object",
    name: "presentation",
    label: "Presentation",
    fields: [
      {
        type: "string",
        name: "themeId",
        label: "Theme Layout",
        options: [
          "doctor-standard",
          "doctor-profile-heavy",
          "doctor-service-heavy",
          "hospital-standard",
          "hospital-emergency-first",
          "hospital-departments",
        ],
      },
      {
        type: "string",
        name: "variantPresetId",
        label: "Variant Preset",
        options: [
          "doctor-classic",
          "doctor-editorial",
          "doctor-compact",
          "doctor-premium",
          "doctor-specialist",
          "hospital-standard",
          "hospital-emergency",
          "hospital-specialty",
          "hospital-community",
          "hospital-network",
        ],
      },
      {
        type: "string",
        name: "styleId",
        label: "Style Preset",
        options: [
          "doctor-teal-clean",
          "doctor-premium-warm",
          "doctor-bright-child",
          "doctor-derma-minimal",
          "doctor-slate-precision",
          "hospital-blue-modern",
          "hospital-green-trust",
          "hospital-red-emergency",
          "hospital-indigo-specialty",
          "hospital-community-soft",
        ],
      },
      {
        type: "object",
        name: "style",
        label: "Style Overrides",
        fields: [
          {
            type: "object",
            name: "colors",
            label: "Colors",
            fields: [
              { type: "string", name: "primary", label: "Primary" },
              { type: "string", name: "secondary", label: "Secondary" },
              { type: "string", name: "accent", label: "Accent" },
              { type: "string", name: "background", label: "Background" },
              { type: "string", name: "surface", label: "Surface" },
              { type: "string", name: "text", label: "Text" },
            ],
          },
          {
            type: "object",
            name: "shape",
            label: "Shape",
            fields: [{ type: "string", name: "radius", label: "Radius" }],
          },
          {
            type: "object",
            name: "typography",
            label: "Typography",
            fields: [
              { type: "string", name: "heading", label: "Heading Font" },
              { type: "string", name: "body", label: "Body Font" },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "seo",
    label: "SEO",
    fields: [
      { type: "string", name: "title", label: "Title" },
      { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
      { type: "string", name: "keywords", label: "Keywords", list: true },
      { type: "string", name: "ogImage", label: "Open Graph Image" },
    ],
  },
  {
    type: "object",
    name: "content",
    label: "Content",
    fields: [
      { type: "string", name: "headline", label: "Headline" },
      { type: "string", name: "subheadline", label: "Subheadline", ui: { component: "textarea" } },
      {
        type: "object",
        name: "copy",
        label: "Editable Labels",
        fields: [
          { type: "string", name: "servicesKicker", label: "Services Kicker" },
          { type: "string", name: "servicesTitle", label: "Services Title" },
          { type: "string", name: "timingsKicker", label: "Timings Kicker" },
          { type: "string", name: "timingsTitle", label: "Timings Title" },
          { type: "string", name: "galleryKicker", label: "Gallery Kicker" },
          { type: "string", name: "galleryTitle", label: "Gallery Title" },
          { type: "string", name: "faqKicker", label: "FAQ Kicker" },
          { type: "string", name: "faqTitle", label: "FAQ Title" },
          { type: "string", name: "ctaTitle", label: "CTA Title" },
          { type: "string", name: "ctaBody", label: "CTA Body" },
          { type: "string", name: "whatsappLabel", label: "WhatsApp Label" },
          { type: "string", name: "callLabel", label: "Call Label" },
        ],
      },
      {
        type: "object",
        name: "services",
        label: "Services",
        list: true,
        fields: [
          { type: "string", name: "title", label: "Title" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "icon", label: "Icon" },
        ],
      },
      {
        type: "object",
        name: "timings",
        label: "Timings",
        list: true,
        fields: [
          { type: "string", name: "day", label: "Day / Unit" },
          { type: "string", name: "primary", label: "Primary Slot" },
          { type: "string", name: "secondary", label: "Secondary Slot" },
        ],
      },
      {
        type: "object",
        name: "gallery",
        label: "Gallery",
        list: true,
        fields: [
          { type: "string", name: "src", label: "Image URL" },
          { type: "string", name: "alt", label: "Alt Text" },
        ],
      },
      {
        type: "object",
        name: "faqs",
        label: "FAQs",
        list: true,
        fields: [
          { type: "string", name: "question", label: "Question" },
          { type: "string", name: "answer", label: "Answer", ui: { component: "textarea" } },
        ],
      },
      {
        type: "object",
        name: "testimonials",
        label: "Testimonials",
        list: true,
        fields: [
          { type: "string", name: "quote", label: "Quote", ui: { component: "textarea" } },
          { type: "string", name: "author", label: "Author" },
        ],
      },
      {
        type: "object",
        name: "stats",
        label: "Stats",
        list: true,
        fields: [
          { type: "string", name: "value", label: "Value" },
          { type: "string", name: "label", label: "Label" },
        ],
      },
      {
        type: "object",
        name: "blocks",
        label: "Page Blocks",
        description: "Reorder, hide, or add sections based on base platform components.",
        list: true,
        templates: [
          {
            name: "hero",
            label: "Hero",
            fields: [{ type: "boolean", name: "enabled", label: "Enabled" }],
          },
          {
            name: "profile",
            label: "Profile",
            fields: [{ type: "boolean", name: "enabled", label: "Enabled" }],
          },
          {
            name: "services",
            label: "Services",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "kicker", label: "Kicker Override" },
              { type: "string", name: "title", label: "Title Override" },
            ],
          },
          {
            name: "timings",
            label: "Timings",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "kicker", label: "Kicker Override" },
              { type: "string", name: "title", label: "Title Override" },
            ],
          },
          {
            name: "gallery",
            label: "Gallery",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "kicker", label: "Kicker Override" },
              { type: "string", name: "title", label: "Title Override" },
            ],
          },
          {
            name: "faq",
            label: "FAQ",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "kicker", label: "Kicker Override" },
              { type: "string", name: "title", label: "Title Override" },
            ],
          },
          {
            name: "cta",
            label: "CTA",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "title", label: "Title Override" },
              { type: "string", name: "body", label: "Body Override", ui: { component: "textarea" } },
            ],
          },
          {
            name: "text",
            label: "Custom Text Block",
            fields: [
              { type: "boolean", name: "enabled", label: "Enabled" },
              { type: "string", name: "heading", label: "Heading" },
              { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
];

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "doctor",
        label: "Doctors",
        path: "content/doctors",
        format: "json",
        fields: tenantFields,
        defaultItem: () => ({
          tenantType: "doctor",
          status: "trial",
          presentation: {
            themeId: "doctor-standard",
            variantPresetId: "doctor-classic",
            styleId: "doctor-teal-clean",
          },
          content: {
            blocks: [
              { _template: "hero", enabled: true },
              { _template: "profile", enabled: true },
              { _template: "services", enabled: true },
              { _template: "timings", enabled: true },
              { _template: "gallery", enabled: true },
              { _template: "faq", enabled: true },
              { _template: "cta", enabled: true },
            ],
          },
        }),
        ui: {
          router: ({ document }) => {
            const slug = document?._sys?.basename?.replace(/\.json$/i, "") || document?._sys?.filename;
            return `/site/${slug}`;
          },
          filename: {
            slugify: (values) => {
              const displayName = values?.profile?.displayName || values?.tenantId || "new-doctor";
              return String(displayName)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            },
          },
        },
      },
      {
        name: "hospital",
        label: "Hospitals",
        path: "content/hospitals",
        format: "json",
        fields: tenantFields,
        defaultItem: () => ({
          tenantType: "hospital",
          status: "trial",
          presentation: {
            themeId: "hospital-standard",
            variantPresetId: "hospital-standard",
            styleId: "hospital-blue-modern",
          },
          content: {
            blocks: [
              { _template: "hero", enabled: true },
              { _template: "profile", enabled: true },
              { _template: "services", enabled: true },
              { _template: "timings", enabled: true },
              { _template: "gallery", enabled: true },
              { _template: "faq", enabled: true },
              { _template: "cta", enabled: true },
            ],
          },
        }),
        ui: {
          router: ({ document }) => {
            const slug = document?._sys?.basename?.replace(/\.json$/i, "") || document?._sys?.filename;
            return `/site/${slug}`;
          },
          filename: {
            slugify: (values) => {
              const displayName = values?.profile?.displayName || values?.tenantId || "new-hospital";
              return String(displayName)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            },
          },
        },
      },
    ],
  },
});
