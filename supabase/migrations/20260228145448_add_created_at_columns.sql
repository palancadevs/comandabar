-- Add created_at columns to tables missing them
ALTER TABLE menu_categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE menu_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE tables ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
