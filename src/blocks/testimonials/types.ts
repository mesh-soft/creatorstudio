import type { BaseBlock } from "../shared/types";

export interface TestimonialsBlock extends BaseBlock {
  _template: "testimonials";
  kicker?: string;
  title?: string;
  items?: Array<{ quote: string; author: string }>;
}
