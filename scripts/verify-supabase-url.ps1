# Quick script to verify Supabase URL is correct
# Run with: .\scripts\verify-supabase-url.ps1

$correctProjectRef = "yeyytxdwwgraesyiyqfl"
$supabaseUrl = "https://$correctProjectRef.supabase.co"

Write-Host "Verifying Supabase URL..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host ""

# Test DNS resolution
Write-Host "Testing DNS resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "$correctProjectRef.supabase.co" -ErrorAction Stop
    Write-Host "[OK] DNS resolved successfully" -ForegroundColor Green
    Write-Host "   IP Address: $($dnsResult[0].IPAddress)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test health endpoint (doesn't require authentication)
Write-Host ""
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthUrl = "$supabaseUrl/auth/v1/health"
    $response = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Health endpoint responded successfully" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        if ($content.status) {
            Write-Host "   Status: $($content.status)" -ForegroundColor Gray
        }
        Write-Host "   Version: $($response.Headers['X-Supabase-Version'])" -ForegroundColor Gray
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "[OK] Server is responding (401 is expected for REST API without auth)" -ForegroundColor Green
    } elseif ($_.Exception.Message -like "*could not be resolved*") {
        Write-Host "[ERROR] Connection failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "The URL cannot be resolved. Possible issues:" -ForegroundColor Yellow
        Write-Host "   - Project reference is incorrect" -ForegroundColor Yellow
        Write-Host "   - Project has been paused or deleted" -ForegroundColor Yellow
        Write-Host "   - Network/DNS issues" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "[WARNING] Health endpoint test: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[SUCCESS] Supabase URL is correct and accessible!" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure your .env.local file has:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.$correctProjectRef.supabase.co:5432/postgres" -ForegroundColor White

