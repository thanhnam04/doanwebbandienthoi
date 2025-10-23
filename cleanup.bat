@echo off
echo Cleaning up unnecessary files...

REM Backend scripts
del backend\add-stock.js 2>nul
del backend\reset.js 2>nul  
del backend\update-stock.js 2>nul
del backend\reset-stock.js 2>nul

REM Development tools
del add-stock-all.js 2>nul
del createProductJson.html 2>nul
del test-connection.html 2>nul
del start-server.bat 2>nul

REM Data files
del data\products-sample.js 2>nul

REM Documentation
del BFD.puml 2>nul
del BFD1.puml 2>nul
del Chungproducts.txt 2>nul
del test-order-flow.md 2>nul

REM Test folder
rmdir /s /q test-css-danhmuc 2>nul

echo Cleanup completed!
pause