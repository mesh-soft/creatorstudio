import type { BlockDefinition } from "../shared/types";
import type { FaqBlock } from "./types";
import { FAQComponent } from "./FAQ";
import { faqFields } from "./schema";

export const faqDefinition: BlockDefinition<FaqBlock> = {
  id: "faq",
  label: "FAQ",
  icon: "info",
  fields: faqFields,
  defaultValues: {
    _template: "faq",
    enabled: true,
    kicker: "",
    title: "",
    items: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",   value: "" },
    { label: "Accordion", value: "accordion" },
    { label: "Minimal",   value: "minimal" },
  ],
  component: FAQComponent,
};

export type { FaqBlock } from "./types";
