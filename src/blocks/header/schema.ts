import type { FieldDefinition } from "../shared/types";

export const headerFields: FieldDefinition[] = [
  { name: "logo",     label: "Logo",      type: "image" },
  { name: "navLinks", label: "Nav Links", type: "navlinks" },
  { name: "backgroundImage", label: "Background Image", type: "image", group: "presentation" },
  { name: "css", label: "CSS Overrides", type: "css", group: "presentation" },
];
