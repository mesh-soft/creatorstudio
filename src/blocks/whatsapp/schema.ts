import type { FieldDefinition } from "../shared/types";

export const whatsappFields: FieldDefinition[] = [
  {
    name: "phone",
    label: "Phone (with country code)",
    type: "text",
    placeholder: "+919876543210",
  },
  {
    name: "message",
    label: "Pre-filled Message",
    type: "markdown",
    rows: 2,
    placeholder: "Hi, I'd like to book an appointment.",
  },
  {
    name: "label",
    label: "Tooltip",
    type: "text",
    placeholder: "Chat on WhatsApp",
  },
];
