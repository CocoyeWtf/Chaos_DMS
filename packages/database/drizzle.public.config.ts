import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/public/index.ts',
  out: './drizzle/public',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env['DATABASE_URL'] ??
      'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms',
  },
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
});
