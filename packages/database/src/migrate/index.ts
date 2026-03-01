import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as path from 'path';

export interface MigrateOptions {
  connectionString: string;
}

export async function migratePublicSchema(options: MigrateOptions): Promise<void> {
  const pool = new Pool({ connectionString: options.connectionString });
  const db = drizzle(pool);

  console.warn('[migrate] Running public schema migrations...');
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../../drizzle/public'),
  });
  console.warn('[migrate] Public schema migrations complete.');

  await pool.end();
}

export async function migrateTenantSchema(
  options: MigrateOptions & { schemaName: string },
): Promise<void> {
  if (!/^dms_org_\d+$/.test(options.schemaName)) {
    throw new Error(`Invalid tenant schema name: ${options.schemaName}`);
  }

  const pool = new Pool({ connectionString: options.connectionString });
  const db = drizzle(pool);

  await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${options.schemaName}`));
  await db.execute(sql.raw(`SET search_path TO ${options.schemaName}, public`));

  console.warn(`[migrate] Running tenant migrations for schema: ${options.schemaName}...`);
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../../drizzle/tenant'),
    migrationsSchema: options.schemaName,
  });
  console.warn(`[migrate] Tenant migrations for ${options.schemaName} complete.`);

  await pool.end();
}

export async function provisionTenant(
  options: MigrateOptions & { schemaName: string },
): Promise<void> {
  console.warn(`[provision] Provisioning tenant schema: ${options.schemaName}`);
  await migrateTenantSchema(options);
  console.warn(`[provision] Tenant ${options.schemaName} provisioned successfully.`);
}

export async function migrateAllTenants(options: MigrateOptions): Promise<void> {
  const pool = new Pool({ connectionString: options.connectionString });
  const db = drizzle(pool);

  const result = await db.execute(
    sql`SELECT schema_name FROM public.tenants WHERE status != 'deactivated'`,
  );

  const schemas = (result.rows as Array<{ schema_name: string }>).map((r) => r.schema_name);
  await pool.end();

  console.warn(`[migrate] Found ${String(schemas.length)} tenant schemas to migrate.`);

  for (const schemaName of schemas) {
    await migrateTenantSchema({ ...options, schemaName });
  }

  console.warn('[migrate] All tenant migrations complete.');
}
