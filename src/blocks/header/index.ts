import type { BlockDefinition } from "../shared/types";
import type { HeaderBlock } from "./types";
import { HeaderComponent } from "./Header";
import { headerFields } from "./schema";

export const headerDefinition: BlockDefinition<HeaderBlock> = {
  id: "header",
  label: "Header",
  icon: "building",
  fields: headerFields,
  defaultValues: {
    _template: "header",
    enabled: true,
    logo: "",
    navLinks: [],
    backgroundImage: "",
    css: "",
  },
  // No variants for header
  component: HeaderComponent,
  // editorComponent uses the generic FieldRenderer with navlinks support
};

export type { HeaderBlock } from "./types";
