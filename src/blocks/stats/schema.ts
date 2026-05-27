import type { FieldDefinition } from "../shared/types";

export const statsFields: FieldDefinition[] = [
  {
    name: "items",
    label: "Stats",
    type: "list",
    itemFields: [
      { k: "value", l: "Value", ft: "statValue" },
      { k: "label", l: "Label", ft: "statLabel" },
    ],
  },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",           l: "Default" },
      { v: "horizontal", l: "Horizontal" },
      { v: "compact",    l: "Compact" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
