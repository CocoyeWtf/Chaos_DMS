import { Pool, type PoolConfig } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Manages per-tenant database connections.
 * Each tenant gets a pool whose search_path is set to its schema.
 */
export class TenantConnectionManager {
  private pools: Map<string, Pool> = new Map();
  private readonly baseConfig: PoolConfig;
  private readonly maxTenantPools: number;

  constructor(options?: { baseConfig?: PoolConfig; maxTenantPools?: number }) {
    this.baseConfig = {
      connectionString:
        process.env['DATABASE_URL'] ??
        'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms',
      min: 1,
      max: 5,
      idleTimeoutMillis: 60000,
      ...options?.baseConfig,
    };
    this.maxTenantPools = options?.maxTenantPools ?? 100;
  }

  async getConnection(schemaName: string): Promise<{
    db: NodePgDatabase;
    pool: Pool;
  }> {
    if (!/^dms_org_\d+$/.test(schemaName)) {
      throw new Error(`Invalid tenant schema name: ${schemaName}`);
    }

    let pool = this.pools.get(schemaName);
    if (!pool) {
      if (this.pools.size >= this.maxTenantPools) {
        const oldest = this.pools.entries().next();
        if (!oldest.done) {
          const [oldestKey, oldestPool] = oldest.value;
          await oldestPool.end();
          this.pools.delete(oldestKey);
        }
      }

      pool = new Pool(this.baseConfig);

      pool.on('connect', (client) => {
        void client.query(`SET search_path TO ${schemaName}, public`);
      });

      this.pools.set(schemaName, pool);
    }

    const db = drizzle(pool);
    return { db, pool };
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map((p) => p.end());
    await Promise.all(closePromises);
    this.pools.clear();
  }
}
