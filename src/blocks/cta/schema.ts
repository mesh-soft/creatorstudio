import type { FieldDefinition } from "../shared/types";

export const ctaFields: FieldDefinition[] = [
  { name: "title",   label: "Title",   type: "markdown", fieldType: "cta" },
  { name: "body",    label: "Body",    type: "markdown", fieldType: "subheadline", rows: 2 },
  { name: "buttons", label: "Buttons", type: "buttons" },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",         l: "Default" },
      { v: "minimal",  l: "Minimal" },
      { v: "bold",     l: "Bold" },
      { v: "centered", l: "Centered" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
