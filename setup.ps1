#requires -Version 5.1
<#
.SYNOPSIS
    CGPA — full local setup (Windows / PowerShell).

.DESCRIPTION
    Installs dependencies for backend + frontend, sets up env files, then runs
    Prisma migrations and seeds the ADMIN user.

    Prerequisites: Node.js 20+, npm, and a running MySQL 8 server reachable via
    the DATABASE_URL in backend/.env.

.EXAMPLE
    ./setup.ps1
#>

$ErrorActionPreference = 'Stop'

# Resolve the repo root (this script's directory) so it works from anywhere.
$Root     = $PSScriptRoot
$Backend  = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'

# ── Output helpers ────────────────────────────────────────────────────────────
function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Info($msg) { Write-Host "    $msg"   -ForegroundColor Green }
function Warn($msg) { Write-Host "    $msg"   -ForegroundColor Yellow }
function Die($msg)  { Write-Host "!!! $msg"   -ForegroundColor Red; exit 1 }

# Run a command in a directory; abort if it returns a non-zero exit code.
# ErrorActionPreference is relaxed to 'Continue' for the call so that normal
# stderr output (e.g. npm deprecation warnings) is not turned into a terminating
# NativeCommandError; real failures are detected via $LASTEXITCODE.
function Invoke-In($dir, $exe, [string[]]$cmdArgs) {
    Push-Location $dir
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $exe @cmdArgs
        if ($LASTEXITCODE -ne 0) { Die "`"$exe $($cmdArgs -join ' ')`" failed (exit $LASTEXITCODE)." }
    } finally {
        $ErrorActionPreference = $prev
        Pop-Location
    }
}

# ── Prerequisites ─────────────────────────────────────────────────────────────
Step 'Checking prerequisites'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Die 'Node.js is not installed (need v20+).' }
if (-not (Get-Command npm  -ErrorAction SilentlyContinue)) { Die 'npm is not installed.' }
Info "node $(node --version)   npm $(npm --version)"

# ── Env files ─────────────────────────────────────────────────────────────────
# Copy from the committed examples only when the real file is missing, so we
# never clobber existing local config.
function Ensure-Env($target, $example) {
    if (Test-Path $target) {
        Info "$(Split-Path $target -Leaf) already exists — keeping it."
    } elseif (Test-Path $example) {
        Copy-Item $example $target
        Warn "Created $(Split-Path $target -Leaf) from $(Split-Path $example -Leaf) — review its values."
    } else {
        Warn "No $(Split-Path $example -Leaf) found; skipping $(Split-Path $target -Leaf)."
    }
}

Step 'Setting up environment files'
Ensure-Env (Join-Path $Backend  '.env')        (Join-Path $Backend  '.env.example')
Ensure-Env (Join-Path $Frontend '.env.local')  (Join-Path $Frontend '.env.local.example')

# ── Backend ───────────────────────────────────────────────────────────────────
Step 'Installing backend dependencies'
Invoke-In $Backend 'npm' @('install')          # postinstall also runs `prisma generate`

Step 'Generating Prisma client'
Invoke-In $Backend 'npm' @('run', 'prisma:generate')

Step 'Applying database migrations'
Invoke-In $Backend 'npm' @('run', 'prisma:migrate')

Step 'Seeding the ADMIN user'
Invoke-In $Backend 'npm' @('run', 'prisma:seed')

# ── Frontend ──────────────────────────────────────────────────────────────────
Step 'Installing frontend dependencies'
Invoke-In $Frontend 'npm' @('install')

# ── Done ──────────────────────────────────────────────────────────────────────
Step 'Setup complete 🎉'
Write-Host @"
Next steps:
  Backend   : cd backend  ; npm run start:dev   # http://localhost:3001/api
  Frontend  : cd frontend ; npm run dev         # http://localhost:3000

  Admin login uses ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env.
"@ -ForegroundColor Green
