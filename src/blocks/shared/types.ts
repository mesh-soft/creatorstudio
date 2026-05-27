/**
 * @file src/blocks/shared/types.ts
 *
 * Core type contracts for the doctor-sites block system.
 * Every block — built-in, tenant-type-scoped, or tenant-specific — must
 * conform to these interfaces.  External block authors import from
 * `src/blocks/sdk.ts` which re-exports everything here.
 */

import type React from "react";
import type { Tenant, VariantPreset, TenantType } from "../../platform/types";

// Re-export TenantType so registry.ts can import it from here without creating
// a circular dependency through platform/types.
export type { TenantType };

// ── Base block ─────────────────────────────────────────────────────────────
// All block JSON objects stored in page.blocks[] share these fields.

export interface BaseBlock {
  /** Discriminant — must match the BlockDefinition id. */
  _template: string;
  /** false / "false" hides the block without removing it from JSON. */
  enabled?: boolean | "false";
  /**
   * Per-block CSS overrides.
   * Storage format: JSON string `'{"background-color":"red"}'`
   * OR a breakpoint object `{ base: {...}, mobile: {...}, tablet: {...} }`.
   * The Section primitive applies these with `!important` via a <style> tag.
   */
  css?: string | Record<string, any>;
  /** Optional hero / section background image URL. */
  backgroundImage?: string;
  /** Layout variant class suffix (e.g. "split", "cards"). */
  variant?: string;
}

// ── Field schema ───────────────────────────────────────────────────────────
// Declarative description of a block's editable fields.
// Used by:
//   1. The generic FieldRenderer inside BlockEditor (fallback when editorComponent is absent)
//   2. Tooling / documentation generators
//   3. Future headless CMS integrations

export type FieldType =
  | "text"        // single-line string → FField
  | "textarea"    // multi-line string  → FTextarea
  | "markdown"    // rich text / AI-assist → FRich
  | "number"      // numeric → FField type="number"
  | "boolean"     // toggle → FToggle
  | "select"      // dropdown → FSelect
  | "image"       // image upload / picker → FImage
  | "css"         // CSS JSON string → FCSSField
  | "icon"        // icon picker → FIconPicker
  | "url"         // URL input → FField
  | "color"       // color picker → FColor
  | "list"        // repeatable items → FItems
  | "navlinks"    // nav / social links → FNavLinks
  | "buttons"     // CTA button array → FButtons
  | "stringlist"; // comma-separated list → FStringList

/**
 * Describes one sub-field inside a "list" item.
 * Mirrors the `fields` array accepted by the existing `FItems` component.
 */
export interface ItemFieldDef {
  /** Key in the item object. */
  k: string;
  /** Label shown in the editor. */
  l: string;
  /** Field type — defaults to plain text if omitted. */
  type?: "text" | "markdown" | "image" | "icon" | "select";
  /** AI-suggest hint (maps to SuggestionFieldType). */
  ft?: string;
  /** Options for "select" type. */
  opts?: Array<{ v: string; l: string }>;
}

export interface FieldDefinition {
  /** Key in the block JSON object. */
  name: string;
  /** Human-readable label shown in the editor. */
  label: string;
  type: FieldType;
  /**
   * Which editor tab this field belongs to.
   * "content"      → the default "Content" tab
   * "presentation" → the "Presentation" tab (variant, css, backgroundImage)
   * Omitting defaults to "content".
   */
  group?: "content" | "presentation";
  /** For "select" — the option list. */
  options?: Array<{ v: string; l: string }>;
  /** For "markdown" / "text" — AI suggestion hint sent to SuggestionPopup. */
  fieldType?: string;
  /** For "textarea" / "markdown" — number of visible rows. */
  rows?: number;
  /** For "list" — describes each item's sub-fields. */
  itemFields?: ItemFieldDef[];
  /**
   * Conditional visibility predicate.
   * The field is hidden when this returns false.
   * Example: `showIf: (b) => b.showBusinessInfo !== false`
   */
  showIf?: (block: Record<string, unknown>) => boolean;
  /** Placeholder text for text / url / number inputs. */
  placeholder?: string;
  /** Short hint shown below the field. */
  hint?: string;
  /** For "navlinks" — the default link type when adding a new item. */
  defaultNavType?: "section" | "page" | "external";
  /** For "navlinks" — hide the type selector (social links). */
  hideNavType?: boolean;
}

// ── Site renderer props ────────────────────────────────────────────────────
// Passed to every block's `component`.

export interface BlockProps<T extends BaseBlock = BaseBlock> {
  block: T;
  tenant: Tenant;
  preset: VariantPreset;
  /** True when rendered inside the live-preview iframe with studio overlays. */
  isPreview?: boolean;
  /** True when studio data-edit-path attributes should be emitted. */
  studioMode?: boolean;
  /** Position of this block in page.blocks[] (used for data-edit-path). */
  blockIndex?: number;
  /**
   * The TinaCMS sectionField path for this block,
   * e.g. `"blocks.2"` — passed to the Section primitive.
   */
  sectionField?: string;
}

// ── Schema renderer props ──────────────────────────────────────────────────
// Passed to every block's `editorComponent`.

export interface EditorProps<T extends BaseBlock = BaseBlock> {
  block: T;
  onChange: (updated: T) => void;
  /** Which tab is currently active in the block editor panel. */
  mode: "content" | "presentation";
  /** Slugs of all pages in this tenant (for page-link dropdowns). */
  pages?: string[];
}

// ── Scope ──────────────────────────────────────────────────────────────────
// Controls which tenants can see and use a block.

export interface BlockScope {
  /**
   * If set, the block is only available to tenants whose
   * `tenantId` is in this list.
   */
  tenantIds?: string[];
  /**
   * If set, the block is only available to tenants whose
   * `tenantType` is in this list.
   */
  tenantTypes?: TenantType[];
}

/**
 * Passed to `registry.resolve()` / `registry.getAll()` to filter
 * blocks to those visible to the current tenant.
 */
export interface RegistryContext {
  tenantId?: string;
  tenantType?: TenantType;
}

// ── Block definition ───────────────────────────────────────────────────────
// The contract every block (built-in or third-party) must export.

export interface BlockDefinition<T extends BaseBlock = BaseBlock> {
  /** Unique identifier — must match `block._template` in JSON. */
  id: string;
  /** Display name shown in the editor "Add Block" menu. */
  label: string;
  /** Icon key (from lib/icons.tsx ICON_NAMES). Shown in editor menus. */
  icon?: string;
  /**
   * Declarative field schema.
   * Used by the generic FieldRenderer fallback when `editorComponent` is absent.
   * Also useful for tooling, docs, and headless CMS integrations.
   */
  fields: FieldDefinition[];
  /**
   * Default values populated when a user adds this block via the editor.
   * Must include `_template` matching `id`.
   */
  defaultValues: Omit<Partial<T>, "_template"> & { _template: T["_template"] };
  /** Variant options shown in the Presentation tab dropdown. */
  variants?: Array<{ label: string; value: string }>;
  /**
   * Scope controls which tenants can see this block.
   * `undefined` (omitted) means the block is global — available to all.
   *
   * When a tenant-specific block has the same `id` as a global block,
   * the registry serves the tenant-specific one (higher specificity wins).
   */
  scope?: BlockScope;

  // ── Renderers ────────────────────────────────────────────────────────────

  /**
   * Site renderer — the React component that renders the block
   * on the published / previewed site.
   *
   * Must be importable from a "use client" module (blocks render client-side).
   */
  component: React.ComponentType<BlockProps<T>>;

  /**
   * Schema renderer — the editor form component.
   *
   * If omitted, `BlockEditor` falls back to the generic `FieldRenderer`
   * which walks `fields[]` and dispatches to `F*` editor components.
   *
   * Built-in blocks that have complex conditional logic (e.g. footer's
   * "show business info" toggle) provide an explicit `editorComponent`.
   */
  editorComponent?: React.ComponentType<EditorProps<T>>;
}
