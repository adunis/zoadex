$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"email":"test2@zoadex.app","password":"Password123!"}' -ContentType "application/json"
$token = $loginResp.token
$regions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions"
$withSpecies = $regions | Where-Object { $_.speciesCount -gt 0 }
$log = "C:\Users\aleksandar.petrovic\IdeaProjects\zoadex\fast-import.log"
Add-Content $log "Starting import at $(Get-Date) for $($withSpecies.Count) regions"

for ($i = 0; $i -lt $withSpecies.Count; $i += 3) {
    $slice = $withSpecies[$i..([Math]::Min($i+2, $withSpecies.Count-1))]
    $jobs = @()
    foreach ($r in $slice) {
        $jobs += Start-Job -ScriptBlock {
            param($regionId, $regionName, $token)
            try {
                $h = @{ "Authorization" = "Bearer $token" }
                $r = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$regionId/import-occurrences?maxSpecies=50" -Method POST -Headers $h -ContentType "application/json" -TimeoutSec 300
                "$regionName : $($r.occurrencesImported) occ"
            } catch { "$regionName : ERROR" }
        } -ArgumentList $r.id, $r.name, $token
    }
    $jobs | Wait-Job | ForEach-Object {
        Add-Content $log (Receive-Job $_)
        Remove-Job $_
    }
}
Add-Content $log "DONE at $(Get-Date)"
