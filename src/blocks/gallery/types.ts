import type { BaseBlock } from "../shared/types";

export interface GalleryBlock extends BaseBlock {
  _template: "gallery";
  kicker?: string;
  title?: string;
  items?: Array<{ src: string; alt: string }>;
}
