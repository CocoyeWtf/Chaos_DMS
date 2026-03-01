// Schema exports
export * from './schema/public';
export * from './schema/tenant';

// Client exports
export { createPublicDb, createPool, type PublicDatabase } from './client/connection';
export { TenantConnectionManager } from './client/tenant-manager';

// Migration exports
export {
  migratePublicSchema,
  migrateTenantSchema,
  provisionTenant,
  migrateAllTenants,
} from './migrate';
