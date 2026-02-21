#!/bin/bash
# PIMS iOS 打包脚本
# 注意：此脚本只能在 macOS 上运行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       PIMS iOS 打包脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查操作系统
if [[ "$(uname)" != "Darwin" ]]; then
    echo -e "${RED}错误: 此脚本只能在 macOS 上运行${NC}"
    exit 1
fi

# 检查 Xcode 是否安装
echo -e "${YELLOW}[1/6] 检查环境...${NC}"
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}错误: 未找到 Xcode，请先安装 Xcode${NC}"
    echo "从 App Store 安装 Xcode: https://apps.apple.com/app/xcode/id497799835"
    exit 1
fi

# 检查 Xcode Command Line Tools
if ! xcode-select -p &> /dev/null; then
    echo -e "${YELLOW}正在安装 Xcode Command Line Tools...${NC}"
    xcode-select --install
    echo -e "${YELLOW}请完成安装后重新运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Xcode 版本: $(xcodebuild -version | head -1)${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"

# 检查包管理器
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo -e "${RED}错误: 未找到 npm 或 pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 使用包管理器: $PKG_MANAGER${NC}"
echo ""

# 安装依赖
echo -e "${YELLOW}[2/6] 安装依赖...${NC}"
$PKG_MANAGER install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 构建 Web 资源
echo -e "${YELLOW}[3/6] 构建 Web 资源...${NC}"
$PKG_MANAGER run build:app
echo -e "${GREEN}✓ Web 资源构建完成${NC}"
echo ""

# 检查 iOS 平台是否已添加
echo -e "${YELLOW}[4/6] 检查 iOS 平台...${NC}"
if [ ! -d "ios" ]; then
    echo -e "${YELLOW}iOS 平台未添加，正在添加...${NC}"
    npx cap add ios
    echo -e "${GREEN}✓ iOS 平台添加成功${NC}"
else
    echo -e "${GREEN}✓ iOS 平台已存在${NC}"
fi
echo ""

# 同步资源到 iOS 项目
echo -e "${YELLOW}[5/6] 同步资源到 iOS 项目...${NC}"
npx cap sync ios
echo -e "${GREEN}✓ 资源同步完成${NC}"
echo ""

# 安装 CocoaPods 依赖
echo -e "${YELLOW}[6/6] 安装 CocoaPods 依赖...${NC}"
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}CocoaPods 未安装，正在安装...${NC}"
    sudo gem install cocoapods
fi

cd ios/App
if [ -f "Podfile" ]; then
    pod install --repo-update
    echo -e "${GREEN}✓ CocoaPods 依赖安装完成${NC}"
fi
cd "$PROJECT_DIR"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}       构建完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "下一步操作:"
echo -e ""
echo -e "  ${YELLOW}方式一：使用命令打开 Xcode${NC}"
echo -e "    $PKG_MANAGER run ios:open"
echo -e ""
echo -e "  ${YELLOW}方式二：直接打开项目文件${NC}"
echo -e "    open ios/App/App.xcworkspace"
echo -e ""
echo -e "  ${YELLOW}在 Xcode 中:${NC}"
echo -e "    1. 选择开发团队（Team）进行签名"
echo -e "    2. 选择目标设备或模拟器"
echo -e "    3. 点击运行按钮测试"
echo -e "    4. 打包: Product → Archive"
echo -e ""
echo -e "  ${YELLOW}iOS 项目位置:${NC}"
echo -e "    $PROJECT_DIR/ios"
echo ""
