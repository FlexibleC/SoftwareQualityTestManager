@echo off
chcp 65001 >nul
title Hệ Thống Kiểm Thử & Quản Lý Chất Lượng Phần Mềm - Web Server Mạng LAN
color 0A

echo ================================================================
echo   HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM
echo   KHỞI ĐỘNG MÁY CHỦ KIỂM THỬ MẠNG LAN / NỘI BỘ (CỔNG 8080)
echo ================================================================
echo.
echo Đang khởi chạy máy chủ Node.js trên cổng 8080...
echo Cho phép tất cả các máy tính trạm và thiết bị trong mạng LAN truy cập.
echo.

:: Mở trình duyệt sau 2 giây
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"

:: Chạy máy chủ
node "%~dp0server.js"

pause
