#requires -Version 5.1
<#
.SYNOPSIS
    CGPA — one-command bootstrap (Windows / PowerShell).

.DESCRIPTION
    Clones the repo (if not already present) and runs the full setup
    (install deps + migrate + seed) for backend and frontend.

    Run it from anywhere — it does not need to live inside the repo.

.EXAMPLE
    ./bootstrap.ps1
#>

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host "============================================"
Write-Host "  CGPA — Development Setup"
Write-Host "============================================"
Write-Host ""

$RepoUrl = "https://github.com/harisathees/cgpa.git"

# Run from inside an existing checkout (backend/ present) -> set up in place.
# Otherwise clone into ./cgpa and continue inside it.
if (Test-Path "backend/package.json") {
    Write-Host "[cgpa] Running inside an existing checkout."
} elseif (Test-Path "cgpa/.git") {
    Write-Host "[cgpa] Already cloned, skipping."
    Set-Location "cgpa"
} else {
    Write-Host "[cgpa] Cloning from $RepoUrl ..."
    git clone $RepoUrl cgpa
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Location "cgpa"
}

Write-Host ""
Write-Host "Running setup ..."
Write-Host ""

& ./setup.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
