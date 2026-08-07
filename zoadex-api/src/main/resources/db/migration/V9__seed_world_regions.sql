-- European countries (admin_level 2) and US states (admin_level 4)

-- =============================================
-- EUROPEAN COUNTRIES (20 major countries)
-- =============================================

INSERT INTO regions (id, name, country, admin_level, boundary, species_count, created_at) VALUES
('c1000001-0000-0000-0000-000000000001', 'France', 'France', 2,
 ST_GeomFromText('MULTIPOLYGON(((-5.1 42.3, 8.2 42.3, 8.2 51.1, -5.1 51.1, -5.1 42.3)))', 4326), 0, NOW()),

('c1000002-0000-0000-0000-000000000002', 'Spain', 'Spain', 2,
 ST_GeomFromText('MULTIPOLYGON(((-9.3 36.0, 3.3 36.0, 3.3 43.8, -9.3 43.8, -9.3 36.0)))', 4326), 0, NOW()),

('c1000003-0000-0000-0000-000000000003', 'Germany', 'Germany', 2,
 ST_GeomFromText('MULTIPOLYGON(((5.9 47.3, 15.0 47.3, 15.0 55.1, 5.9 55.1, 5.9 47.3)))', 4326), 0, NOW()),

('c1000004-0000-0000-0000-000000000004', 'United Kingdom', 'United Kingdom', 2,
 ST_GeomFromText('MULTIPOLYGON(((-8.2 49.9, 1.8 49.9, 1.8 60.8, -8.2 60.8, -8.2 49.9)))', 4326), 0, NOW()),

('c1000005-0000-0000-0000-000000000005', 'Portugal', 'Portugal', 2,
 ST_GeomFromText('MULTIPOLYGON(((-9.5 36.9, -6.2 36.9, -6.2 42.2, -9.5 42.2, -9.5 36.9)))', 4326), 0, NOW()),

('c1000006-0000-0000-0000-000000000006', 'Austria', 'Austria', 2,
 ST_GeomFromText('MULTIPOLYGON(((9.5 46.4, 17.2 46.4, 17.2 49.0, 9.5 49.0, 9.5 46.4)))', 4326), 0, NOW()),

('c1000007-0000-0000-0000-000000000007', 'Switzerland', 'Switzerland', 2,
 ST_GeomFromText('MULTIPOLYGON(((5.9 45.8, 10.5 45.8, 10.5 47.8, 5.9 47.8, 5.9 45.8)))', 4326), 0, NOW()),

('c1000008-0000-0000-0000-000000000008', 'Netherlands', 'Netherlands', 2,
 ST_GeomFromText('MULTIPOLYGON(((3.4 50.8, 7.2 50.8, 7.2 53.5, 3.4 53.5, 3.4 50.8)))', 4326), 0, NOW()),

('c1000009-0000-0000-0000-000000000009', 'Belgium', 'Belgium', 2,
 ST_GeomFromText('MULTIPOLYGON(((2.5 49.5, 6.4 49.5, 6.4 51.5, 2.5 51.5, 2.5 49.5)))', 4326), 0, NOW()),

('c1000010-0000-0000-0000-000000000010', 'Greece', 'Greece', 2,
 ST_GeomFromText('MULTIPOLYGON(((19.4 34.8, 29.6 34.8, 29.6 41.7, 19.4 41.7, 19.4 34.8)))', 4326), 0, NOW()),

('c1000011-0000-0000-0000-000000000011', 'Poland', 'Poland', 2,
 ST_GeomFromText('MULTIPOLYGON(((14.1 49.0, 24.2 49.0, 24.2 54.8, 14.1 54.8, 14.1 49.0)))', 4326), 0, NOW()),

('c1000012-0000-0000-0000-000000000012', 'Czech Republic', 'Czech Republic', 2,
 ST_GeomFromText('MULTIPOLYGON(((12.1 48.6, 18.9 48.6, 18.9 51.1, 12.1 51.1, 12.1 48.6)))', 4326), 0, NOW()),

('c1000013-0000-0000-0000-000000000013', 'Sweden', 'Sweden', 2,
 ST_GeomFromText('MULTIPOLYGON(((11.1 55.3, 24.2 55.3, 24.2 69.1, 11.1 69.1, 11.1 55.3)))', 4326), 0, NOW()),

('c1000014-0000-0000-0000-000000000014', 'Norway', 'Norway', 2,
 ST_GeomFromText('MULTIPOLYGON(((4.6 57.9, 31.1 57.9, 31.1 71.2, 4.6 71.2, 4.6 57.9)))', 4326), 0, NOW()),

('c1000015-0000-0000-0000-000000000015', 'Denmark', 'Denmark', 2,
 ST_GeomFromText('MULTIPOLYGON(((8.1 54.6, 15.2 54.6, 15.2 57.8, 8.1 57.8, 8.1 54.6)))', 4326), 0, NOW()),

('c1000016-0000-0000-0000-000000000016', 'Finland', 'Finland', 2,
 ST_GeomFromText('MULTIPOLYGON(((20.6 59.8, 31.6 59.8, 31.6 70.1, 20.6 70.1, 20.6 59.8)))', 4326), 0, NOW()),

('c1000017-0000-0000-0000-000000000017', 'Ireland', 'Ireland', 2,
 ST_GeomFromText('MULTIPOLYGON(((-10.5 51.4, -6.0 51.4, -6.0 55.4, -10.5 55.4, -10.5 51.4)))', 4326), 0, NOW()),

('c1000018-0000-0000-0000-000000000018', 'Croatia', 'Croatia', 2,
 ST_GeomFromText('MULTIPOLYGON(((13.5 42.4, 19.4 42.4, 19.4 46.6, 13.5 46.6, 13.5 42.4)))', 4326), 0, NOW()),

('c1000019-0000-0000-0000-000000000019', 'Romania', 'Romania', 2,
 ST_GeomFromText('MULTIPOLYGON(((20.3 43.6, 29.7 43.6, 29.7 48.3, 20.3 48.3, 20.3 43.6)))', 4326), 0, NOW()),

('c1000020-0000-0000-0000-000000000020', 'Hungary', 'Hungary', 2,
 ST_GeomFromText('MULTIPOLYGON(((16.1 45.7, 22.9 45.7, 22.9 48.6, 16.1 48.6, 16.1 45.7)))', 4326), 0, NOW());

-- =============================================
-- UNITED STATES - All 50 States (admin_level 4)
-- =============================================

INSERT INTO regions (id, name, country, admin_level, boundary, species_count, created_at) VALUES
('d1000001-0000-0000-0000-000000000001', 'Alabama', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-88.5 30.2, -84.9 30.2, -84.9 35.0, -88.5 35.0, -88.5 30.2)))', 4326), 0, NOW()),

('d1000002-0000-0000-0000-000000000002', 'Alaska', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-179.1 51.2, -130.0 51.2, -130.0 71.4, -179.1 71.4, -179.1 51.2)))', 4326), 0, NOW()),

('d1000003-0000-0000-0000-000000000003', 'Arizona', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-114.8 31.3, -109.0 31.3, -109.0 37.0, -114.8 37.0, -114.8 31.3)))', 4326), 0, NOW()),

('d1000004-0000-0000-0000-000000000004', 'Arkansas', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-94.6 33.0, -89.6 33.0, -89.6 36.5, -94.6 36.5, -94.6 33.0)))', 4326), 0, NOW()),

('d1000005-0000-0000-0000-000000000005', 'California', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-124.4 32.5, -114.1 32.5, -114.1 42.0, -124.4 42.0, -124.4 32.5)))', 4326), 0, NOW()),

('d1000006-0000-0000-0000-000000000006', 'Colorado', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-109.1 37.0, -102.0 37.0, -102.0 41.0, -109.1 41.0, -109.1 37.0)))', 4326), 0, NOW()),

('d1000007-0000-0000-0000-000000000007', 'Connecticut', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-73.7 41.0, -71.8 41.0, -71.8 42.1, -73.7 42.1, -73.7 41.0)))', 4326), 0, NOW()),

('d1000008-0000-0000-0000-000000000008', 'Delaware', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-75.8 38.5, -75.0 38.5, -75.0 39.8, -75.8 39.8, -75.8 38.5)))', 4326), 0, NOW()),

('d1000009-0000-0000-0000-000000000009', 'Florida', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-87.6 24.5, -80.0 24.5, -80.0 31.0, -87.6 31.0, -87.6 24.5)))', 4326), 0, NOW()),

('d1000010-0000-0000-0000-000000000010', 'Georgia', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-85.6 30.4, -80.8 30.4, -80.8 35.0, -85.6 35.0, -85.6 30.4)))', 4326), 0, NOW()),

('d1000011-0000-0000-0000-000000000011', 'Hawaii', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-160.2 18.9, -154.8 18.9, -154.8 22.2, -160.2 22.2, -160.2 18.9)))', 4326), 0, NOW()),

('d1000012-0000-0000-0000-000000000012', 'Idaho', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-117.2 42.0, -111.0 42.0, -111.0 49.0, -117.2 49.0, -117.2 42.0)))', 4326), 0, NOW()),

('d1000013-0000-0000-0000-000000000013', 'Illinois', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-91.5 37.0, -87.5 37.0, -87.5 42.5, -91.5 42.5, -91.5 37.0)))', 4326), 0, NOW()),

('d1000014-0000-0000-0000-000000000014', 'Indiana', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-88.1 37.8, -84.8 37.8, -84.8 41.8, -88.1 41.8, -88.1 37.8)))', 4326), 0, NOW()),

('d1000015-0000-0000-0000-000000000015', 'Iowa', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-96.6 40.4, -90.1 40.4, -90.1 43.5, -96.6 43.5, -96.6 40.4)))', 4326), 0, NOW()),

('d1000016-0000-0000-0000-000000000016', 'Kansas', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-102.1 37.0, -94.6 37.0, -94.6 40.0, -102.1 40.0, -102.1 37.0)))', 4326), 0, NOW()),

('d1000017-0000-0000-0000-000000000017', 'Kentucky', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-89.6 36.5, -82.0 36.5, -82.0 39.1, -89.6 39.1, -89.6 36.5)))', 4326), 0, NOW()),

('d1000018-0000-0000-0000-000000000018', 'Louisiana', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-94.0 29.0, -89.0 29.0, -89.0 33.0, -94.0 33.0, -94.0 29.0)))', 4326), 0, NOW()),

('d1000019-0000-0000-0000-000000000019', 'Maine', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-71.1 43.1, -67.0 43.1, -67.0 47.5, -71.1 47.5, -71.1 43.1)))', 4326), 0, NOW()),

('d1000020-0000-0000-0000-000000000020', 'Maryland', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-79.5 38.0, -75.0 38.0, -75.0 39.7, -79.5 39.7, -79.5 38.0)))', 4326), 0, NOW()),

('d1000021-0000-0000-0000-000000000021', 'Massachusetts', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-73.5 41.2, -69.9 41.2, -69.9 42.9, -73.5 42.9, -73.5 41.2)))', 4326), 0, NOW()),

('d1000022-0000-0000-0000-000000000022', 'Michigan', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-90.4 41.7, -82.4 41.7, -82.4 48.3, -90.4 48.3, -90.4 41.7)))', 4326), 0, NOW()),

('d1000023-0000-0000-0000-000000000023', 'Minnesota', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-97.2 43.5, -89.5 43.5, -89.5 49.4, -97.2 49.4, -97.2 43.5)))', 4326), 0, NOW()),

('d1000024-0000-0000-0000-000000000024', 'Mississippi', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-91.7 30.2, -88.1 30.2, -88.1 35.0, -91.7 35.0, -91.7 30.2)))', 4326), 0, NOW()),

('d1000025-0000-0000-0000-000000000025', 'Missouri', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-95.8 36.0, -89.1 36.0, -89.1 40.6, -95.8 40.6, -95.8 36.0)))', 4326), 0, NOW()),

('d1000026-0000-0000-0000-000000000026', 'Montana', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-116.0 44.4, -104.0 44.4, -104.0 49.0, -116.0 49.0, -116.0 44.4)))', 4326), 0, NOW()),

('d1000027-0000-0000-0000-000000000027', 'Nebraska', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-104.1 40.0, -95.3 40.0, -95.3 43.0, -104.1 43.0, -104.1 40.0)))', 4326), 0, NOW()),

('d1000028-0000-0000-0000-000000000028', 'Nevada', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-120.0 35.0, -114.0 35.0, -114.0 42.0, -120.0 42.0, -120.0 35.0)))', 4326), 0, NOW()),

('d1000029-0000-0000-0000-000000000029', 'New Hampshire', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-72.6 42.7, -70.7 42.7, -70.7 45.3, -72.6 45.3, -72.6 42.7)))', 4326), 0, NOW()),

('d1000030-0000-0000-0000-000000000030', 'New Jersey', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-75.6 38.9, -74.0 38.9, -74.0 41.4, -75.6 41.4, -75.6 38.9)))', 4326), 0, NOW()),

('d1000031-0000-0000-0000-000000000031', 'New Mexico', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-109.0 31.3, -103.0 31.3, -103.0 37.0, -109.0 37.0, -109.0 31.3)))', 4326), 0, NOW()),

('d1000032-0000-0000-0000-000000000032', 'New York', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-79.8 40.5, -71.9 40.5, -71.9 45.0, -79.8 45.0, -79.8 40.5)))', 4326), 0, NOW()),

('d1000033-0000-0000-0000-000000000033', 'North Carolina', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-84.3 33.8, -75.5 33.8, -75.5 36.6, -84.3 36.6, -84.3 33.8)))', 4326), 0, NOW()),

('d1000034-0000-0000-0000-000000000034', 'North Dakota', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-104.0 45.9, -96.6 45.9, -96.6 49.0, -104.0 49.0, -104.0 45.9)))', 4326), 0, NOW()),

('d1000035-0000-0000-0000-000000000035', 'Ohio', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-84.8 38.4, -80.5 38.4, -80.5 42.0, -84.8 42.0, -84.8 38.4)))', 4326), 0, NOW()),

('d1000036-0000-0000-0000-000000000036', 'Oklahoma', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-103.0 33.6, -94.4 33.6, -94.4 37.0, -103.0 37.0, -103.0 33.6)))', 4326), 0, NOW()),

('d1000037-0000-0000-0000-000000000037', 'Oregon', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-124.6 42.0, -116.5 42.0, -116.5 46.3, -124.6 46.3, -124.6 42.0)))', 4326), 0, NOW()),

('d1000038-0000-0000-0000-000000000038', 'Pennsylvania', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-80.5 39.7, -75.0 39.7, -75.0 42.3, -80.5 42.3, -80.5 39.7)))', 4326), 0, NOW()),

('d1000039-0000-0000-0000-000000000039', 'Rhode Island', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-71.9 41.1, -71.1 41.1, -71.1 42.0, -71.9 42.0, -71.9 41.1)))', 4326), 0, NOW()),

('d1000040-0000-0000-0000-000000000040', 'South Carolina', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-83.4 32.0, -78.5 32.0, -78.5 35.2, -83.4 35.2, -83.4 32.0)))', 4326), 0, NOW()),

('d1000041-0000-0000-0000-000000000041', 'South Dakota', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-104.1 42.5, -96.4 42.5, -96.4 46.0, -104.1 46.0, -104.1 42.5)))', 4326), 0, NOW()),

('d1000042-0000-0000-0000-000000000042', 'Tennessee', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-90.3 35.0, -81.6 35.0, -81.6 36.7, -90.3 36.7, -90.3 35.0)))', 4326), 0, NOW()),

('d1000043-0000-0000-0000-000000000043', 'Texas', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-106.6 25.8, -93.5 25.8, -93.5 36.5, -106.6 36.5, -106.6 25.8)))', 4326), 0, NOW()),

('d1000044-0000-0000-0000-000000000044', 'Utah', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-114.1 37.0, -109.0 37.0, -109.0 42.0, -114.1 42.0, -114.1 37.0)))', 4326), 0, NOW()),

('d1000045-0000-0000-0000-000000000045', 'Vermont', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-73.4 42.7, -71.5 42.7, -71.5 45.0, -73.4 45.0, -73.4 42.7)))', 4326), 0, NOW()),

('d1000046-0000-0000-0000-000000000046', 'Virginia', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-83.7 36.5, -75.2 36.5, -75.2 39.5, -83.7 39.5, -83.7 36.5)))', 4326), 0, NOW()),

('d1000047-0000-0000-0000-000000000047', 'Washington', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-124.7 45.5, -116.9 45.5, -116.9 49.0, -124.7 49.0, -124.7 45.5)))', 4326), 0, NOW()),

('d1000048-0000-0000-0000-000000000048', 'West Virginia', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-82.6 37.2, -77.7 37.2, -77.7 40.6, -82.6 40.6, -82.6 37.2)))', 4326), 0, NOW()),

('d1000049-0000-0000-0000-000000000049', 'Wisconsin', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-92.9 42.5, -86.8 42.5, -86.8 47.1, -92.9 47.1, -92.9 42.5)))', 4326), 0, NOW()),

('d1000050-0000-0000-0000-000000000050', 'Wyoming', 'United States', 4,
 ST_GeomFromText('MULTIPOLYGON(((-111.1 41.0, -104.1 41.0, -104.1 45.0, -111.1 45.0, -111.1 41.0)))', 4326), 0, NOW());
