import type { BlockDefinition } from "../shared/types";
import type { StatsBlock } from "./types";
import { StatsComponent } from "./Stats";
import { statsFields } from "./schema";

export const statsDefinition: BlockDefinition<StatsBlock> = {
  id: "stats",
  label: "Stats",
  icon: "chart",
  fields: statsFields,
  defaultValues: {
    _template: "stats",
    enabled: true,
    items: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",    value: "" },
    { label: "Horizontal", value: "horizontal" },
    { label: "Compact",    value: "compact" },
  ],
  component: StatsComponent,
};

export type { StatsBlock } from "./types";
