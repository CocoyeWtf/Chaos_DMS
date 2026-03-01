import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Template schema used for migration generation only.
 * At runtime, use createTenantPgSchema() for actual tenant schemas.
 */
export const tenantTemplate = pgSchema('tenant_template');

/**
 * Creates a Drizzle pgSchema bound to a specific tenant schema name.
 */
export function createTenantPgSchema(schemaName: string) {
  return pgSchema(schemaName);
}
