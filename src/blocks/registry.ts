/**
 * @file src/blocks/registry.ts
 *
 * BlockRegistry — the central registry for all block types.
 *
 * Three kinds of blocks can be registered:
 *   • Global (no scope)       — available to every tenant
 *   • Type-scoped             — available to all "doctor" or all "hospital" tenants
 *   • Tenant-specific         — available only to one tenant by tenantId
 *
 * When resolving, the most-specific scope wins.
 * If a tenant-specific "hero" and a global "hero" are both registered,
 * `resolve("hero", { tenantId: "nitesh-garwa" })` returns the tenant one.
 *
 * Usage:
 *   import { registry, registerBlock } from "./registry";
 *   registerBlock(heroDefinition);
 *   const def = registry.resolve("hero", { tenantId, tenantType });
 *   const all = registry.getAll({ tenantId, tenantType });
 */

import type { BaseBlock, BlockDefinition, BlockScope, RegistryContext, TenantType } from "./shared/types";

// ── Scope matching ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchesScope(def: BlockDefinition<any>, ctx?: RegistryContext): boolean {
  const scope: BlockScope | undefined = def.scope;
  if (!scope) return true; // global — always visible

  const { tenantIds, tenantTypes } = scope;

  // If a tenantIds list is declared, ctx.tenantId must be in it
  if (tenantIds && tenantIds.length > 0) {
    if (!ctx?.tenantId || !tenantIds.includes(ctx.tenantId)) return false;
  }

  // If a tenantTypes list is declared, ctx.tenantType must be in it
  if (tenantTypes && tenantTypes.length > 0) {
    if (!ctx?.tenantType || !tenantTypes.includes(ctx.tenantType as TenantType)) return false;
  }

  return true;
}

/**
 * Returns a sort-comparison value where lower = more specific.
 * tenantId-scoped (2) > tenantType-scoped (1) > global (0).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function specificityScore(def: BlockDefinition<any>): number {
  if (def.scope?.tenantIds && def.scope.tenantIds.length > 0) return 2;
  if (def.scope?.tenantTypes && def.scope.tenantTypes.length > 0) return 1;
  return 0;
}

// ── Internal map key ───────────────────────────────────────────────────────
// Allows the same `id` to be registered under different scopes.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKey(def: BlockDefinition<any>): string {
  const tenantPart =
    def.scope?.tenantIds?.join(",") ??
    def.scope?.tenantTypes?.join(",") ??
    "__global__";
  return `${def.id}::${tenantPart}`;
}

// ── Registry class ─────────────────────────────────────────────────────────

class BlockRegistry {
  private readonly _map = new Map<string, BlockDefinition<any>>();

  /**
   * Register a block definition.
   * Warns (does not throw) when overwriting an existing entry so that
   * hot-reload during development does not crash the app.
   */
  register<T extends BaseBlock>(def: BlockDefinition<T>): void {
    const key = mapKey(def);
    const existing = this._map.get(key);
    // During development, hot-module replacement re-evaluates modules so the
    // same definition is registered more than once.  Only warn when the incoming
    // definition is actually a different object (a genuine conflict).
    if (existing && existing !== (def as BlockDefinition<any>)) {
      console.warn(
        `[BlockRegistry] Overwriting block "${def.id}"` +
          (def.scope ? ` (scope: ${JSON.stringify(def.scope)})` : " (global)"),
      );
    }
    this._map.set(key, def as BlockDefinition<any>);
  }

  /**
   * Resolve the best-matching definition for a template id + tenant context.
   *
   * Specificity order: tenantId-scoped > tenantType-scoped > global.
   * Returns `undefined` when no definition matches.
   */
  resolve(id: string, ctx?: RegistryContext): BlockDefinition | undefined {
    const candidates = Array.from(this._map.values()).filter(
      (d) => d.id === id && matchesScope(d, ctx),
    );
    if (candidates.length === 0) return undefined;
    // Sort descending by specificity — highest first
    candidates.sort((a, b) => specificityScore(b) - specificityScore(a));
    return candidates[0];
  }

  /**
   * All block definitions visible to the current tenant context,
   * in registration order (insertion order of the underlying Map).
   *
   * When multiple definitions share the same `id` (e.g. a global hero and
   * a tenant-specific override), only the most specific one is included.
   */
  getAll(ctx?: RegistryContext): BlockDefinition[] {
    // Collect all matching definitions
    const matching = Array.from(this._map.values()).filter((d) =>
      matchesScope(d, ctx),
    );

    // Deduplicate by id — keep the highest-specificity entry per id
    const byId = new Map<string, BlockDefinition>();
    for (const def of matching) {
      const existing = byId.get(def.id);
      if (!existing || specificityScore(def) > specificityScore(existing)) {
        byId.set(def.id, def);
      }
    }

    return Array.from(byId.values());
  }

  /** Returns the total number of registered entries (including all scopes). */
  size(): number {
    return this._map.size;
  }

  /** Clears all registrations. Primarily useful in tests. */
  clear(): void {
    this._map.clear();
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

export const registry = new BlockRegistry();

/**
 * Convenience alias for `registry.register`.
 *
 * External block authors call this once at app startup:
 *   import { registerBlock } from "doctor-sites/blocks/sdk";
 *   registerBlock(myBlockDefinition);
 */
export const registerBlock = registry.register.bind(registry);

// Export the class for testing / advanced use
export { BlockRegistry };
