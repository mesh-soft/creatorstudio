import type { FieldDefinition } from "../shared/types";

export const faqFields: FieldDefinition[] = [
  { name: "kicker", label: "Kicker", type: "text",    fieldType: "kicker" },
  { name: "title",  label: "Title",  type: "markdown", fieldType: "sectionTitle" },
  {
    name: "items",
    label: "FAQs",
    type: "list",
    itemFields: [
      { k: "question", l: "Question", ft: "faqQuestion" },
      { k: "answer",   l: "Answer",   type: "markdown", ft: "faqAnswer" },
    ],
  },
  { name: "backgroundImage", label: "Background Image", type: "image",  group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",          l: "Default" },
      { v: "accordion", l: "Accordion" },
      { v: "minimal",   l: "Minimal" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
