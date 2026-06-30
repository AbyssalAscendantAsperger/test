@echo off
setlocal EnableExtensions
REM ============================================================
REM DELETE_UNUSED_PC_ONLY.cmd
REM Xoa cac thu muc/file thua sau khi da gop mobile vao public_pc
REM va chi dung pc.js lam server chinh o cong 3002.
REM
REM DAT FILE NAY TRONG THU MUC java\ ROI CHAY.
REM GIU LAI CAC THU MUC QUAN TRONG:
REM   - assets_pc       : runtime/assets dang dung boi pc.js
REM   - public_pc       : frontend chinh, da co mobile layout/touch
REM   - jar             : kho game
REM   - saves           : save game
REM   - java            : classes.jar/classes2.jar cho legacy mode
REM   - config          : giu config/config.json cho Mode 5 override
REM   - node_modules    : express de chay server
REM ============================================================
cd /d "%~dp0"

echo.
echo [CANH BAO] Lenh nay se XOA VINH VIEN cac thu muc/file khong con dung.
echo Hay chac chan ban da dan de patch moi va backup neu can.
echo.
echo Thu muc se xoa:
echo   assets_mobile, public_mobile, public,
echo   bld, certs, js, libs, polyfill, style, web, tools
echo.
echo File server cu se xoa:
echo   mobie.js, server.js, start_all.js
echo.
set /p OK=Go YES de xoa: 
if /I not "%OK%"=="YES" (
  echo Da huy.
  pause
  exit /b 0
)

echo.
echo === XOA THU MUC THUA ===
for %%D in (
  "assets_mobile"
  "public_mobile"
  "public"
  "bld"
  "certs"
  "js"
  "libs"
  "polyfill"
  "style"
  "web"
  "tools"
) do (
  if exist "%%~D" (
    echo Xoa thu muc %%~D ...
    rmdir /s /q "%%~D"
  ) else (
    echo Bo qua %%~D - khong ton tai.
  )
)

echo.
echo === XOA FILE SERVER/ROUTER CU ===
for %%F in (
  "mobie.js"
  "server.js"
  "start_all.js"
) do (
  if exist "%%~F" (
    echo Xoa file %%~F ...
    del /f /q "%%~F"
  ) else (
    echo Bo qua %%~F - khong ton tai.
  )
)

echo.
echo === XOA FILE TEST/LEGACY KHONG CAN CHO RUNTIME ===
for %%F in (
  "test_*.js"
  "build_check.js"
  "benchmark.js"
  "index.html"
  "index.js"
  "index2.html"
  "indexbatch.html"
  "main.html"
  "keymap.js"
  "gc.html"
  "gc.js"
  "games.js"
  "gamelist.js"
  "timer.js"
  "manifest.webapp"
  "launcher.bat"
  "RUN_JAR_DIRECT.bat"
) do (
  if exist "%%~F" (
    echo Xoa %%~F ...
    del /f /q "%%~F"
  )
)

echo.
echo === DON config: giu lai config\config.json, xoa cac file config cu neu co ===
if exist "config" (
  for %%F in ("config\build.js" "config\default.js" "config\runtests.js" "config\urlparams.js") do (
    if exist "%%~F" (
      echo Xoa %%~F ...
      del /f /q "%%~F"
    )
  )
)

echo.
echo Hoan tat. Bay gio chi can chay: startserver.bat
echo Cong chinh: http://localhost:3002
echo.
pause
