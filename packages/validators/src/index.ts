// @chaos-dms/validators - Shared Zod validation schemas
import { z } from 'zod';

// ====== Common schemas ======

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const isoDateStringSchema = z.string().datetime({ offset: true });

// ====== Enum schemas ======

export const tenantStatusSchema = z.enum(['active', 'suspended', 'provisioning', 'deactivated']);

export const orgLevelSchema = z.enum([
  'groupe',
  'pays',
  'region',
  'base',
  'service',
  'equipe',
  'activite',
  'equipier',
]);

export const roleCodeSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN_PAYS',
  'ADMIN_REGION',
  'DIRECTEUR_BASE',
  'MANAGER',
  'ANIMATEUR_DMS',
  'RESPONSABLE_ACTIVITE',
  'OPERATEUR',
  'EQUIPIER',
  'AUDITEUR',
]);

export const userStatusSchema = z.enum(['active', 'inactive', 'pending', 'locked']);

export const anomalyStatusSchema = z.enum([
  'open',
  'in_progress',
  'resolved',
  'closed',
  'cancelled',
]);

export const anomalySeveritySchema = z.enum(['critical', 'major', 'minor', 'observation']);

export const actionPlanStatusSchema = z.enum([
  'draft',
  'pending',
  'in_progress',
  'completed',
  'overdue',
  'cancelled',
]);

export const kpiTypeSchema = z.enum(['numeric', 'percentage', 'boolean', 'duration', 'count']);

export const kpiFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

// ====== Tenant schemas ======

export const createTenantSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(255),
  maxUsers: z.number().int().min(1).max(10000).optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateTenantSchema = createTenantSchema.partial().extend({
  status: tenantStatusSchema.optional(),
});

// ====== Organisation schemas ======

export const createOrganisationSchema = z.object({
  parentId: uuidSchema.nullable().optional(),
  code: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(255),
  level: orgLevelSchema,
  sortOrder: z.number().int().min(0).optional(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

// ====== User schemas ======

export const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  displayName: z.string().max(200).optional(),
  organisationId: uuidSchema,
  roles: z
    .array(
      z.object({
        roleCode: roleCodeSchema,
        organisationId: uuidSchema,
      }),
    )
    .min(1),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(200).optional(),
  status: userStatusSchema.optional(),
  organisationId: uuidSchema.optional(),
});

// ====== Auth schemas ======

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantCode: z.string().min(1),
});

// ====== Anomaly schemas ======

export const createAnomalySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  organisationId: uuidSchema,
  severity: anomalySeveritySchema,
  detectedAt: isoDateStringSchema,
  assignedTo: uuidSchema.optional(),
  immediateAction: z.string().optional(),
  checklistId: uuidSchema.optional(),
  kpiDefinitionId: uuidSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAnomalySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: anomalyStatusSchema.optional(),
  severity: anomalySeveritySchema.optional(),
  assignedTo: uuidSchema.nullable().optional(),
  rootCause: z.string().optional(),
  immediateAction: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  version: z.number().int().min(1),
});

// ====== Action Plan schemas ======

export const createActionPlanSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  organisationId: uuidSchema,
  anomalyId: uuidSchema.optional(),
  priority: z.number().int().min(1).max(5).default(3),
  assignedTo: uuidSchema,
  dueDate: isoDateStringSchema,
  steps: z
    .array(
      z.object({
        phase: z.enum(['plan', 'do', 'check', 'act']),
        description: z.string().min(1),
        status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
      }),
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateActionPlanSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: actionPlanStatusSchema.optional(),
  priority: z.number().int().min(1).max(5).optional(),
  assignedTo: uuidSchema.optional(),
  dueDate: isoDateStringSchema.optional(),
  steps: z
    .array(
      z.object({
        phase: z.enum(['plan', 'do', 'check', 'act']),
        description: z.string().min(1),
        status: z.enum(['pending', 'in_progress', 'completed']),
        completedAt: isoDateStringSchema.optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  version: z.number().int().min(1),
});

// ====== KPI schemas ======

export const createKpiDefinitionSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: kpiTypeSchema,
  frequency: kpiFrequencySchema,
  unit: z.string().max(50).optional(),
  targetValue: z.number().optional(),
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  isHigherBetter: z.boolean().default(true),
  organisationId: uuidSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const recordKpiValueSchema = z.object({
  kpiDefinitionId: uuidSchema,
  organisationId: uuidSchema,
  value: z.number(),
  targetValue: z.number().optional(),
  recordedAt: isoDateStringSchema,
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
