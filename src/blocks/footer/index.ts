import type { BlockDefinition } from "../shared/types";
import type { FooterBlock } from "./types";
import { FooterComponent } from "./Footer";
import { footerFields } from "./schema";

export const footerDefinition: BlockDefinition<FooterBlock> = {
  id: "footer",
  label: "Footer",
  icon: "building",
  fields: footerFields,
  defaultValues: {
    _template: "footer",
    enabled: true,
    copyright: "",
    socialLinks: [],
    links: [],
    linksHeading: "",
    socialHeading: "",
    showBusinessInfo: true,
    allRightsReserved: true,
    address: "",
    phone: "",
    email: "",
    backgroundImage: "",
    css: "",
  },
  // No variants for footer
  component: FooterComponent,
  // editorComponent: uses the generic FieldRenderer which respects showIf predicates
  // The footer block's conditional fields (address/phone/email when showBusinessInfo=true)
  // are handled via the showIf function in footerFields.
};

export type { FooterBlock } from "./types";
