-- Decoupled Geo-Data Replacement (v1.2)
-- 2026-03-25-041500

-- 0. PRESERVE LEGACY DATA
-- Rename the existing flat table to an archival name to avoid data loss during cutover.
ALTER TABLE IF EXISTS public.school_registry RENAME TO school_registry_legacy;

-- Provide a compatibility view so existing consumers of public.school_registry continue to work.
CREATE OR REPLACE VIEW public.school_registry AS
SELECT *
FROM public.school_registry_legacy;
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. UTILITIES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. ADMINISTRATIVE HIERARCHY (FACTS)
CREATE TABLE IF NOT EXISTS geo_provinces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo_districts (
    id TEXT PRIMARY KEY,
    province_id TEXT REFERENCES geo_provinces(id),
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo_ds_divisions (
    id TEXT PRIMARY KEY,
    district_id TEXT REFERENCES geo_districts(id),
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo_gn_divisions (
    id TEXT PRIMARY KEY,
    ds_division_id TEXT REFERENCES geo_ds_divisions(id),
    district_id TEXT REFERENCES geo_districts(id),
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    gn_code TEXT,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo_postal_towns (
    id TEXT PRIMARY KEY,
    district_id TEXT REFERENCES geo_districts(id),
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CORE SCHOOL REGISTRY (FACTS)
CREATE TABLE IF NOT EXISTS edu_schools (
    id TEXT PRIMARY KEY, -- SCH_{census_id}
    census_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT, -- Mixed, Boys, Girls
    category TEXT, -- National, Provincial
    type_code TEXT, -- 1AB, 1C, Type 2, Type 3
    
    -- Administrative Location
    province_id TEXT REFERENCES geo_provinces(id),
    district_id TEXT REFERENCES geo_districts(id),
    gn_division_id TEXT REFERENCES geo_gn_divisions(id),
    postal_unit_id TEXT REFERENCES geo_postal_towns(id),
    
    -- Educational Jurisdiction
    zone_id TEXT,
    division_id TEXT,
    
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCHOOL STATS (VOLATILE REGISTRY)
CREATE TABLE IF NOT EXISTS edu_school_registry_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT REFERENCES edu_schools(id) ON DELETE CASCADE,
    academic_year INTEGER NOT NULL DEFAULT extract(year from now()),
    total_students INTEGER DEFAULT 0,
    medium TEXT,
    grade_span TEXT,
    difficulty_level TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, academic_year)
);

-- 6. TIERED CONTACTS (LAYERED)
CREATE TABLE IF NOT EXISTS edu_school_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT REFERENCES edu_schools(id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL, -- 'OFFICIAL', 'PRINCIPAL', 'OFFICE'
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRIGGERS
CREATE TRIGGER tr_u_geo_provinces BEFORE UPDATE ON geo_provinces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_geo_districts BEFORE UPDATE ON geo_districts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_geo_ds_divisions BEFORE UPDATE ON geo_ds_divisions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_geo_gn_divisions BEFORE UPDATE ON geo_gn_divisions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_geo_postal_towns BEFORE UPDATE ON geo_postal_towns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_edu_schools BEFORE UPDATE ON edu_schools FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_edu_school_stats BEFORE UPDATE ON edu_school_registry_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_u_edu_school_contacts BEFORE UPDATE ON edu_school_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. RLS POLICIES (Full Public Discovery)
ALTER TABLE geo_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_ds_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_gn_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_postal_towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_school_registry_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_school_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to geo metadata" ON geo_provinces FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON geo_districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON geo_ds_divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON geo_gn_divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON geo_postal_towns FOR SELECT USING (true);
CREATE POLICY "Allow public read access to schooling factual data" ON edu_schools FOR SELECT USING (true);
CREATE POLICY "Allow public read access to school stats" ON edu_school_registry_stats FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read access to school contacts" ON edu_school_contacts
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_edu_schools_name_trgm ON edu_schools USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_edu_schools_location ON edu_schools USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_school_stats_year ON edu_school_registry_stats(academic_year);
CREATE INDEX IF NOT EXISTS idx_school_contacts_school ON edu_school_contacts(school_id);
