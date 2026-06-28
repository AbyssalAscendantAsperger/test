@echo off
REM Khoi dong ca 3 tien trinh: mobie.js (3001) + pc.js (3002) + server.js (3000 router)
cd /d "%~dp0"
echo ==============================================
echo  J2ME Portal - tach logic Mobile / PC
echo   - MOBILE  : http://localhost:3001  (mobie.js)
echo   - PC      : http://localhost:3002  (pc.js)
echo   - ROUTER  : http://localhost:3000  (server.js)
echo ==============================================
node start_all.js
pause
