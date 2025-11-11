# PowerShell script to test Supabase connection
# Run with: .\scripts\test-supabase-connection.ps1

Write-Host "🔍 Testing Supabase Connection..." -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.local if it exists
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "📋 Loading environment variables from .env.local..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Check for required environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_KEY
$anonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$databaseUrl = $env:DATABASE_URL

Write-Host "📋 Environment Variables:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_SUPABASE_URL: $(if ($supabaseUrl) { '✅ Set' } else { '❌ Missing' })"
if ($supabaseUrl) {
    Write-Host "    Value: $supabaseUrl" -ForegroundColor Gray
    
    # Extract hostname
    if ($supabaseUrl -match 'https://([^/]+)') {
        $hostname = $matches[1]
        Write-Host "    Hostname: $hostname" -ForegroundColor Gray
        
        # Test DNS resolution
        Write-Host ""
        Write-Host "  🔄 Testing DNS resolution..." -ForegroundColor Yellow
        try {
            $dnsResult = Resolve-DnsName -Name $hostname -ErrorAction Stop
            Write-Host "    ✅ DNS resolved successfully" -ForegroundColor Green
            Write-Host "    IP Address(es): $($dnsResult[0].IPAddress)" -ForegroundColor Gray
        } catch {
            Write-Host "    ❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "    💡 The domain '$hostname' cannot be resolved." -ForegroundColor Yellow
            Write-Host "    💡 Possible issues:" -ForegroundColor Yellow
            Write-Host "       - Project reference is incorrect" -ForegroundColor Yellow
            Write-Host "       - Project has been deleted or paused" -ForegroundColor Yellow
            Write-Host "       - Network/DNS issues" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "    🔍 Checking if project reference matches DATABASE_URL..." -ForegroundColor Yellow
            if ($databaseUrl -match '@db\.([^.]+)\.supabase\.co') {
                $dbProjectRef = $matches[1]
                Write-Host "    DATABASE_URL project reference: $dbProjectRef" -ForegroundColor Gray
                if ($hostname -notlike "*$dbProjectRef*") {
                    Write-Host "    ⚠️  WARNING: Project reference mismatch!" -ForegroundColor Red
                    Write-Host "       Expected URL: https://$dbProjectRef.supabase.co" -ForegroundColor Yellow
                    Write-Host "       Current URL: $supabaseUrl" -ForegroundColor Yellow
                }
            }
        }
        
        # Test HTTP connection
        Write-Host ""
        Write-Host "  🔄 Testing HTTP connection..." -ForegroundColor Yellow
        try {
            $healthUrl = "$supabaseUrl/rest/v1/"
            $response = Invoke-WebRequest -Uri $healthUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
            Write-Host "    ✅ HTTP connection successful (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            if ($_.Exception.Message -like "*could not be resolved*" -or $_.Exception.Message -like "*Name or service not known*") {
                Write-Host "    ❌ Cannot resolve hostname: $($_.Exception.Message)" -ForegroundColor Red
            } elseif ($_.Exception.Message -like "*timeout*") {
                Write-Host "    ⚠️  Connection timed out" -ForegroundColor Yellow
            } else {
                Write-Host "    ⚠️  Connection error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "  SUPABASE_SERVICE_KEY: $(if ($serviceKey) { '✅ Set' } else { '❌ Missing' })"
if ($serviceKey) {
    Write-Host "    Length: $($serviceKey.Length) characters" -ForegroundColor Gray
    Write-Host "    Preview: $($serviceKey.Substring(0, [Math]::Min(20, $serviceKey.Length)))..." -ForegroundColor Gray
}

Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY: $(if ($anonKey) { '✅ Set' } else { '❌ Missing' })"
if ($anonKey) {
    Write-Host "    Length: $($anonKey.Length) characters" -ForegroundColor Gray
    Write-Host "    Preview: $($anonKey.Substring(0, [Math]::Min(20, $anonKey.Length)))..." -ForegroundColor Gray
}

Write-Host "  DATABASE_URL: $(if ($databaseUrl) { '✅ Set' } else { '❌ Missing' })"
if ($databaseUrl) {
    if ($databaseUrl -match '@db\.([^.]+)\.supabase\.co') {
        $projectRef = $matches[1]
        Write-Host "    Project Reference: $projectRef" -ForegroundColor Gray
        Write-Host "    Expected API URL: https://$projectRef.supabase.co" -ForegroundColor Gray
        
        if ($supabaseUrl -and $supabaseUrl -notlike "*$projectRef*") {
            Write-Host "    ⚠️  WARNING: Project reference mismatch!" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Verify your Supabase project URL in the Supabase dashboard" -ForegroundColor White
Write-Host "  2. Check that your project is active (not paused)" -ForegroundColor White
Write-Host "  3. Verify your API keys in Project Settings > API" -ForegroundColor White
Write-Host "  4. Ensure your .env.local file has the correct values" -ForegroundColor White
Write-Host "  5. If the project reference is wrong, update NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host ""
Write-Host "💡 To test with curl, use:" -ForegroundColor Cyan
if ($supabaseUrl) {
    if ($supabaseUrl -match 'https://([^/]+)') {
        $hostname = $matches[1]
        Write-Host "   curl https://$hostname/rest/v1/" -ForegroundColor Gray
    }
} else {
    Write-Host "   curl https://[YOUR_PROJECT_REF].supabase.co/rest/v1/" -ForegroundColor Gray
}

