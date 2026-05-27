import type { BlockDefinition } from "../shared/types";
import type { TestimonialsBlock } from "./types";
import { TestimonialsComponent } from "./Testimonials";
import { testimonialsFields } from "./schema";

export const testimonialsDefinition: BlockDefinition<TestimonialsBlock> = {
  id: "testimonials",
  label: "Testimonials",
  icon: "smile",
  fields: testimonialsFields,
  defaultValues: {
    _template: "testimonials",
    enabled: true,
    kicker: "",
    title: "",
    items: [],
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",  value: "" },
    { label: "Grid",     value: "grid" },
    { label: "Carousel", value: "carousel" },
    { label: "Minimal",  value: "minimal" },
  ],
  component: TestimonialsComponent,
};

export type { TestimonialsBlock } from "./types";
