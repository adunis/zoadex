# ZoaDex Deployment Guide

One-click deployment for Windows mini-PC.

## Prerequisites

- Docker Desktop (for PostgreSQL + PostGIS)
- Java 21 (MS Build OpenJDK recommended, installed to `~/.jdks/ms-21.0.10`)
- Node.js 18+ and npm
- `npx` (comes with npm)

## Quick Start

```powershell
.\deploy.ps1
```

This will:
1. Start PostgreSQL + PostGIS via Docker Compose
2. Build the React frontend
3. Build the Spring Boot backend
4. Start the backend API (port 8080)
5. Serve the frontend (port 3000)

## Options

| Flag | Description |
|------|-------------|
| `-SkipBuild` | Skip building, use existing artifacts |
| `-Stop` | Stop all ZoaDex services |
| `-BackendPort 8080` | Custom backend port |
| `-FrontendPort 3000` | Custom frontend port |

## Examples

```powershell
# Full deploy (build + start)
.\deploy.ps1

# Restart without rebuilding
.\deploy.ps1 -SkipBuild

# Stop everything
.\deploy.ps1 -Stop

# Custom ports
.\deploy.ps1 -BackendPort 9090 -FrontendPort 4000
```

## Architecture

```
[Browser] --> [:3000 Frontend (serve)] --> [:8080 Backend API (Spring Boot)] --> [:5432 PostgreSQL + PostGIS]
```

## Configuration

### Frontend API URL

The frontend expects the backend at `http://localhost:8080/api/v1`. If you change the backend port, update `zoadex-web/.env.production`:

```
VITE_API_BASE_URL=http://localhost:YOUR_PORT/api/v1
```

### Database

PostgreSQL runs in Docker via `docker-compose.yml`. Data persists in a Docker volume (`zoadex-pgdata`).

### Java

The deploy script expects Java 21 at `~/.jdks/ms-21.0.10`. To change, edit the `$JAVA_HOME_PATH` variable in `deploy.ps1`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Run `.\deploy.ps1 -Stop` first, or check `Get-NetTCPConnection -LocalPort 8080` |
| Docker not running | Start Docker Desktop manually |
| Java not found | Install MS Build OpenJDK 21 to `~/.jdks/ms-21.0.10` |
| Frontend 404 on refresh | The `serve -s` flag handles SPA routing |
| Database connection refused | Wait 10s after docker-compose up, or check `docker ps` |
