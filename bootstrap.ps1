#requires -Version 5.1
<#
.SYNOPSIS
    CGPA — one-command bootstrap (Windows / PowerShell).

.DESCRIPTION
    Clones the repo (if not already present) and runs the full setup
    (install deps + migrate + seed) for backend and frontend.

    Run it from anywhere — it does not need to live inside the repo.

.PARAMETER TargetDir
    Folder to clone into. Defaults to 'cgpa' in the current directory.

.EXAMPLE
    ./bootstrap.ps1
    ./bootstrap.ps1 -TargetDir my-cgpa
#>

param(
    [string]$TargetDir = 'cgpa'
)

$ErrorActionPreference = 'Stop'
$RepoUrl = 'https://github.com/harisathees/cgpa.git'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Die($msg)  { Write-Host "!!! $msg"   -ForegroundColor Red; exit 1 }

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Die 'git is not installed.' }

Step "Cloning $RepoUrl"
if (Test-Path (Join-Path $TargetDir '.git')) {
    Write-Host "    '$TargetDir' already cloned — pulling latest."
    git -C $TargetDir pull --ff-only
    if ($LASTEXITCODE -ne 0) { Die 'git pull failed.' }
} elseif (Test-Path $TargetDir) {
    Die "'$TargetDir' already exists and is not a git repo."
} else {
    git clone $RepoUrl $TargetDir
    if ($LASTEXITCODE -ne 0) { Die 'git clone failed.' }
}

Step "Running setup in $TargetDir"
Push-Location $TargetDir
try {
    & ./setup.ps1
} finally {
    Pop-Location
}
