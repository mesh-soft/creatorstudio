import type { BlockDefinition } from "../shared/types";
import type { AwardsBlock } from "./types";
import { AwardsComponent } from "./Awards";
import { awardsFields } from "./schema";

export const awardsDefinition: BlockDefinition<AwardsBlock> = {
  id: "awards",
  label: "Awards",
  icon: "award",
  fields: awardsFields,
  defaultValues: {
    _template: "awards",
    enabled: true,
    kicker: "",
    title: "",
    items: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",  value: "" },
    { label: "Timeline", value: "timeline" },
    { label: "Cards",    value: "cards" },
    { label: "Compact",  value: "compact" },
  ],
  component: AwardsComponent,
};

export type { AwardsBlock } from "./types";
