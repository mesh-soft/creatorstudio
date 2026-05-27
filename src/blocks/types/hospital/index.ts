/**
 * @file src/blocks/types/hospital/index.ts
 *
 * Re-export all hospital-type-scoped block definitions.
 *
 * Add blocks here that are only relevant for hospital tenants
 * (tenantType === "hospital"). Example:
 *
 * ```ts
 * import { registry } from "../../registry";
 * import { departmentDirectoryDefinition } from "./department-directory";
 * registry.register(departmentDirectoryDefinition);
 * ```
 *
 * Then import this file in src/blocks/index.ts:
 *   import "./types/hospital";
 */

// Hospital-only blocks will be registered here.
// Each block uses scope: { tenantTypes: ["hospital"] } in its BlockDefinition.
