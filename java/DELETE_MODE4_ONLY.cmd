@echo off
setlocal EnableExtensions
REM ============================================================
REM DELETE_MODE4_ONLY.cmd
REM Xoa rieng Mode 4 / freej2me-web fallback sau khi da go bo khoi pc.js va UI.
REM Dat file nay trong thu muc java\ roi chay.
REM ============================================================
cd /d "%~dp0"

echo.
echo [MODE4 CLEANUP] Lenh nay se xoa runtime Mode 4 neu con ton tai:
echo   assets_pc\web
echo   assets_pc\FALLBACK_MODE4.md
echo.
echo KHONG xoa Mode 1/2/3, Mode 5, jar, saves, public_pc.
echo.
set /p OK=Go YES de xoa Mode 4: 
if /I not "%OK%"=="YES" (
  echo Da huy.
  pause
  exit /b 0
)

if exist "assets_pc\web" (
  echo Xoa assets_pc\web ...
  rmdir /s /q "assets_pc\web"
) else (
  echo Bo qua assets_pc\web - khong ton tai.
)

if exist "assets_pc\FALLBACK_MODE4.md" (
  echo Xoa assets_pc\FALLBACK_MODE4.md ...
  del /f /q "assets_pc\FALLBACK_MODE4.md"
)

if exist "assets_pc\web\apps" (
  echo Xoa assets_pc\web\apps ...
  rmdir /s /q "assets_pc\web\apps"
)

echo.
echo Da xoa Mode 4 fallback runtime neu co.
echo.
pause
