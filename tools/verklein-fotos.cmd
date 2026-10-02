@echo off
rem Dubbelklik dit bestand om de foto's in "foto-origineel" te verkleinen naar "images".
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verklein-fotos.ps1"
pause
