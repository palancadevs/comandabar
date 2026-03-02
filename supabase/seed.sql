-- Seed data for ComandaApp

-- 1. Create the Super Admin Tenant (System/Platform)
INSERT INTO tenants (id, slug, name, description, plan_id, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system',
  'ComandaApp Platform',
  'Platform administration tenant',
  'enterprise',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create the "Monkey" Bar Tenant
INSERT INTO tenants (id, slug, name, description, primary_color, plan_id, subscription_status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'monkey',
  'Monkey Bar',
  'El mejor bar de la ciudad',
  '#f59e0b', -- Amber 500
  'trial',
  'trial'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Sample Tables for Monkey
INSERT INTO tables (tenant_id, name, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Mesa 1', 'libre'),
  ('11111111-1111-1111-1111-111111111111', 'Mesa 2', 'libre'),
  ('11111111-1111-1111-1111-111111111111', 'Barra 1', 'libre')
ON CONFLICT DO NOTHING;

-- Note: Users need to be created via Supabase Auth first to get their UUIDs.
-- This seed file only handles public schema data.
-- We will handle user profile insertion in a separate script or after auth signup.
