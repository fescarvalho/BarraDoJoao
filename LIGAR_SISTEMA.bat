@echo off
title Barraca do João - Sistema
echo ======================================================
echo           BARRACA DO JOÃO - SISTEMA LIGADO
echo ======================================================
echo.

:: Roda o robo que atualiza as permissoes de seguranca
echo Configurando acesso para o celular...
node update-config.js
echo.

:: Pega o IP e mostra em destaque
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    set ip=%%a
)
echo O ENDERECO PARA OS CELULARES EH:
echo http:%ip%:3000
echo.
echo ======================================================
echo.

:: Abre o navegador
start http://localhost:3000/vendas

echo Iniciando o servidor... Nao feche esta janela!
echo.

:: Roda o sistema
npm run dev -- --webpack

pause
