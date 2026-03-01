-- RLS policies for tenant schema tables

-- Audit logs: append-only (INSERT + SELECT only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_insert_only ON audit_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY audit_logs_read ON audit_logs
  FOR SELECT
  USING (true);

-- Anomalies: org-scoped access via closure table
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY anomalies_org_access ON anomalies
  FOR ALL
  USING (
    organisation_id IN (
      SELECT descendant_id FROM public.organisation_closure oc
      WHERE oc.ancestor_id = current_setting('app.organisation_id', true)::uuid
    )
    OR current_setting('app.role', true) IN ('SUPER_ADMIN', 'ADMIN_PAYS', 'ADMIN_REGION')
  );

-- Action plans: org-scoped access
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY action_plans_org_access ON action_plans
  FOR ALL
  USING (
    organisation_id IN (
      SELECT descendant_id FROM public.organisation_closure oc
      WHERE oc.ancestor_id = current_setting('app.organisation_id', true)::uuid
    )
    OR current_setting('app.role', true) IN ('SUPER_ADMIN', 'ADMIN_PAYS', 'ADMIN_REGION')
  );
