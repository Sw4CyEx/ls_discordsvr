@echo off
title Menjalankan Discord Bot - Elaim Saga
echo [1/2] Men-deploy commands...
node deploy-commands.js

echo [2/2] Menjalankan bot...
node index.js

pause
