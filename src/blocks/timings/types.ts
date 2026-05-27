import type { BaseBlock } from "../shared/types";

export interface TimingsBlock extends BaseBlock {
  _template: "timings";
  kicker?: string;
  title?: string;
  items?: Array<{ day: string; primary: string; secondary: string }>;
}
