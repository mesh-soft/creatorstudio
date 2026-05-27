import type { FieldDefinition } from "../shared/types";

export const testimonialsFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown", fieldType: "sectionTitle" },
  {
    name: "items",
    label: "Testimonials",
    type: "list",
    itemFields: [
      { k: "quote",  l: "Quote",  type: "markdown", ft: "testimonialQuote" },
      { k: "author", l: "Author", ft: "testimonialAuthor" },
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
      { v: "grid",     l: "Grid" },
      { v: "carousel", l: "Carousel" },
      { v: "minimal",  l: "Minimal" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
