@echo off
chcp 65001 > nul
echo ====================================================
echo  Interpersonal Design Diagram - 브랜드 로고 생성기
echo ====================================================
echo.
echo 웹 서버를 시작하는 중입니다...
start http://localhost:3000
node server.js
pause
