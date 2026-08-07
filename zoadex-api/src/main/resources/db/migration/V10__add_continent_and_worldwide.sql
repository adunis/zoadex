-- Add continent column
ALTER TABLE regions ADD COLUMN IF NOT EXISTS continent VARCHAR(50);

-- Update existing regions
UPDATE regions SET continent = 'Europe' WHERE country = 'Italy';
UPDATE regions SET continent = 'Europe' WHERE country IN ('France','Spain','Germany','United Kingdom','Portugal','Austria','Switzerland','Netherlands','Belgium','Greece','Poland','Czech Republic','Sweden','Norway','Denmark','Finland','Ireland','Croatia','Romania','Hungary');
UPDATE regions SET continent = 'North America' WHERE country = 'United States';

-- South America (major countries as single regions)
INSERT INTO regions (id, name, country, continent, admin_level, boundary, species_count, created_at) VALUES
('a1100001-0000-0000-0000-000000000001', 'Brazil', 'Brazil', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-74 -34, -35 -34, -35 5, -74 5, -74 -34)))', 4326), 0, NOW()),
('a1100002-0000-0000-0000-000000000002', 'Argentina', 'Argentina', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-73 -55, -53 -55, -53 -22, -73 -22, -73 -55)))', 4326), 0, NOW()),
('a1100003-0000-0000-0000-000000000003', 'Colombia', 'Colombia', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-79 -4, -67 -4, -67 13, -79 13, -79 -4)))', 4326), 0, NOW()),
('a1100004-0000-0000-0000-000000000004', 'Peru', 'Peru', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-81 -18, -69 -18, -69 0, -81 0, -81 -18)))', 4326), 0, NOW()),
('a1100005-0000-0000-0000-000000000005', 'Chile', 'Chile', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-76 -56, -66 -56, -66 -17, -76 -17, -76 -56)))', 4326), 0, NOW()),
('a1100006-0000-0000-0000-000000000006', 'Ecuador', 'Ecuador', 'South America', 2, ST_GeomFromText('MULTIPOLYGON(((-81 -5, -75 -5, -75 2, -81 2, -81 -5)))', 4326), 0, NOW()),
('a1100007-0000-0000-0000-000000000007', 'Costa Rica', 'Costa Rica', 'North America', 2, ST_GeomFromText('MULTIPOLYGON(((-86 8, -82 8, -82 11, -86 11, -86 8)))', 4326), 0, NOW()),
('a1100008-0000-0000-0000-000000000008', 'Mexico', 'Mexico', 'North America', 2, ST_GeomFromText('MULTIPOLYGON(((-118 14, -86 14, -86 33, -118 33, -118 14)))', 4326), 0, NOW()),
('a1100009-0000-0000-0000-000000000009', 'Canada', 'Canada', 'North America', 2, ST_GeomFromText('MULTIPOLYGON(((-141 42, -52 42, -52 70, -141 70, -141 42)))', 4326), 0, NOW()),

-- Asia
('a2200001-0000-0000-0000-000000000001', 'Japan', 'Japan', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((129 30, 146 30, 146 46, 129 46, 129 30)))', 4326), 0, NOW()),
('a2200002-0000-0000-0000-000000000002', 'South Korea', 'South Korea', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((125 33, 130 33, 130 39, 125 39, 125 33)))', 4326), 0, NOW()),
('a2200003-0000-0000-0000-000000000003', 'India', 'India', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((68 6, 97 6, 97 36, 68 36, 68 6)))', 4326), 0, NOW()),
('a2200004-0000-0000-0000-000000000004', 'Thailand', 'Thailand', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((97 5, 106 5, 106 21, 97 21, 97 5)))', 4326), 0, NOW()),
('a2200005-0000-0000-0000-000000000005', 'Indonesia', 'Indonesia', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((95 -11, 141 -11, 141 6, 95 6, 95 -11)))', 4326), 0, NOW()),
('a2200006-0000-0000-0000-000000000006', 'China', 'China', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((73 18, 135 18, 135 54, 73 54, 73 18)))', 4326), 0, NOW()),
('a2200007-0000-0000-0000-000000000007', 'Turkey', 'Turkey', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((26 36, 45 36, 45 42, 26 42, 26 36)))', 4326), 0, NOW()),
('a2200008-0000-0000-0000-000000000008', 'Israel', 'Israel', 'Asia', 2, ST_GeomFromText('MULTIPOLYGON(((34 29, 36 29, 36 34, 34 34, 34 29)))', 4326), 0, NOW()),

-- Africa
('a3300001-0000-0000-0000-000000000001', 'South Africa', 'South Africa', 'Africa', 2, ST_GeomFromText('MULTIPOLYGON(((16 -35, 33 -35, 33 -22, 16 -22, 16 -35)))', 4326), 0, NOW()),
('a3300002-0000-0000-0000-000000000002', 'Kenya', 'Kenya', 'Africa', 2, ST_GeomFromText('MULTIPOLYGON(((34 -5, 42 -5, 42 5, 34 5, 34 -5)))', 4326), 0, NOW()),
('a3300003-0000-0000-0000-000000000003', 'Tanzania', 'Tanzania', 'Africa', 2, ST_GeomFromText('MULTIPOLYGON(((29 -12, 41 -12, 41 -1, 29 -1, 29 -12)))', 4326), 0, NOW()),
('a3300004-0000-0000-0000-000000000004', 'Morocco', 'Morocco', 'Africa', 2, ST_GeomFromText('MULTIPOLYGON(((-13 27, -1 27, -1 36, -13 36, -13 27)))', 4326), 0, NOW()),
('a3300005-0000-0000-0000-000000000005', 'Madagascar', 'Madagascar', 'Africa', 2, ST_GeomFromText('MULTIPOLYGON(((43 -26, 51 -26, 51 -12, 43 -12, 43 -26)))', 4326), 0, NOW()),

-- Oceania
('a4400001-0000-0000-0000-000000000001', 'Australia', 'Australia', 'Oceania', 2, ST_GeomFromText('MULTIPOLYGON(((113 -44, 154 -44, 154 -10, 113 -10, 113 -44)))', 4326), 0, NOW()),
('a4400002-0000-0000-0000-000000000002', 'New Zealand', 'New Zealand', 'Oceania', 2, ST_GeomFromText('MULTIPOLYGON(((166 -47, 179 -47, 179 -34, 166 -34, 166 -47)))', 4326), 0, NOW());

