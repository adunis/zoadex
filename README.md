# 🌍 ZoaDex

**A real-world Pokédex for biodiversity discovery.**

ZoaDex is a Progressive Web App that turns exploring nature into a game. Select a region anywhere in the world, discover species on an interactive map, log your sightings, and earn badges — all powered by real biodiversity data from the Global Biodiversity Information Facility (GBIF).

## What It Does

- **Explore 236 regions across 73 countries** — from Italian provinces to Japanese prefectures, US states to Brazilian regions, with real species data for each
- **Interactive map with GPS occurrences** — see exactly where species have been observed, with a crosshair-based detection system that reveals nearby species as you pan
- **26,000+ real species** across 8 taxonomic groups: Birds, Mammals, Reptiles, Amphibians, Insects, Fish, Plants, and Fungi
- **Log sightings** — record species you encounter in nature, validated against your active region's boundary
- **Earn badges** — gamified progression system rewards exploration milestones
- **Multi-language** — UI available in English, Italian, French, Spanish, German, and Japanese. Species names displayed in multiple languages simultaneously
- **Region color palettes** — each region gets a unique color scheme auto-extracted from its flag
- **Rarity system** — species are classified by observation frequency (Common → Legendary) using real GBIF occurrence data

## Architecture

`
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│   React/Vite    │────▶│  Spring Boot 3.3     │────▶│  PostgreSQL    │
│   Frontend      │     │  REST API (Java 21)  │     │  + PostGIS     │
│   (TypeScript)  │     │                      │     │                │
│   Leaflet Maps  │     │  JWT Auth            │     │  236 regions   │
│   PWA           │     │  GBIF Integration    │     │  26k species   │
└─────────────────┘     └──────────────────────┘     │  GPS points    │
                                                      └────────────────┘
`

### Backend (zoadex-api/)
- **Spring Boot 3.3** with Java 21
- **PostgreSQL + PostGIS** for spatial queries and region boundaries
- **Flyway** migrations (V1–V11)
- **JWT authentication** with role-based access
- **GBIF integration** — balanced species import across 8 taxonomic groups, parallel occurrence import with rate limiting and retry logic
- **Spatial validation** — sightings validated against region boundaries using ST_Contains

### Frontend (zoadex-web/)
- **React 18 + TypeScript + Vite**
- **Leaflet** for interactive maps with custom overlays
- **PWA-ready** with offline-first design
- **i18n system** with 6 UI languages + multi-language species name display
- **Canvas-based color extraction** from flag SVGs for dynamic theming
- **Pokémon/Japanese game-inspired UI** with Lato font

## Features

### Map & Discovery
- Crosshair at map center detects species within a zoom-scaled radius
- Grey boundary overlay shows neighboring regions with clickable labels to switch view
- GPS occurrence points rendered as markers for discovered species
- User sightings shown as half-white/half-red circle overlay (toggleable)
- Region picker modal for quick navigation

### Regions
- **Active/Unlocked/Locked** region system with slot limits
- Premium plans unlock additional region slots
- Admin accounts (username contains "admin") get 999 slots
- Data tiers: MISSING → PARTIAL → BASIC → FULL
- Region descriptions and discovery progress tracking

### Species
- Scientific names + common names in multiple languages
- Wikipedia descriptions on the explore page
- Rarity calculated per-region using percentile-based thresholds
- Category filtering (Birds, Mammals, Reptiles, etc.)
- Species images from GBIF/Wikimedia

### Gamification
- Badge system with progress tracking
- Expedition mode for focused exploration sessions
- Sighting log with location validation
- Per-region discovery progress

## Data Sources

- **[GBIF](https://www.gbif.org/)** — Species taxonomy, occurrence records, vernacular names, images
- **[Hatscripts Circle Flags](https://github.com/nicolgit/circle-flags)** — Region flag SVGs
- **[Wikimedia Commons](https://commons.wikimedia.org/)** — Additional flag sources
- **[Wikipedia](https://www.wikipedia.org/)** — Species descriptions

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- Docker (for PostgreSQL + PostGIS)

### Setup

`powershell
# Start the database
docker compose up -d

# Restore the included database dump (includes all 236 regions + 26k species + GPS data)
Expand-Archive db-dump/zoadex-full.sql.zip -DestinationPath db-dump/
docker cp db-dump/zoadex-full.sql zoadex-postgres-1:/tmp/
docker exec zoadex-postgres-1 psql -U zoadex -d zoadex -f /tmp/zoadex-full.sql

# Start the backend
cd zoadex-api
./mvnw spring-boot:run

# Start the frontend (in another terminal)
cd zoadex-web
npm install
npm run dev
`

Or use the one-click deployment script:
`powershell
./deploy.ps1
`

The app will be available at http://localhost:5173

## Countries & Regions

🇮🇹 Italy (20) · 🇺🇸 United States (50) · 🇧🇷 Brazil (6) · 🇦🇺 Australia (8) · 🇨🇦 Canada (10) · 🇪🇸 Spain (8) · 🇫🇷 France (11) · 🇩🇪 Germany (4) · 🇯🇵 Japan (7) · 🇲🇽 Mexico (9) · 🇮🇳 India (9) · 🇨🇳 China (9) · 🇮🇩 Indonesia (6) · 🇦🇷 Argentina (5) · 🇨🇱 Chile (5) · 🇵🇪 Peru (4) · 🇨🇴 Colombia (5) · 🇹🇭 Thailand (4) · 🇹🇷 Turkey (4) · plus 13 European and 12 African countries

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Leaflet, CSS3 |
| Backend | Spring Boot 3.3, Java 21, Spring Security, JWT |
| Database | PostgreSQL 16, PostGIS, Flyway |
| External | GBIF API, Wikipedia API, Wikimedia Commons |
| Deployment | Docker Compose, PowerShell scripts |

## License

This project is for educational and personal use. Species data is sourced from GBIF under their data use agreement.
