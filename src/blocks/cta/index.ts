import type { BlockDefinition } from "../shared/types";
import type { CtaBlock } from "./types";
import { CTAComponent } from "./CTA";
import { ctaFields } from "./schema";

export const ctaDefinition: BlockDefinition<CtaBlock> = {
  id: "cta",
  label: "CTA",
  icon: "zap",
  fields: ctaFields,
  defaultValues: {
    _template: "cta",
    enabled: true,
    title: "",
    body: "",
    buttons: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",  value: "" },
    { label: "Minimal",  value: "minimal" },
    { label: "Bold",     value: "bold" },
    { label: "Centered", value: "centered" },
  ],
  component: CTAComponent,
};

export type { CtaBlock } from "./types";
