@echo off
REM ===========================================================================
REM  CGPA bootstrap launcher (Windows).
REM
REM  Double-click this file, or run it from cmd/Explorer. It runs the PowerShell
REM  bootstrap with an execution-policy bypass scoped to this one process, so
REM  Windows won't block the .ps1. It changes no system-wide setting.
REM ===========================================================================

setlocal
pushd "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "bootstrap.ps1"
set "RC=%ERRORLEVEL%"

popd
echo.
echo Bootstrap exited with code %RC%.
echo Press any key to close this window . . .
pause >nul
exit /b %RC%
