import type { BaseBlock } from "../shared/types";

export interface ProfileBlock extends BaseBlock {
  _template: "profile";
  kicker?: string;
  title?: string;
  body?: string;
  experienceYears?: number;
  experienceLabel?: string;
  registrationNumber?: string;
  registrationLabel?: string;
}
