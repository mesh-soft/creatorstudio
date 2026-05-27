import type { FieldDefinition } from "../shared/types";

export const servicesFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",     fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown",  fieldType: "sectionTitle" },
  {
    name: "items",
    label: "Services",
    type: "list",
    itemFields: [
      { k: "title",       l: "Title",       ft: "serviceTitle" },
      { k: "description", l: "Description", type: "markdown", ft: "serviceDescription" },
      { k: "icon",        l: "Icon",        type: "icon" },
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
      { v: "grid",    l: "Grid" },
      { v: "list",    l: "List" },
      { v: "cards",   l: "Cards" },
      { v: "compact", l: "Compact" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
