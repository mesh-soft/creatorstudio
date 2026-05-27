import type { BaseBlock } from "../shared/types";
import type { NavLinkItem } from "../shared/navlinks";

export interface HeaderBlock extends BaseBlock {
  _template: "header";
  logo?: string;
  navLinks?: NavLinkItem[];
}
