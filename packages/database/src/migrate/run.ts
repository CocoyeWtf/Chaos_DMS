import 'dotenv/config';
import { migratePublicSchema, migrateAllTenants } from './index';

async function main(): Promise<void> {
  const connectionString =
    process.env['DATABASE_URL'] ?? 'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms';

  const target = process.argv[2];

  if (target === 'public' || !target) {
    await migratePublicSchema({ connectionString });
  }

  if (target === 'tenants' || !target) {
    await migrateAllTenants({ connectionString });
  }
}

main().catch((err: unknown) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
