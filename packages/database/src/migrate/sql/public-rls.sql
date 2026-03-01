-- RLS policies for the public schema

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_super_admin_all ON public.users
  FOR ALL
  USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY users_tenant_isolation ON public.users
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_roles_tenant_isolation ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = user_roles.user_id
      AND u.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );

-- Enable RLS on organisations
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_tenant_isolation ON public.organisations
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY org_super_admin_all ON public.organisations
  FOR ALL
  USING (current_setting('app.role', true) = 'SUPER_ADMIN');
