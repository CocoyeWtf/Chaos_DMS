import { Pool, type PoolConfig } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as publicSchema from '../schema/public';

export type PublicDatabase = NodePgDatabase<typeof publicSchema>;

/**
 * Creates a Drizzle database instance connected to the public schema.
 */
export function createPublicDb(pool: Pool): PublicDatabase {
  return drizzle(pool, { schema: publicSchema });
}

export function createPool(config?: PoolConfig): Pool {
  return new Pool({
    connectionString:
      process.env['DATABASE_URL'] ??
      'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms',
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    ...config,
  });
}
