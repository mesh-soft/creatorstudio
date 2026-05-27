import type { BaseBlock } from "../shared/types";

export interface HeroBlock extends BaseBlock {
  _template: "hero";
  headline?: string;
  subheadline?: string;
  photo?: string;
  buttons?: Array<{
    label: string;
    url?: string;
    icon?: string;
    variant?: "primary" | "secondary";
  }>;
}
