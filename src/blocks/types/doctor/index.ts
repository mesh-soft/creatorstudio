/**
 * @file src/blocks/types/doctor/index.ts
 *
 * Re-export all doctor-type-scoped block definitions.
 *
 * Add blocks here that are only relevant for doctor tenants
 * (tenantType === "doctor"). Example:
 *
 * ```ts
 * import { registry } from "../../registry";
 * import { procedureChecklistDefinition } from "./procedure-checklist";
 * registry.register(procedureChecklistDefinition);
 * ```
 *
 * Then import this file in src/blocks/index.ts:
 *   import "./types/doctor";
 */

// Doctor-only blocks will be registered here.
// Each block uses scope: { tenantTypes: ["doctor"] } in its BlockDefinition.
