import type { BaseBlock } from "../shared/types";

export interface StatsBlock extends BaseBlock {
  _template: "stats";
  items?: Array<{ value: string; label: string }>;
}
