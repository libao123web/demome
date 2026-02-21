#!/bin/bash
set -e

export ANDROID_HOME="/c/Users/peng/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

cd "$(dirname "$0")/cordova-app"

echo "=== 检查环境 ==="
echo "ANDROID_HOME: $ANDROID_HOME"
cordova --version

echo ""
echo "=== 添加 Android 平台 ==="
cordova platform add android || echo "Android 平台可能已存在"

echo ""
echo "=== 构建 APK ==="
cordova build android

echo ""
echo "=== 完成 ==="
echo "APK 位置: cordova-app/platforms/android/app/build/outputs/apk/debug/app-debug.apk"
