ALTER TABLE species ADD COLUMN IF NOT EXISTS name_it VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_es VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_de VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_zh VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_ja VARCHAR(255);

-- Migrate existing common_name_local data to name_it
UPDATE species SET name_it = common_name_local WHERE common_name_local IS NOT NULL;
