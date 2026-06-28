@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "APP_DIR=%~dp0java"
if not exist "%APP_DIR%\main.html" (
  echo [ERROR] Khong thay %%~dp0java\main.html
  pause
  exit /b 1
)

set "PYTHON_CMD="
where py >nul 2>nul && set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD where python >nul 2>nul && set "PYTHON_CMD=python"
if not defined PYTHON_CMD where python3 >nul 2>nul && set "PYTHON_CMD=python3"

if not defined PYTHON_CMD (
  echo [ERROR] Chua co Python trong PATH.
  echo Cai Python 3 va tick "Add Python to PATH".
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
%PYTHON_CMD% "tools\direct_launch.py" --port 8080
pause
