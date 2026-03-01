// @chaos-dms/types - Shared TypeScript types and DTOs

// ====== Inferred types from Drizzle schemas ======

import type {
  tenants,
  organisations,
  organisationClosure,
  users,
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from '@chaos-dms/database';

// Public schema types
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type Organisation = typeof organisations.$inferSelect;
export type NewOrganisation = typeof organisations.$inferInsert;

export type OrganisationClosureRow = typeof organisationClosure.$inferSelect;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPublic = Omit<User, 'passwordHash'>;

export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

// ====== Enum value types ======

export type TenantStatus = 'active' | 'suspended' | 'provisioning' | 'deactivated';
export type OrgLevel =
  | 'groupe'
  | 'pays'
  | 'region'
  | 'base'
  | 'service'
  | 'equipe'
  | 'activite'
  | 'equipier';
export type RoleCode =
  | 'SUPER_ADMIN'
  | 'ADMIN_PAYS'
  | 'ADMIN_REGION'
  | 'DIRECTEUR_BASE'
  | 'MANAGER'
  | 'ANIMATEUR_DMS'
  | 'RESPONSABLE_ACTIVITE'
  | 'OPERATEUR'
  | 'EQUIPIER'
  | 'AUDITEUR';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'locked';

export type AnomalyStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type AnomalySeverity = 'critical' | 'major' | 'minor' | 'observation';
export type ActionPlanStatus =
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';
export type KpiType = 'numeric' | 'percentage' | 'boolean' | 'duration' | 'count';
export type KpiFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// ====== DTO types (API contracts) ======

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, unknown>;
}

export interface AuthTokenPayload {
  sub: string;
  tenantId: string;
  organisationId: string;
  roles: RoleCode[];
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

export interface OrgTreeNode {
  id: string;
  code: string;
  name: string;
  level: OrgLevel;
  levelDepth: number;
  children: OrgTreeNode[];
}
