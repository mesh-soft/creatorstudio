import type { BlockDefinition } from "../shared/types";
import type { TextBlock } from "./types";
import { TextBlockComponent } from "./TextBlock";
import { textFields } from "./schema";

export const textDefinition: BlockDefinition<TextBlock> = {
  id: "text",
  label: "Text",
  icon: "document",
  fields: textFields,
  defaultValues: {
    _template: "text",
    enabled: true,
    heading: "",
    body: "",
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",  value: "" },
    { label: "Centered", value: "centered" },
    { label: "Narrow",   value: "narrow" },
    { label: "Wide",     value: "wide" },
  ],
  component: TextBlockComponent,
};

export type { TextBlock } from "./types";
