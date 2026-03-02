-- Add unique constraint to tables for (tenant_id, name) to allow UPSERT
ALTER TABLE tables ADD CONSTRAINT tables_tenant_id_name_key UNIQUE (tenant_id, name);
