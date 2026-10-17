@echo off
chcp 65001 >nul
title SmartVMS Test Manager - Cổng Khởi Động
color 0B

echo ================================================================
echo   HỆ THỐNG QUẢN LÝ & ĐÁNH GIÁ CHẤT LƯỢNG KIỂM THỬ SMARTVMS
echo ================================================================
echo.
echo Vui lòng chọn môi trường bạn muốn truy cập:
echo.
echo   [1] ONLINE INTERNET (Khuyên dùng - Truy cập mọi thiết bị, Realtime Cloud)
echo       👉 https://smartvms-test-manager.vercel.app
echo.
echo   [2] MẠNG NỘI BỘ LAN (Khởi động Web Server LAN cổng 8080)
echo       👉 Dùng cho các máy tính trạm gác trong mạng nội bộ cơ quan
echo.
echo   [3] CỤC BỘ OFFLINE (Mở trực tiếp file HTML trên máy này)
echo.
set /p opt="Nhập lựa chọn của bạn [1, 2 hoặc 3, mặc định là 1]: "

if "%opt%"=="2" goto lan
if "%opt%"=="3" goto local
goto online

:online
echo.
echo Đang mở hệ thống Online trên trình duyệt...
start "" "https://smartvms-test-manager.vercel.app"
goto end

:lan
echo.
echo Đang khởi chạy Máy chủ Mạng LAN...
call "%~dp0Start-LAN-Server.bat"
goto end

:local
echo.
echo Đang mở trực tiếp file cục bộ...
start "" "%~dp0index.html"
goto end

:end
echo.
echo Tài khoản sử dụng:
echo - Quản lý (QA Lead):  admin  / 123
echo - Người kiểm thử:      tester / 123
echo - Lập trình viên:     dev    / 123
echo.
timeout /t 3 >nul
exit
