-- All 20 Italian Regions (excluding Emilia-Romagna which already exists)

INSERT INTO regions (id, name, country, admin_level, boundary, species_count, created_at) VALUES
-- Northern Italy
('b1000001-0000-0000-0000-000000000001', 'Piemonte', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((6.6 44.0, 9.2 44.0, 9.2 46.5, 6.6 46.5, 6.6 44.0)))', 4326), 0, NOW()),

('b1000002-0000-0000-0000-000000000002', 'Valle d''Aosta', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((6.8 45.5, 7.9 45.5, 7.9 46.0, 6.8 46.0, 6.8 45.5)))', 4326), 0, NOW()),

('b1000003-0000-0000-0000-000000000003', 'Lombardia', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((8.5 44.7, 11.4 44.7, 11.4 46.6, 8.5 46.6, 8.5 44.7)))', 4326), 0, NOW()),

('b1000004-0000-0000-0000-000000000004', 'Trentino-Alto Adige', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((10.4 45.7, 12.5 45.7, 12.5 47.1, 10.4 47.1, 10.4 45.7)))', 4326), 0, NOW()),

('b1000005-0000-0000-0000-000000000005', 'Veneto', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((10.6 44.8, 13.1 44.8, 13.1 46.7, 10.6 46.7, 10.6 44.8)))', 4326), 0, NOW()),

('b1000006-0000-0000-0000-000000000006', 'Friuli Venezia Giulia', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((12.3 45.6, 13.9 45.6, 13.9 46.7, 12.3 46.7, 12.3 45.6)))', 4326), 0, NOW()),

('b1000007-0000-0000-0000-000000000007', 'Liguria', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((7.5 43.8, 10.1 43.8, 10.1 44.7, 7.5 44.7, 7.5 43.8)))', 4326), 0, NOW()),

-- Central Italy
('b1000008-0000-0000-0000-000000000008', 'Toscana', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((9.7 42.2, 12.4 42.2, 12.4 44.5, 9.7 44.5, 9.7 42.2)))', 4326), 0, NOW()),

('b1000009-0000-0000-0000-000000000009', 'Umbria', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((12.0 42.3, 13.3 42.3, 13.3 43.6, 12.0 43.6, 12.0 42.3)))', 4326), 0, NOW()),

('b1000010-0000-0000-0000-000000000010', 'Marche', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((12.1 42.7, 13.9 42.7, 13.9 43.9, 12.1 43.9, 12.1 42.7)))', 4326), 0, NOW()),

('b1000011-0000-0000-0000-000000000011', 'Lazio', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((11.4 41.2, 14.0 41.2, 14.0 42.8, 11.4 42.8, 11.4 41.2)))', 4326), 0, NOW()),

('b1000012-0000-0000-0000-000000000012', 'Abruzzo', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((13.0 41.7, 14.8 41.7, 14.8 42.9, 13.0 42.9, 13.0 41.7)))', 4326), 0, NOW()),

('b1000013-0000-0000-0000-000000000013', 'Molise', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((14.0 41.4, 15.2 41.4, 15.2 42.1, 14.0 42.1, 14.0 41.4)))', 4326), 0, NOW()),

-- Southern Italy
('b1000014-0000-0000-0000-000000000014', 'Campania', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((13.8 40.0, 15.8 40.0, 15.8 41.5, 13.8 41.5, 13.8 40.0)))', 4326), 0, NOW()),

('b1000015-0000-0000-0000-000000000015', 'Puglia', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((15.0 39.8, 18.5 39.8, 18.5 42.2, 15.0 42.2, 15.0 39.8)))', 4326), 0, NOW()),

('b1000016-0000-0000-0000-000000000016', 'Basilicata', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((15.3 39.9, 16.9 39.9, 16.9 41.1, 15.3 41.1, 15.3 39.9)))', 4326), 0, NOW()),

('b1000017-0000-0000-0000-000000000017', 'Calabria', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((15.6 37.9, 17.1 37.9, 17.1 39.9, 15.6 39.9, 15.6 37.9)))', 4326), 0, NOW()),

-- Islands
('b1000018-0000-0000-0000-000000000018', 'Sicilia', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((12.4 36.6, 15.7 36.6, 15.7 38.3, 12.4 38.3, 12.4 36.6)))', 4326), 0, NOW()),

('b1000019-0000-0000-0000-000000000019', 'Sardegna', 'Italy', 4,
 ST_GeomFromText('MULTIPOLYGON(((8.1 38.8, 9.8 38.8, 9.8 41.3, 8.1 41.3, 8.1 38.8)))', 4326), 0, NOW());
