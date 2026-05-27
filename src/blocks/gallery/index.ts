import type { BlockDefinition } from "../shared/types";
import type { GalleryBlock } from "./types";
import { GalleryComponent } from "./Gallery";
import { galleryFields } from "./schema";

export const galleryDefinition: BlockDefinition<GalleryBlock> = {
  id: "gallery",
  label: "Gallery",
  icon: "star",
  fields: galleryFields,
  defaultValues: {
    _template: "gallery",
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
    { label: "Masonry",  value: "masonry" },
    { label: "Carousel", value: "carousel" },
    { label: "Wide",     value: "wide" },
  ],
  component: GalleryComponent,
};

export type { GalleryBlock } from "./types";
