import type { BlockDefinition } from "../shared/types";
import type { ServicesBlock } from "./types";
import { ServicesComponent } from "./Services";
import { servicesFields } from "./schema";

export const servicesDefinition: BlockDefinition<ServicesBlock> = {
  id: "services",
  label: "Services",
  icon: "stethoscope",
  fields: servicesFields,
  defaultValues: {
    _template: "services",
    enabled: true,
    kicker: "",
    title: "",
    items: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default", value: "" },
    { label: "Grid",    value: "grid" },
    { label: "List",    value: "list" },
    { label: "Cards",   value: "cards" },
    { label: "Compact", value: "compact" },
  ],
  component: ServicesComponent,
};

export type { ServicesBlock } from "./types";
