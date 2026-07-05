# ============================================================
# Otegui Obras — Deploy to LatinCloud (DirectAdmin)
# ============================================================
# Run from project root: .\deploy.ps1
# Prerequisites: OpenSSH client (ssh, scp) available in PATH
# ============================================================

$ErrorActionPreference = "Stop"

# ─── Configuración ────────────────────────────────────────────
$SERVER   = "ar141.xvserver.com"
$USER     = "oteguiobra"
$DOMAIN   = "oteguiobras.com"
$REMOTE   = "${USER}@${SERVER}"
$WEB_ROOT = "/home/${USER}/public_html"
$LOCAL    = Split-Path $PSScriptRoot

# DB credentials (from DirectAdmin panel)
$DB_HOST  = "localhost"
$DB_NAME  = "oteguiobra_web"
$DB_USER  = "oteguiobra_web"
$DB_PASS  = "cKuTnrpxEqC8gZeH4A5c"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  DEPLOY: Otegui Obras → LatinCloud" -ForegroundColor Cyan
Write-Host "  Server: $SERVER" -ForegroundColor Cyan
Write-Host "  Domain: $DOMAIN" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Build ───────────────────────────────────────────
Write-Host "[1/6] Building production bundle..." -ForegroundColor Yellow
Push-Location $LOCAL
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }
Pop-Location

# ─── Step 2: Prepare deployment package ──────────────────────
Write-Host "[2/6] Preparing deployment package..." -ForegroundColor Yellow
$deployDir = Join-Path $LOCAL "_deploy"
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# Copy built frontend (dist/)
Copy-Item (Join-Path $LOCAL "dist\*") $deployDir -Recurse -Force

# Copy API (source, not dist copy)
Copy-Item (Join-Path $LOCAL "api") (Join-Path $deployDir "api") -Recurse -Force

# Copy root .htaccess
Copy-Item (Join-Path $LOCAL ".htaccess") $deployDir -Force

# Copy static images from public/images
if (Test-Path (Join-Path $LOCAL "public\images")) {
  Copy-Item (Join-Path $LOCAL "public\images") (Join-Path $deployDir "images") -Recurse -Force
}

# Copy static logos from public/logos
if (Test-Path (Join-Path $LOCAL "public\logos")) {
  Copy-Item (Join-Path $LOCAL "public\logos") (Join-Path $deployDir "logos") -Recurse -Force
}

# Copy migration files for reference
Copy-Item (Join-Path $LOCAL "migration") (Join-Path $deployDir "migration") -Recurse -Force

# Copy root-level static files (logo.avif, etc.)
Get-ChildItem $LOCAL -File | Where-Object { $_.Name -match '\.(avif|jpg|jpeg|png|svg|mp4|webm)$' } | ForEach-Object {
  Copy-Item $_.FullName $deployDir -Force
}

# Create cvs directory
New-Item -ItemType Directory -Path (Join-Path $deployDir "cvs") -Force | Out-Null

Write-Host "  Package ready at: $deployDir" -ForegroundColor Green

# ─── Step 3: Upload ──────────────────────────────────────────
Write-Host "[3/6] Uploading to $SERVER..." -ForegroundColor Yellow
Write-Host "  (This may take a few minutes for images...)" -ForegroundColor Gray

# Upload entire package
scp -r "${deployDir}\*" "${REMOTE}:${WEB_ROOT}/"
if ($LASTEXITCODE -ne 0) { throw "Upload failed" }
Write-Host "  Upload complete!" -ForegroundColor Green

# ─── Step 4: Set permissions ─────────────────────────────────
Write-Host "[4/6] Setting permissions..." -ForegroundColor Yellow
ssh $REMOTE "chmod -R 755 ${WEB_ROOT}/images ${WEB_ROOT}/cvs ${WEB_ROOT}/api ${WEB_ROOT}/migration 2>/dev/null; chmod 644 ${WEB_ROOT}/api/*.php ${WEB_ROOT}/api/**/*.php 2>/dev/null; echo 'Done'"
if ($LASTEXITCODE -ne 0) { Write-Host "  Warning: Some permissions may need manual adjustment" -ForegroundColor Yellow }

# ─── Step 5: Upload .env ────────────────────────────────────
Write-Host "[5/6] Configuring production .env..." -ForegroundColor Yellow
$envContent = @"
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
"@
$envFile = Join-Path $deployDir "_env.tmp"
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
scp $envFile "${REMOTE}:${WEB_ROOT}/api/.env"
Remove-Item $envFile
if ($LASTEXITCODE -ne 0) { throw "ENV upload failed" }
Write-Host "  api/.env configured!" -ForegroundColor Green

# ─── Step 6: Database setup instructions ─────────────────────
Write-Host "[6/6] Database setup..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host "  IMPORTANT: Run these SQL commands via:" -ForegroundColor Magenta
Write-Host "  phpMyAdmin (DirectAdmin → Databases)" -ForegroundColor Magenta
Write-Host "  or via SSH: mysql -u $DB_USER -p $DB_NAME < migration/schema-and-seed.sql" -ForegroundColor Magenta
Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  SQL files to execute (in order):" -ForegroundColor Yellow
Write-Host "    1. migration/schema-and-seed.sql  (tables + admin + defaults)" -ForegroundColor White
Write-Host "    2. migration/obras-seed.sql       (48 obras data)" -ForegroundColor White
Write-Host ""

# ─── Cleanup ─────────────────────────────────────────────────
Write-Host "Cleaning up local deploy package..." -ForegroundColor Gray
Remove-Item $deployDir -Recurse -Force

# ─── Done ────────────────────────────────────────────────────
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  DEPLOY COMPLETE!" -ForegroundColor Green
Write-Host "  Site: https://$DOMAIN" -ForegroundColor Green
Write-Host "  Admin: https://$DOMAIN/#/admin" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Execute the SQL files via phpMyAdmin or SSH" -ForegroundColor White
Write-Host "  2. Verify the site loads at https://$DOMAIN" -ForegroundColor White
Write-Host "  3. Test admin login: admin@oteguiobras.com / Otegui2026!" -ForegroundColor White
Write-Host "  4. Test contact form and job application forms" -ForegroundColor White
Write-Host ""
