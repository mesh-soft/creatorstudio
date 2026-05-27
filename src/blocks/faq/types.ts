import type { BaseBlock } from "../shared/types";

export interface FaqBlock extends BaseBlock {
  _template: "faq";
  kicker?: string;
  title?: string;
  items?: Array<{ question: string; answer: string }>;
}
