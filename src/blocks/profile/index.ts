import type { BlockDefinition } from "../shared/types";
import type { ProfileBlock } from "./types";
import { ProfileComponent } from "./Profile";
import { profileFields } from "./schema";

export const profileDefinition: BlockDefinition<ProfileBlock> = {
  id: "profile",
  label: "Profile",
  icon: "user-check",
  fields: profileFields,
  defaultValues: {
    _template: "profile",
    enabled: true,
    kicker: "",
    title: "",
    body: "",
    experienceYears: 0,
    experienceLabel: "",
    registrationNumber: "",
    registrationLabel: "",
    variant: "",
    backgroundImage: "",
    css: "",
  },
  variants: [
    { label: "Default",   value: "" },
    { label: "Editorial", value: "editorial" },
    { label: "Centered",  value: "centered" },
    { label: "Compact",   value: "compact" },
    { label: "Split",     value: "split" },
  ],
  component: ProfileComponent,
};

export type { ProfileBlock } from "./types";
