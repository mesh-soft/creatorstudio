/**
 * @file src/blocks/sdk.ts
 *
 * Public SDK surface for external block authors.
 *
 * External packages can build a block and register it at app startup:
 *
 * ```ts
 * import {
 *   registerBlock, Section, Heading, BlockProps, BaseBlock, BlockDefinition,
 * } from "doctor-sites/blocks/sdk";
 *
 * registerBlock({
 *   id: "before-after",
 *   label: "Before / After",
 *   component: BeforeAfterComponent,
 *   fields: [...],
 *   defaultValues: { _template: "before-after", enabled: true },
 * });
 * ```
 *
 * What is NOT exported here:
 *   • Editor `F*` field components — they are editor internals.
 *   • `BlockRegistry` class — use the `registry` singleton.
 *   • Platform types (Tenant, TenantSite, etc.) — import from platform/types.ts.
 */

// ── Type contracts ─────────────────────────────────────────────────────────

export type {
  BaseBlock,
  BlockDefinition,
  BlockProps,
  BlockScope,
  EditorProps,
  FieldDefinition,
  FieldType,
  ItemFieldDef,
  RegistryContext,
} from "./shared/types";

// ── Registry ───────────────────────────────────────────────────────────────

export { registry, registerBlock } from "./registry";

// ── Site renderer shared primitives ───────────────────────────────────────
// Block authors can compose these to match the platform's visual language.

export {
  Section,
  Eyebrow,
  BlockTitle,
  Heading,
  Text,
  Card,
  ImagePrimitive,
} from "./shared/primitives";

export { ButtonGroup } from "./shared/ButtonGroup";
export { MarkdownText } from "./shared/MarkdownText";

// ── Utilities ──────────────────────────────────────────────────────────────

export { safeArray, iconFor } from "./shared/utils";
export { resolveNavLink } from "./shared/navlinks";

// ── Icon rendering ─────────────────────────────────────────────────────────

export { iconElement } from "../lib/icons";
