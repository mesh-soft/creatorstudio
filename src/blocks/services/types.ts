import type { BaseBlock } from "../shared/types";

export interface ServicesBlock extends BaseBlock {
  _template: "services";
  kicker?: string;
  title?: string;
  items?: Array<{ title: string; description: string; icon?: string }>;
}
