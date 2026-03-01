import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', [
  'active',
  'suspended',
  'provisioning',
  'deactivated',
]);

export const orgLevelEnum = pgEnum('org_level', [
  'groupe',
  'pays',
  'region',
  'base',
  'service',
  'equipe',
  'activite',
  'equipier',
]);

export const roleCodeEnum = pgEnum('role_code', [
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

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'pending', 'locked']);
