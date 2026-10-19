@echo off
chcp 65001 >nul
title Hệ Thống Kiểm Thử & Quản Lý Chất Lượng Phần Mềm
color 0B

echo ================================================================
echo   HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM
echo   (Software Quality & Test Management System — SQTM)
echo ================================================================
echo.
echo Vui lòng chọn môi trường bạn muốn truy cập:
echo.
echo   [1] ONLINE CLOUD (Truy cập mọi nơi, Realtime Cloud Supabase)
echo       👉 https://smartvms-test-manager.vercel.app
echo.
echo   [2] MẠNG NỘI BỘ LAN (Khởi động Web Server LAN cổng 8080)
echo       👉 Dùng cho các máy tính trạm trong mạng nội bộ cơ quan
echo.
echo   [3] CỤC BỘ TRÊN MÁY NÀY (Mở trực tiếp tệp HTML cục bộ)
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
echo Đang mở trực tiếp tệp cục bộ...
start "" "%~dp0index.html"
goto end

:end
echo.
echo Danh sách tài khoản mẫu mặc định:
echo - Quản trị viên Cấp cao (Super Admin): admin  / 123
echo - Quản trị viên Dự án (Project Lead): lead   / 123
echo - Kiểm thử viên (Tester):             tester / 123
echo - Kỹ sư Lập trình (Developer):        dev    / 123
echo.
timeout /t 3 >nul
exit
