import type { FieldDefinition } from "../shared/types";

export const awardsFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown", fieldType: "sectionTitle" },
  {
    name: "items",
    label: "Awards",
    type: "list",
    itemFields: [
      { k: "title",        l: "Name",  ft: "awardTitle" },
      { k: "year",         l: "Year" },
      { k: "organization", l: "Org",   ft: "awardOrg" },
      { k: "icon",         l: "Icon",  type: "icon" },
    ],
  },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",         l: "Default" },
      { v: "timeline", l: "Timeline" },
      { v: "cards",    l: "Cards" },
      { v: "compact",  l: "Compact" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
