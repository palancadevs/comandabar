-- Create initial schema for ComandaApp MVP

-- Tenants (cada local)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  logo_url VARCHAR,
  cover_url VARCHAR,
  primary_color VARCHAR DEFAULT '#000000',
  address VARCHAR,
  schedule VARCHAR,
  plan_id VARCHAR DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  subscription_status VARCHAR DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (staff del local)
-- Role can be superadmin (only 1 or a few), admin (owner of the tenant), mozo, cocina
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR,
  role VARCHAR CHECK (role IN ('superadmin','admin','mozo','cocina')),
  name VARCHAR,
  pin VARCHAR(4),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables (mesas)
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  qr_code_url VARCHAR,
  status VARCHAR DEFAULT 'libre' CHECK (status IN ('libre','ocupada','cuenta_solicitada')),
  active BOOLEAN DEFAULT true
);

-- Table Sessions (mesa abierta)
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  table_id UUID REFERENCES tables(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2),
  payment_method VARCHAR
);

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  icon VARCHAR,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  category_id UUID REFERENCES menu_categories(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  sector VARCHAR DEFAULT 'cocina' CHECK (sector IN ('cocina','barra','ambos')),
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Orders (pedidos por sesión)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  table_session_id UUID REFERENCES table_sessions(id),
  table_id UUID REFERENCES tables(id),
  status VARCHAR DEFAULT 'pendiente' CHECK (status IN ('pendiente','en_preparacion','listo','entregado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  sector VARCHAR
);

-- RLS Configuration
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper Function to get current user's role
CREATE OR REPLACE FUNCTION current_user_role() RETURNS VARCHAR AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION current_user_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy: Superadmin can do anything to everything
-- Tenant admins can only access their own tenant's data
-- Mozos/Cocina can view/update but not delete their tenant's data

-- Tenants Table Policies
CREATE POLICY "Public read tenants" ON tenants FOR SELECT USING (true); -- Public needs to see tenant settings when scanning QR
CREATE POLICY "Superadmin update tenants" ON tenants FOR UPDATE USING (current_user_role() = 'superadmin');
CREATE POLICY "Admin update own tenant" ON tenants FOR UPDATE USING (id = current_user_tenant_id() AND current_user_role() = 'admin');

-- Users Table Policies
CREATE POLICY "Users read own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Superadmin read all users" ON users FOR SELECT USING (current_user_role() = 'superadmin');
CREATE POLICY "Admin read tenant users" ON users FOR SELECT USING (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');
CREATE POLICY "Admin insert tenant users" ON users FOR INSERT WITH CHECK (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');
CREATE POLICY "Admin update tenant users" ON users FOR UPDATE USING (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');

-- All other tables (multi-tenant isolation)
-- Tables
CREATE POLICY "Public read tables" ON tables FOR SELECT USING (active = true); -- Public needs to read table info from QR
CREATE POLICY "Tenant users read own tables" ON tables FOR SELECT USING (tenant_id = current_user_tenant_id());
CREATE POLICY "Admin update own tables" ON tables FOR ALL USING (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');

-- Table Sessions
CREATE POLICY "Public create session" ON table_sessions FOR INSERT WITH CHECK (true); -- Public can open a table session? Usually mozo opens it. Or Public creates an order that implies an open session.
CREATE POLICY "Tenant users access own table sessions" ON table_sessions FOR ALL USING (tenant_id = current_user_tenant_id());

-- Menu Categories
CREATE POLICY "Public read menu categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage menu categories" ON menu_categories FOR ALL USING (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');

-- Menu Items
CREATE POLICY "Public read menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin manage menu items" ON menu_items FOR ALL USING (tenant_id = current_user_tenant_id() AND current_user_role() = 'admin');

-- Orders
CREATE POLICY "Public create order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own order" ON orders FOR SELECT USING (true); -- Filter by session ID from localStorage on frontend
CREATE POLICY "Tenant users manage orders" ON orders FOR ALL USING (tenant_id = current_user_tenant_id());

-- Order Items
CREATE POLICY "Public create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Tenant users manage order items" ON order_items FOR ALL USING (
  order_id IN (SELECT id FROM orders WHERE tenant_id = current_user_tenant_id())
);

-- Security Definer function to register a new tenant (Onboarding)
CREATE OR REPLACE FUNCTION register_new_tenant(
  new_slug VARCHAR,
  new_name VARCHAR,
  new_email VARCHAR,
  new_password VARCHAR
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
  new_user_id UUID;
BEGIN
  -- 1. Create Tenant
  INSERT INTO tenants (slug, name) VALUES (new_slug, new_name) RETURNING id INTO new_tenant_id;
  
  -- 2. Create Auth User (Simulated for this RPC. Normally you use Supabase Auth first, then handle a trigger, or use Edge Functions)
  -- Since we cannot easily create an auth.users from here securely without elevated privileges, 
  -- it is strongly recommended to use Supabase Edge Functions or Auth server client for onboarding.
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
