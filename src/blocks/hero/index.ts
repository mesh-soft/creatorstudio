import type { BlockDefinition } from "../shared/types";
import type { HeroBlock } from "./types";
import { HeroComponent } from "./Hero";
import { heroFields } from "./schema";

export const heroDefinition: BlockDefinition<HeroBlock> = {
  id: "hero",
  label: "Hero",
  icon: "sparkles",
  fields: heroFields,
  defaultValues: {
    _template: "hero",
    enabled: true,
    headline: "",
    subheadline: "",
    photo: "",
    buttons: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",   value: "" },
    { label: "Compact",   value: "compact" },
    { label: "Editorial", value: "editorial" },
    { label: "Centered",  value: "centered" },
    { label: "Split",     value: "split" },
  ],
  component: HeroComponent,
  // editorComponent is omitted — BlockEditor uses the generic FieldRenderer
  // driven by heroFields above.
};

export type { HeroBlock } from "./types";
