import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/tenant/index.ts',
  out: './drizzle/tenant',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env['DATABASE_URL'] ??
      'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms',
  },
  verbose: true,
  strict: true,
});
