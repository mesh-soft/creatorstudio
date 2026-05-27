import type { FieldDefinition } from "../shared/types";

export const footerFields: FieldDefinition[] = [
  // Business info group — conditional
  { name: "showBusinessInfo", label: "Show Business Info", type: "boolean" },
  {
    name: "address",
    label: "Address",
    type: "text",
    hint: "Overrides business info",
    showIf: (b) => b.showBusinessInfo !== false,
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    hint: "Overrides business info",
    showIf: (b) => b.showBusinessInfo !== false,
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    hint: "Overrides business info",
    showIf: (b) => b.showBusinessInfo !== false,
  },

  // Copyright
  { name: "allRightsReserved", label: "All Rights Reserved", type: "boolean" },
  { name: "copyright",         label: "Copyright Text",      type: "markdown" },

  // Links
  { name: "linksHeading", label: "Links Heading",  type: "text" },
  { name: "links",        label: "Footer Links",   type: "navlinks" },
  { name: "socialHeading", label: "Social Heading", type: "text" },
  {
    name: "socialLinks",
    label: "Social Links",
    type: "navlinks",
    defaultNavType: "external",
    hideNavType: true,
  },

  // Presentation
  { name: "backgroundImage", label: "Background Image", type: "image", group: "presentation" },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
