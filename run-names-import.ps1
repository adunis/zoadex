$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"email":"test2@zoadex.app","password":"Password123!"}' -ContentType "application/json"
$token = $loginResp.token
$headers = @{ "Authorization" = "Bearer $token" }
$regions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions"
$log = "C:\Users\aleksandar.petrovic\IdeaProjects\zoadex\names-import.log"
Add-Content $log "Starting names import at $(Get-Date) for $($regions.Count) regions"

foreach ($r in $regions) {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions/$($r.id)/import-names?limit=500" -Method POST -Headers $headers -ContentType "application/json" -TimeoutSec 600
        Add-Content $log "$($r.name): $($result.updated) names updated ($($result.processed) processed)"
    } catch {
        Add-Content $log "$($r.name): ERROR"
    }
}
Add-Content $log "DONE at $(Get-Date)"
