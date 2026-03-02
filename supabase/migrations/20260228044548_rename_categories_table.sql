-- Rename categories to menu_categories to match PRD and ensure consistency
-- If 'categories' exists, rename it. If 'menu_categories' exists, we are good.

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE categories RENAME TO menu_categories;
    END IF;
END $$;
