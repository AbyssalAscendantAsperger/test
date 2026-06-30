@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo Xoa cache JAR da chuan hoa cho Mode 5:
echo   assets_pc\web5\mode5_jars
echo.
set /p OK=Go YES de xoa cache: 
if /I not "%OK%"=="YES" (
  echo Da huy.
  pause
  exit /b 0
)

if exist "assets_pc\web5\mode5_jars" (
  rmdir /s /q "assets_pc\web5\mode5_jars"
)
mkdir "assets_pc\web5\mode5_jars" 2>nul

echo Da xoa cache Mode 5 normalized JAR.
pause
