import type { BaseBlock } from "../shared/types";

export interface TextBlock extends BaseBlock {
  _template: "text";
  heading?: string;
  body?: string;
}
