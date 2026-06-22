@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Update-Product-Images.ps1"
if errorlevel 1 pause
