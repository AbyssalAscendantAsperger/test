@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================================
echo   J2ME Emulator - Launcher (CORRECT METHOD)
echo ================================================
echo.

if not exist "jar" mkdir jar

echo Danh sach file JAR trong thu muc jar\:
echo.
dir /b jar\*.jar 2>nul
if errorlevel 1 (
    echo Khong co file JAR nao!
    pause
    exit /b
)

echo.
set /p jarname=Nhap TEN FILE JAR muon chay: 

if "%jarname%"=="" (
    echo Ban chua nhap ten file!
    pause
    exit /b
)

if not exist "jar\%jarname%" (
    echo [LOI] File jar\%jarname% khong ton tai!
    pause
    exit /b
)

echo.
echo Dang khoi dong (su dung phuong thuc dung de tai JAR tu server)...
echo.

:: Khoi dong server HTTP
start "" /min cmd /c "cd /d "%~dp0" && python -m http.server 8080"

timeout /t 2 /nobreak >nul

:: DUNG PHUONG THUC DUNG: ?jars=jar/xxx.jar (se tu dong tai JAR tu server)
start "" "http://localhost:8080/main.html?jars=jar/%jarname%&jad=&midletClassName=&enginemode=enginemode2-classes2.jar&gamepadSize=gamepad-3&gamepad=1&canvasSize=size-240x320&gameresize=resize-1"

echo.
echo [THANH CONG]
echo Da mo game voi link dung de tai JAR tu server.
echo.
echo Neu trinh duyet khong tu mo, hay copy link sau:
echo http://localhost:8080/main.html?jars=jar/%jarname%^&jad=^&midletClassName=^&enginemode=enginemode2-classes2.jar^&gamepadSize=gamepad-3^&gamepad=1^&canvasSize=size-240x320^&gameresize=resize-1
echo.
pause >nul
