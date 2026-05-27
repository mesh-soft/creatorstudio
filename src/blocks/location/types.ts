import type { BaseBlock } from "../shared/types";

export interface LocationBlock extends BaseBlock {
  _template: "location";
  kicker?: string;
  title?: string;
  mapUrl?: string;
  height?: number;
}
