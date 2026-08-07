# ZoaDex Import Scripts

## import-regions.ps1

Imports species, occurrence data, and multi-language names for all pending regions.

### Import Tiers

| Tier | Species | Time/Region | Best For |
|------|---------|-------------|----------|
| `popular` | 200 | ~2 min | Quick population, recognizable species |
| `core` | 1000 | ~8 min | Good coverage without niche species |
| `full` | 5000 | ~20 min | Complete biodiversity catalog |

### Usage

```powershell
# Quick: populate all regions with top 200 species
.\scripts\import-regions.ps1 -Tier popular

# Standard: good coverage for active regions
.\scripts\import-regions.ps1 -Tier core -MaxRegions 5

# Full: everything (run overnight)
.\scripts\import-regions.ps1 -Tier full

# Import only species (skip occurrences and names)
.\scripts\import-regions.ps1 -Tier popular -SkipOccurrences -SkipNames

# Import only first 3 regions
.\scripts\import-regions.ps1 -Tier core -MaxRegions 3

# Import only occurrences for regions that already have species
.\scripts\import-regions.ps1 -Tier popular -SkipSpecies -SkipNames

# Custom server
.\scripts\import-regions.ps1 -BaseUrl http://my-server:8080 -Email admin@zoadex.app -Password secret
```

### Pipeline per region
1. **Species import** - fetches species list from GBIF (limited by tier)
2. **Occurrence import** - fetches GPS locations for species (limited by tier)
3. **Multi-language names** - fetches IT/FR/ES/DE/ZH/AR/JA names

### Adding new regions
Add regions via Flyway migration (see V8 for examples) then run this script.
