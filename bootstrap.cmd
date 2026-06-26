@echo off
REM ============================================================================
REM  CGPA bootstrap launcher (Windows).
REM
REM  Double-click this file, or run it from cmd/Explorer. It launches the
REM  PowerShell bootstrap with an execution-policy bypass scoped to this single
REM  process, so Windows won't block the .ps1 ("running scripts is disabled on
REM  this system" / Mark-of-the-Web). It does NOT change any system-wide policy.
REM ============================================================================

setlocal
REM Prefer Windows PowerShell 5.1; fall back to PowerShell 7+ (pwsh) if present.
set "PS=powershell"
where powershell >nul 2>nul || set "PS=pwsh"

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" %*
set "EXITCODE=%ERRORLEVEL%"

echo.
if not "%EXITCODE%"=="0" (
    echo Bootstrap exited with code %EXITCODE%.
) else (
    echo Bootstrap finished.
)
echo Press any key to close this window . . .
pause >nul
exit /b %EXITCODE%
