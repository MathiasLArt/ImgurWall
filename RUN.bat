@echo off
start cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5500/"
