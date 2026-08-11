-- Fix species categorization and rename INSECTS to INVERTEBRATES

-- 1. Fix reptiles that were miscategorized
UPDATE species SET category = 'REPTILES' WHERE taxonomy_class IN ('Squamata', 'Reptilia', 'Testudines', 'Crocodilia', 'Rhynchocephalia');
UPDATE species SET category = 'REPTILES' WHERE taxonomy_order IN ('Squamata', 'Testudines', 'Crocodilia', 'Rhynchocephalia') AND category != 'REPTILES';

-- 2. Fix fish that were miscategorized  
UPDATE species SET category = 'FISH' WHERE taxonomy_class IN ('Actinopterygii', 'Chondrichthyes', 'Elasmobranchii', 'Cephalaspidomorphi', 'Sarcopterygii', 'Myxini', 'Petromyzonti');

-- 3. Fix amphibians
UPDATE species SET category = 'AMPHIBIANS' WHERE taxonomy_class = 'Amphibia' AND category != 'AMPHIBIANS';

-- 4. Rename INSECTS to INVERTEBRATES to include all invertebrate phyla
UPDATE species SET category = 'INVERTEBRATES' WHERE category = 'INSECTS';

-- The INVERTEBRATES category now covers: Insecta, Arachnida, Gastropoda, Bivalvia,
-- Malacostraca, Copepoda, Diplopoda, Chilopoda, Anthozoa, Asteroidea, Polychaeta,
-- Branchiopoda, Merostomata (horseshoe crabs), Pycnogonida (sea spiders), etc.
