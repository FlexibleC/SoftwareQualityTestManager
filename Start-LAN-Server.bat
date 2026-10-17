@echo off
chcp 65001 >nul
title SmartVMS Test Manager - Web Server Mang LAN
color 0A

echo ================================================================
echo   SMARTVMS TEST MANAGER - KHOI DONG HE THONG KIEM THU MANG LAN
echo ================================================================
echo.
echo Dang khoi chay may chu Node.js tren cong 8080...
echo Cho phep tat ca cac may tinh tram gac va dien thoai trong mang LAN truy cap.
echo.

:: Mo trinh duyet sau 2 giay
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"

:: Chay may chu
node "%~dp0server.js"

pause
