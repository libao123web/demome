@echo off
setlocal

set ANDROID_HOME=C:\Users\peng\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=%ANDROID_HOME%
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin

cd /d %~dp0cordova-app

echo === 检查环境 ===
echo ANDROID_HOME: %ANDROID_HOME%
call cordova --version

echo.
echo === 添加 Android 平台 ===
call cordova platform add android 2>nul || echo Android 平台可能已存在

echo.
echo === 构建 APK ===
call cordova build android

echo.
echo === 完成 ===
echo APK 位置: cordova-app\platforms\android\app\build\outputs\apk\debug\app-debug.apk

pause
