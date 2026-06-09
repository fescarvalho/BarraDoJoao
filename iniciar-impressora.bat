@echo off
title Servidor de Impressao - Barraca do Joao
echo ==========================================
echo INICIANDO O SERVIDOR DE IMPRESSAO CLOUD...
echo ==========================================
echo.
cd %~dp0
node print-server\print-server.js
echo.
echo Ocorreu um erro e o servidor parou.
pause
