import type { BaseBlock } from "../shared/types";
import type { NavLinkItem } from "../shared/navlinks";

export interface FooterBlock extends BaseBlock {
  _template: "footer";
  copyright?: string;
  socialLinks?: NavLinkItem[];
  links?: NavLinkItem[];
  linksHeading?: string;
  socialHeading?: string;
  showBusinessInfo?: boolean;
  allRightsReserved?: boolean;
  /** Overrides tenant.business.address when showBusinessInfo is true */
  address?: string;
  /** Overrides tenant.business.phone when showBusinessInfo is true */
  phone?: string;
  /** Overrides tenant.business.email when showBusinessInfo is true */
  email?: string;
}
