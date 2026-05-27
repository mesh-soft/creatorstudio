import type { BlockDefinition } from "../shared/types";
import type { TimingsBlock } from "./types";
import { TimingsComponent } from "./Timings";
import { timingsFields } from "./schema";

export const timingsDefinition: BlockDefinition<TimingsBlock> = {
  id: "timings",
  label: "Timings",
  icon: "clock",
  fields: timingsFields,
  defaultValues: {
    _template: "timings",
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
    { label: "Compact", value: "compact" },
    { label: "Cards",   value: "cards" },
    { label: "Split",   value: "split" },
  ],
  component: TimingsComponent,
};

export type { TimingsBlock } from "./types";
