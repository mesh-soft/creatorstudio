import type { BlockDefinition } from "../shared/types";
import type { LocationBlock } from "./types";
import { LocationComponent } from "./Location";
import { locationFields } from "./schema";

export const locationDefinition: BlockDefinition<LocationBlock> = {
  id: "location",
  label: "Location",
  icon: "map-pin",
  fields: locationFields,
  defaultValues: {
    _template: "location",
    enabled: true,
    kicker: "",
    title: "",
    mapUrl: "",
    height: 400,
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",    value: "" },
    { label: "Full Width", value: "full-width" },
    { label: "Compact",    value: "compact" },
  ],
  component: LocationComponent,
};

export type { LocationBlock } from "./types";
