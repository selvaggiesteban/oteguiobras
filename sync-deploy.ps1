# sync-deploy.ps1 — Rebuild deploy branch from main
# Run this after each code change to update the lightweight deploy branch
# Usage: .\sync-deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "`n=== Otegui Obras — Sync Deploy Branch ===" -ForegroundColor Cyan

# 1. Ensure we're on main and build
Write-Host "`n[1/5] Switching to main..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) { throw "Failed to checkout main" }

Write-Host "[2/5] Building dist/..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# 2. Prepare temp directory with production files
$tempDir = Join-Path $env:TEMP "oteGUI-deploy-sync"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "[3/5] Copying production files to temp..." -ForegroundColor Yellow
$copyItems = @(
    @{ Src = "dist"; Dst = "dist"; Recurse = $true },
    @{ Src = "api"; Dst = "api"; Recurse = $true },
    @{ Src = "migration"; Dst = "migration"; Recurse = $true },
    @{ Src = "install.php"; Dst = "install.php"; Recurse = $false },
    @{ Src = ".htaccess"; Dst = ".htaccess"; Recurse = $false },
    @{ Src = ".user.ini"; Dst = ".user.ini"; Recurse = $false }
)
foreach ($item in $copyItems) {
    $srcPath = Join-Path $PSScriptRoot $item.Src
    $dstPath = Join-Path $tempDir $item.Dst
    if (Test-Path $srcPath) {
        Copy-Item -Recurse $srcPath $dstPath
    } else {
        Write-Host "  Warning: $srcPath not found, skipping" -ForegroundColor DarkYellow
    }
}

# Remove dist/images/ (images already exist on hosting — no need to deploy)
$distImages = Join-Path $tempDir "dist\images"
if (Test-Path $distImages) {
    Remove-Item -Recurse -Force $distImages
    Write-Host "  Removed dist/images/ (already on hosting)" -ForegroundColor DarkGray
}

# 3. Create/update orphan deploy branch
Write-Host "[4/5] Updating deploy branch..." -ForegroundColor Yellow
git checkout --orphan deploy-temp 2>$null
git rm -rf . 2>$null | Out-Null
git clean -fd 2>$null | Out-Null

# Copy from temp back to repo root
Copy-Item -Recurse (Join-Path $tempDir "*") "$PSScriptRoot\"

git add -A
$commitCount = (git status --short | Measure-Object).Count
if ($commitCount -gt 0) {
    git commit -m "Deploy: production build $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git branch -M deploy
    git push -f origin deploy
    Write-Host "  Deploy branch updated and pushed ($commitCount files)" -ForegroundColor Green
} else {
    git branch -M deploy
    Write-Host "  No changes detected" -ForegroundColor DarkGray
}

# 4. Return to main
git checkout main
git branch -D deploy-temp 2>$null | Out-Null

# Cleanup
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host "`n=== Done! Deploy branch is live on GitHub ===" -ForegroundColor Green
Write-Host "Next step: upload the new install.php to hosting via File Manager" -ForegroundColor Cyan
