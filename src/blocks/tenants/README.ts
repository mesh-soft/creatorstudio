/**
 * @file src/blocks/tenants/README.ts
 *
 * Tenant-specific block registration.
 *
 * Each tenant that needs custom blocks gets its own directory:
 *
 *   src/blocks/tenants/{tenantId}/
 *     ├── index.ts             ← imports and registers tenant blocks
 *     └── {block-name}/
 *         ├── types.ts
 *         ├── schema.ts
 *         ├── BlockName.tsx
 *         └── index.ts
 *
 * Example: Adding a "patient-journey" block only for tenant "nitesh-garwa":
 *
 * ```ts
 * // src/blocks/tenants/nitesh-garwa/index.ts
 * import { registry } from "../../registry";
 * import { patientJourneyDefinition } from "./patient-journey";
 * registry.register(patientJourneyDefinition);
 *
 * // src/blocks/tenants/nitesh-garwa/patient-journey/index.ts
 * export const patientJourneyDefinition: BlockDefinition<PatientJourneyBlock> = {
 *   id: "patient-journey",
 *   label: "Patient Journey",
 *   scope: { tenantIds: ["nitesh-garwa"] },
 *   component: PatientJourneyComponent,
 *   fields: [...],
 *   defaultValues: { _template: "patient-journey", enabled: true },
 * };
 * ```
 *
 * Then in src/blocks/index.ts, uncomment:
 *   import "./tenants/nitesh-garwa";
 */
