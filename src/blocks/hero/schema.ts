import type { FieldDefinition } from "../shared/types";

export const heroFields: FieldDefinition[] = [
  // ── Content tab ─────────────────────────────────────────────────────────
  {
    name: "headline",
    label: "Headline",
    type: "markdown",
    fieldType: "headline",
    placeholder: "Your name or clinic headline",
  },
  {
    name: "subheadline",
    label: "Subheadline",
    type: "markdown",
    fieldType: "subheadline",
    rows: 2,
    placeholder: "A short description of your practice",
  },
  {
    name: "photo",
    label: "Hero Photo",
    type: "image",
  },
  {
    name: "buttons",
    label: "Buttons",
    type: "buttons",
  },

  // ── Presentation tab ─────────────────────────────────────────────────────
  {
    name: "backgroundImage",
    label: "Background Image",
    type: "image",
    group: "presentation",
  },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",          l: "Default" },
      { v: "compact",   l: "Compact" },
      { v: "editorial", l: "Editorial" },
      { v: "centered",  l: "Centered" },
      { v: "split",     l: "Split" },
    ],
  },
  {
    name: "css",
    label: "CSS Overrides",
    type: "css",
    group: "presentation",
  },
];
