# ZoaDex Fast Parallel Occurrence Import
param([int]$MaxParallel = 3, [int]$SpeciesPerRegion = 50)

$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"email":"test2@zoadex.app","password":"Password123!"}' -ContentType "application/json"
$token = $loginResp.token
$headers = @{ "Authorization" = "Bearer $token" }

$regions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions"
$pending = $regions | Where-Object { $_.speciesCount -gt 0 }
Write-Host "Importing occurrences for $($pending.Count) regions ($SpeciesPerRegion species each, $MaxParallel parallel)..."

$jobs = @()
$completed = 0

foreach ($r in $pending) {
    # Wait if we have too many running jobs
    while (($jobs | Where-Object { $_.State -eq 'Running' }).Count -ge $MaxParallel) {
        Start-Sleep -Milliseconds 500
        $done = $jobs | Where-Object { $_.State -eq 'Completed' }
        foreach ($j in $done) {
            $result = Receive-Job $j
            $completed++
            Write-Host "[$completed/$($pending.Count)] $result" -ForegroundColor Green
            Remove-Job $j
        }
        $jobs = $jobs | Where-Object { $_.State -eq 'Running' }
    }

    $jobs += Start-Job -ScriptBlock {
        param($regionId, $regionName, $token, $maxSpecies)
        try {
            $h = @{ "Authorization" = "Bearer $token" }
            $r = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$regionId/import-occurrences?maxSpecies=$maxSpecies" -Method POST -Headers $h -ContentType "application/json" -TimeoutSec 300
            "$regionName : $($r.occurrencesImported) occurrences ($($r.speciesProcessed) species)"
        } catch { "$regionName : ERROR - $($_.Exception.Message)" }
    } -ArgumentList $r.id, $r.name, $token, $SpeciesPerRegion
}

# Wait for remaining
$jobs | Wait-Job | ForEach-Object {
    $result = Receive-Job $_
    $completed++
    Write-Host "[$completed/$($pending.Count)] $result" -ForegroundColor Green
    Remove-Job $_
}
Write-Host "`nDONE! All regions processed." -ForegroundColor Cyan
