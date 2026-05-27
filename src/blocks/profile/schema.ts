import type { FieldDefinition } from "../shared/types";

export const profileFields: FieldDefinition[] = [
  { name: "kicker",             label: "Kicker",               type: "text",     fieldType: "kicker" },
  { name: "title",              label: "Display Name",         type: "markdown",  fieldType: "sectionTitle" },
  { name: "body",               label: "Bio",                  type: "markdown",  fieldType: "bio", rows: 3 },
  { name: "experienceYears",    label: "Experience (yrs)",     type: "number" },
  { name: "experienceLabel",    label: "Experience Label",     type: "text" },
  { name: "registrationNumber", label: "Registration #",       type: "text" },
  { name: "registrationLabel",  label: "Registration Label",   type: "text" },
  { name: "backgroundImage",    label: "Background Image",     type: "image",    group: "presentation" },
  {
    name: "variant",
    label: "Layout Variant",
    type: "select",
    group: "presentation",
    options: [
      { v: "",          l: "Default" },
      { v: "editorial", l: "Editorial" },
      { v: "centered",  l: "Centered" },
      { v: "compact",   l: "Compact" },
      { v: "split",     l: "Split" },
    ],
  },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
