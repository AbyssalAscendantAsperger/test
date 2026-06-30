@echo off
REM ============================================================
REM J2ME Portal - PC ONLY / PUBLIC_PC MAIN
REM Sau khi gộp mobile layout + touch hook vào public_pc:
REM   - Chỉ chạy pc.js
REM   - Cổng chính: 3002
REM   - Không chạy mobie.js (3001)
REM   - Không chạy server.js router (3000)
REM ============================================================
cd /d "%~dp0"
set PORT=
set PC_PORT=3002
echo ==============================================
echo  J2ME Portal - PC ONLY / MAIN PORT 3002
echo  URL: http://localhost:3002
echo ==============================================
node pc.js
pause
