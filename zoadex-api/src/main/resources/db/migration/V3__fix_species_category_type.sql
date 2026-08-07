-- Drop the PostgreSQL enum type and use VARCHAR instead.
-- Hibernate's @Enumerated(EnumType.STRING) works cleanly with VARCHAR
-- but requires a custom type adapter for PostgreSQL enums, which adds
-- unnecessary complexity for this project.
ALTER TABLE species ALTER COLUMN category TYPE VARCHAR(30) USING category::text;
DROP TYPE IF EXISTS species_category;
