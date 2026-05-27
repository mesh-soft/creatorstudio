import type { FieldDefinition } from "../shared/types";

export const galleryFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown", fieldType: "sectionTitle" },
  {
    name: "items",
    label: "Images",
    type: "list",
    itemFields: [
      { k: "src", l: "Image",    type: "image" },
      { k: "alt", l: "Alt Text" },
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
      { v: "masonry",  l: "Masonry" },
      { v: "carousel", l: "Carousel" },
      { v: "wide",     l: "Wide" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
