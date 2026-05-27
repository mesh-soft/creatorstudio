import type { FieldDefinition } from "../shared/types";

export const timingsFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown", fieldType: "sectionTitle" },
  {
    name: "items",
    label: "Timings",
    type: "list",
    itemFields: [
      { k: "day",       l: "Day",       ft: "timingDay" },
      { k: "primary",   l: "Primary",   ft: "timingSlot" },
      { k: "secondary", l: "Secondary", ft: "timingSlot" },
    ],
  },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",        l: "Default" },
      { v: "compact", l: "Compact" },
      { v: "cards",   l: "Cards" },
      { v: "split",   l: "Split" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
