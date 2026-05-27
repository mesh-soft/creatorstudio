import type { BaseBlock } from "../shared/types";

export interface WhatsappBlock extends BaseBlock {
  _template: "whatsapp";
  phone?: string;
  message?: string;
  label?: string;
}
