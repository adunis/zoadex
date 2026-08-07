# ZoaDex Region Import Script
# Usage: .\scripts\import-regions.ps1 -Tier popular
# Usage: .\scripts\import-regions.ps1 -Tier core -MaxRegions 5

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Email = "test2@zoadex.app",
    [string]$Password = "Password123!",
    [ValidateSet('popular', 'core', 'full')]
    [string]$Tier = "popular",
    [switch]$SkipSpecies,
    [switch]$SkipOccurrences,
    [switch]$SkipNames,
    [int]$MaxRegions = 0  # 0 = all
)

$ErrorActionPreference = "Continue"

# Tier configuration
$TierConfig = @{
    popular = @{ SpeciesLimit = 200; OccurrenceLimit = 200; Description = "Top 200 species (fast, ~2 min/region)" }
    core    = @{ SpeciesLimit = 1000; OccurrenceLimit = 1000; Description = "Core 1000 species (~8 min/region)" }
    full    = @{ SpeciesLimit = 5000; OccurrenceLimit = 5000; Description = "Full catalog (~20 min/region)" }
}

$config = $TierConfig[$Tier]

function Login {
    $body = @{ email = $Email; password = $Password } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $resp.token
}

function Get-Regions {
    return Invoke-RestMethod -Uri "$BaseUrl/api/v1/regions" -Method GET
}

function Import-Species($regionId, $regionName, $token) {
    $limit = $config.SpeciesLimit
    Write-Host "  [Species] Importing top $limit for $regionName..." -ForegroundColor Cyan
    $start = Get-Date
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/regions/$regionId/import?limit=$limit" -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -TimeoutSec 1800
        $elapsed = [math]::Round(((Get-Date) - $start).TotalSeconds)
        Write-Host "  [Species] Done: $($result.speciesImported) species, $($result.imagesResolved) images (${elapsed}s)" -ForegroundColor Green
    } catch {
        Write-Host "  [Species] ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Import-Occurrences($regionId, $regionName, $token) {
    $limit = $config.OccurrenceLimit
    Write-Host "  [Occurrences] Importing for $regionName (limit: $limit species)..." -ForegroundColor Cyan
    $totalOcc = 0
    $totalSpecies = 0
    $batchNum = 0
    do {
        $batchNum++
        try {
            $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/regions/$regionId/import-occurrences?maxSpecies=$limit" -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -TimeoutSec 1800
            $totalOcc += $result.occurrencesImported
            $totalSpecies += $result.speciesProcessed
            Write-Host "    Batch $batchNum`: $($result.speciesProcessed) species, $($result.occurrencesImported) occ" -ForegroundColor DarkGray
        } catch {
            Write-Host "  [Occurrences] ERROR in batch $batchNum`: $($_.Exception.Message)" -ForegroundColor Red
            break
        }
    } while ($result.speciesProcessed -gt 0 -and $result.occurrencesImported -gt 0)
    Write-Host "  [Occurrences] Done: $totalSpecies species, $totalOcc occurrences" -ForegroundColor Green
}

function Import-Names($regionId, $regionName, $token) {
    Write-Host "  [Names] Importing multi-language names for $regionName..." -ForegroundColor Cyan
    $totalUpdated = 0
    $batchNum = 0
    do {
        $batchNum++
        try {
            $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/regions/$regionId/import-names?limit=500" -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -TimeoutSec 900
            $totalUpdated += $result.updated
            if ($result.processed -eq 0) { break }
            Write-Host "    Batch $batchNum`: processed=$($result.processed), updated=$($result.updated)" -ForegroundColor DarkGray
        } catch {
            Write-Host "  [Names] ERROR in batch $batchNum`: $($_.Exception.Message)" -ForegroundColor Red
            break
        }
    } while ($result.processed -gt 0)
    Write-Host "  [Names] Done: $totalUpdated names added" -ForegroundColor Green
}

# === MAIN ===
Write-Host "`n=== ZoaDex Region Import ===" -ForegroundColor Yellow
Write-Host "Import tier: $Tier - $($config.Description)" -ForegroundColor Yellow
Write-Host "Base URL: $BaseUrl"
Write-Host "Logging in as $Email..."

$token = Login
if (-not $token) { Write-Host "Login failed!" -ForegroundColor Red; exit 1 }
Write-Host "Logged in successfully.`n" -ForegroundColor Green

$regions = Get-Regions
Write-Host "Found $($regions.Count) regions in database.`n"

# Filter to regions needing import
$pending = $regions | Where-Object { $_.speciesCount -eq 0 -or $_.lastSynced -eq $null }
if ($MaxRegions -gt 0) { $pending = $pending | Select-Object -First $MaxRegions }

Write-Host "Regions to import: $($pending.Count)`n" -ForegroundColor Yellow

$totalStart = Get-Date
$i = 0

foreach ($region in $pending) {
    $i++
    Write-Host "`n[$i/$($pending.Count)] $($region.name), $($region.country)" -ForegroundColor White -BackgroundColor DarkBlue

    if (-not $SkipSpecies) {
        Import-Species $region.id $region.name $token
    }

    if (-not $SkipOccurrences) {
        Import-Occurrences $region.id $region.name $token
    }

    if (-not $SkipNames) {
        Import-Names $region.id $region.name $token
    }

    Write-Host "  [COMPLETE] $($region.name)" -ForegroundColor Green
}

$totalElapsed = [math]::Round(((Get-Date) - $totalStart).TotalMinutes, 1)
Write-Host "`n=== Import Complete === ($totalElapsed minutes total, tier: $Tier)" -ForegroundColor Yellow
