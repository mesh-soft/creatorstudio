import type { BaseBlock } from "../shared/types";

export interface CtaBlock extends BaseBlock {
  _template: "cta";
  title?: string;
  body?: string;
  buttons?: Array<{
    label: string;
    url?: string;
    icon?: string;
    variant?: "primary" | "secondary";
  }>;
}
