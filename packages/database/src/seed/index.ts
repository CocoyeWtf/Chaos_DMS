import 'dotenv/config';
import { createPool, createPublicDb } from '../client/connection';
import { provisionTenant } from '../migrate';
import {
  tenants,
  organisations,
  organisationClosure,
  users,
  roles,
  permissions,
  userRoles,
} from '../schema/public';

async function seed(): Promise<void> {
  const connectionString =
    process.env['DATABASE_URL'] ?? 'postgresql://chaos_dms:chaos_dms_dev@localhost:5432/chaos_dms';

  const pool = createPool({ connectionString });
  const db = createPublicDb(pool);

  console.warn('[seed] Starting seed...');

  // 1. Seed roles
  const roleData = [
    { code: 'SUPER_ADMIN' as const, name: 'Super Administrateur', isSystem: true },
    { code: 'ADMIN_PAYS' as const, name: 'Administrateur Pays', isSystem: true },
    { code: 'ADMIN_REGION' as const, name: 'Administrateur Région', isSystem: true },
    { code: 'DIRECTEUR_BASE' as const, name: 'Directeur de Base', isSystem: true },
    { code: 'MANAGER' as const, name: 'Manager', isSystem: true },
    { code: 'ANIMATEUR_DMS' as const, name: 'Animateur DMS', isSystem: true },
    { code: 'RESPONSABLE_ACTIVITE' as const, name: 'Responsable Activité', isSystem: true },
    { code: 'OPERATEUR' as const, name: 'Opérateur', isSystem: true },
    { code: 'EQUIPIER' as const, name: 'Équipier', isSystem: true },
    { code: 'AUDITEUR' as const, name: 'Auditeur', isSystem: true },
  ];

  const insertedRoles = await db.insert(roles).values(roleData).onConflictDoNothing().returning();
  console.warn(`[seed] Inserted ${String(insertedRoles.length)} roles`);

  // 2. Seed permissions
  const resources = [
    'kpi',
    'anomaly',
    'action_plan',
    'checklist',
    'routine',
    'user',
    'organisation',
    'dashboard',
    'audit_log',
    'document',
  ];
  const actions = ['create', 'read', 'update', 'delete'];
  const permData = resources.flatMap((resource) =>
    actions.map((action) => ({
      code: `${resource}:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.replace(/_/g, ' ')}`,
      resource,
      action,
    })),
  );

  const insertedPerms = await db
    .insert(permissions)
    .values(permData)
    .onConflictDoNothing()
    .returning();
  console.warn(`[seed] Inserted ${String(insertedPerms.length)} permissions`);

  // 3. Seed demo tenant
  const [demoTenant] = await db
    .insert(tenants)
    .values({
      code: 'demo',
      name: 'Demo Organisation',
      schemaName: 'dms_org_1',
      status: 'active',
      maxUsers: 100,
    })
    .onConflictDoNothing()
    .returning();

  if (demoTenant) {
    console.warn(`[seed] Created demo tenant: ${demoTenant.id}`);

    // 4. Create org hierarchy
    const [groupe] = await db
      .insert(organisations)
      .values({
        tenantId: demoTenant.id,
        code: 'GRP-DEMO',
        name: 'Groupe Demo',
        level: 'groupe',
        levelDepth: 0,
        path: 'grp_demo',
      })
      .returning();

    const [pays] = await db
      .insert(organisations)
      .values({
        tenantId: demoTenant.id,
        parentId: groupe!.id,
        code: 'PAY-FR',
        name: 'France',
        level: 'pays',
        levelDepth: 1,
        path: 'grp_demo.pay_fr',
      })
      .returning();

    const [region] = await db
      .insert(organisations)
      .values({
        tenantId: demoTenant.id,
        parentId: pays!.id,
        code: 'REG-IDF',
        name: 'Île-de-France',
        level: 'region',
        levelDepth: 2,
        path: 'grp_demo.pay_fr.reg_idf',
      })
      .returning();

    const [base] = await db
      .insert(organisations)
      .values({
        tenantId: demoTenant.id,
        parentId: region!.id,
        code: 'BASE-PARIS',
        name: 'Base Paris',
        level: 'base',
        levelDepth: 3,
        path: 'grp_demo.pay_fr.reg_idf.base_paris',
      })
      .returning();

    // 5. Populate closure table
    const orgNodes = [groupe!, pays!, region!, base!];
    const closureRows: Array<{ ancestorId: string; descendantId: string; depth: number }> = [];

    for (const node of orgNodes) {
      closureRows.push({ ancestorId: node.id, descendantId: node.id, depth: 0 });
    }
    closureRows.push({ ancestorId: groupe!.id, descendantId: pays!.id, depth: 1 });
    closureRows.push({ ancestorId: groupe!.id, descendantId: region!.id, depth: 2 });
    closureRows.push({ ancestorId: groupe!.id, descendantId: base!.id, depth: 3 });
    closureRows.push({ ancestorId: pays!.id, descendantId: region!.id, depth: 1 });
    closureRows.push({ ancestorId: pays!.id, descendantId: base!.id, depth: 2 });
    closureRows.push({ ancestorId: region!.id, descendantId: base!.id, depth: 1 });

    await db.insert(organisationClosure).values(closureRows).onConflictDoNothing();
    console.warn('[seed] Populated closure table');

    // 6. Create demo admin user (placeholder hash - will be replaced in auth module)
    const [adminUser] = await db
      .insert(users)
      .values({
        tenantId: demoTenant.id,
        organisationId: groupe!.id,
        email: 'admin@demo.chaos-dms.local',
        passwordHash: '$2b$10$placeholder_hash_replace_at_auth_impl',
        firstName: 'Admin',
        lastName: 'Demo',
        displayName: 'Admin Demo',
        status: 'active',
      })
      .returning();

    if (adminUser) {
      const superAdminRole = insertedRoles.find((r) => r.code === 'SUPER_ADMIN');
      if (superAdminRole) {
        await db.insert(userRoles).values({
          userId: adminUser.id,
          roleId: superAdminRole.id,
          organisationId: groupe!.id,
        });
      }
      console.warn(`[seed] Created admin user: ${adminUser.email}`);
    }

    // 7. Provision tenant schema
    await provisionTenant({ connectionString, schemaName: 'dms_org_1' });
    console.warn('[seed] Provisioned tenant schema dms_org_1');
  }

  console.warn('[seed] Seed complete!');
  await pool.end();
}

seed().catch((err: unknown) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
