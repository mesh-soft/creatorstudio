import type { BaseBlock } from "../shared/types";

export interface AwardsBlock extends BaseBlock {
  _template: "awards";
  kicker?: string;
  title?: string;
  items?: Array<{
    title: string;
    year: string;
    organization: string;
    icon?: string;
  }>;
}
