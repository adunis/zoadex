$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"email":"test2@zoadex.app","password":"Password123!"}' -ContentType "application/json"
$token = $loginResp.token
$regions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions"
$needGps = $regions | Where-Object { $_.speciesCount -gt 0 -and -not $_.hasGpsData }
$log = "C:\Users\aleksandar.petrovic\IdeaProjects\zoadex\gps-import.log"
Add-Content $log "Starting GPS import for $($needGps.Count) regions at $(Get-Date)"

for ($i = 0; $i -lt $needGps.Count; $i += 2) {
    $slice = $needGps[$i..([Math]::Min($i+1, $needGps.Count-1))]
    $jobs = @()
    foreach ($r in $slice) {
        $jobs += Start-Job -ScriptBlock {
            param($regionId, $regionName, $token)
            try {
                $h = @{ "Authorization" = "Bearer $token" }
                $r = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$regionId/import-occurrences?maxSpecies=50" -Method POST -Headers $h -ContentType "application/json" -TimeoutSec 600
                "$regionName : $($r.occurrencesImported) GPS points"
            } catch { "$regionName : ERROR - $($_.Exception.Message)" }
        } -ArgumentList $r.id, $r.name, $token
    }
    $jobs | Wait-Job | ForEach-Object {
        $result = Receive-Job $_
        Add-Content $log $result
        Remove-Job $_
    }
}
Add-Content $log "DONE at $(Get-Date)"
