@echo off
set NODE_SKIP_PLATFORM_CHECK=1
title Barraca do João - Impressora
echo Iniciando o robo da impressora...
echo Nao feche esta janela durante a festa.
cd print-server
node print-server.js
pause
