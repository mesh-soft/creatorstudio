import type { BlockDefinition } from "../shared/types";
import type { WhatsappBlock } from "./types";
import { WhatsAppComponent } from "./WhatsApp";
import { whatsappFields } from "./schema";

export const whatsappDefinition: BlockDefinition<WhatsappBlock> = {
  id: "whatsapp",
  label: "WhatsApp",
  icon: "whatsapp",
  fields: whatsappFields,
  defaultValues: {
    _template: "whatsapp",
    enabled: true,
    phone: "",
    message: "",
    label: "",
  },
  // No variants — the button is always the same fixed style
  component: WhatsAppComponent,
};

export type { WhatsappBlock } from "./types";
