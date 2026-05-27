import type { FieldDefinition } from "../shared/types";

export const locationFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker",             type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",              type: "markdown", fieldType: "sectionTitle" },
  { name: "mapUrl", label: "Map URL or lat,lng", type: "url",
    placeholder: "https://maps.google.com/... or 12.9716,77.5946" },
  { name: "height", label: "Height (px)",        type: "number",  placeholder: "400" },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",           l: "Default" },
      { v: "full-width", l: "Full Width" },
      { v: "compact",    l: "Compact" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
