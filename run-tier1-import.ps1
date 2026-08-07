$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"email":"test2@zoadex.app","password":"Password123!"}' -ContentType "application/json"
$token = $loginResp.token
$headers = @{ "Authorization" = "Bearer $token" }
$regions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions"
$empty = $regions | Where-Object { $_.speciesCount -eq 0 }
$log = "C:\Users\aleksandar.petrovic\IdeaProjects\zoadex\tier1-import.log"
Add-Content $log "Starting Tier 1 + GPS for $($empty.Count) regions at $(Get-Date)"

for ($i = 0; $i -lt $empty.Count; $i += 3) {
    $slice = $empty[$i..([Math]::Min($i+2, $empty.Count-1))]
    $jobs = @()
    foreach ($r in $slice) {
        $jobs += Start-Job -ScriptBlock {
            param($regionId, $regionName, $token)
            $h = @{ "Authorization" = "Bearer $token" }
            try {
                # Step 1: Import species (Tier 1 = 200)
                $sp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$regionId/import?limit=200" -Method POST -Headers $h -ContentType "application/json" -TimeoutSec 600
                # Step 2: Import GPS occurrences
                $gps = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$regionId/import-occurrences?maxSpecies=50" -Method POST -Headers $h -ContentType "application/json" -TimeoutSec 300
                "$regionName : $($sp.speciesImported) species, $($gps.occurrencesImported) GPS points"
            } catch { "$regionName : ERROR - $($_.Exception.Message)" }
        } -ArgumentList $r.id, $r.name, $token
    }
    $jobs | Wait-Job | ForEach-Object {
        $result = Receive-Job $_
        Add-Content $log $result
        Write-Host $result
        Remove-Job $_
    }
}
Add-Content $log "DONE at $(Get-Date)"
