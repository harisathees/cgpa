@echo off
REM ===========================================================================
REM  CGPA bootstrap launcher (Windows).
REM
REM  Double-click this file, or run it from cmd/Explorer. It runs the PowerShell
REM  bootstrap with an execution-policy bypass scoped to this one process, so
REM  Windows won't block the .ps1. It changes no system-wide setting.
REM ===========================================================================

setlocal

REM Absolute path to the sibling .ps1, so it works no matter the working dir
REM (double-click, "Run as administrator", network path, etc.).
set "PS1=%~dp0bootstrap.ps1"

if not exist "%PS1%" (
    echo ERROR: Cannot find "%PS1%".
    echo Make sure bootstrap.cmd and bootstrap.ps1 sit together in the repo root.
    echo.
    echo Press any key to close this window . . .
    pause >nul
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
set "RC=%ERRORLEVEL%"

echo.
echo Bootstrap exited with code %RC%.
echo Press any key to close this window . . .
pause >nul
exit /b %RC%
