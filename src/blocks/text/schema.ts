import type { FieldDefinition } from "../shared/types";

export const textFields: FieldDefinition[] = [
  { name: "heading", label: "Heading", type: "markdown", fieldType: "sectionTitle" },
  { name: "body",    label: "Body",    type: "markdown", fieldType: "bio", rows: 3 },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",         l: "Default" },
      { v: "centered", l: "Centered" },
      { v: "narrow",   l: "Narrow" },
      { v: "wide",     l: "Wide" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
