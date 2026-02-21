# PIMS APP 打包说明

PIMS 支持多种方式在平板上安装使用：PWA、HBuilderX 和 Capacitor。

---

## 方案一：PWA（Progressive Web App）

### 优点
- 无需应用商店审核
- 更新即时生效
- 配置简单

### 缺点
- 需要 HTTPS 服务器部署
- 部分原生功能受限

### 构建步骤

```bash
# 构建 PWA 版本
pnpm build:pwa
```

构建产物在 `dist-pwa` 目录。

### 部署和安装

1. 将 `dist-pwa` 目录部署到 HTTPS 服务器（如 Nginx、Vercel、Netlify）
2. 在平板浏览器访问部署地址
3. **iOS Safari**：点击分享按钮 → 「添加到主屏幕」
4. **Android Chrome**：点击菜单 → 「添加到主屏幕」或「安装应用」

---

## 方案二：HBuilderX 打包（推荐）

### 优点
- 操作简单，界面化打包
- 支持云端打包，无需配置本地环境
- 免费打包 Android APK

### 缺点
- 需要注册 DCloud 账号
- 云打包有排队等待时间

### 构建步骤

#### 1. 构建 Web 资源

```bash
pnpm build:hbuilder
```

构建产物输出到 `hbuilder` 目录。

#### 2. 使用 HBuilderX 打包 Android

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 HBuilderX，选择「文件 → 导入 → 从本地目录导入」
3. 选择项目的 `hbuilder` 目录
4. 点击菜单「发行 → 原生 App-云打包」
5. 配置打包选项：
   - 选择 Android
   - 使用公共测试证书（测试用）或自有证书（正式发布）
   - 点击「打包」

#### 3. 获取 APK

打包完成后，HBuilderX 会提示下载地址，下载 APK 即可安装。

---

### HBuilderX 打包 iOS（重点说明）

HBuilderX 支持云端打包 iOS，**无需 Mac 电脑**，在 Windows 上即可完成！

#### 证书选择（3种情况）

| 情况 | 证书选择 | 适用场景 | 限制 |
|------|---------|---------|------|
| 无 Apple 账号 | DCloud 公共测试证书 | 开发测试 | 仅能安装到越狱设备 |
| 有免费 Apple ID | 无法云打包 | - | 免费账号不能生成证书 |
| 有付费开发者账号 | 自有证书 | 正式发布 | 需要 99 美元/年 |

#### 方式一：使用公共测试证书（无需任何账号）

> ⚠️ **限制**：使用公共证书打包的 IPA 只能安装到**越狱设备**，普通 iPhone/iPad 无法安装。

**打包步骤：**

1. 构建 Web 资源
   ```bash
   pnpm build:hbuilder
   ```

2. 打开 HBuilderX，导入 `hbuilder` 目录

3. 点击菜单「发行 → 原生 App-云打包」

4. 在打包界面配置：
   - ✅ 勾选 **iOS**
   - 选择 **使用公共测试证书**
   - 点击「打包」

5. 等待云端打包完成，下载 IPA 文件

**安装到越狱设备：**
- 使用爱思助手、PP助手等工具安装 IPA
- 或通过 Cydia Impactor 安装

#### 方式二：使用自有证书（推荐正式发布）

需要 Apple 开发者账号（99 美元/年）生成证书。

**准备工作：**

1. **注册 Apple 开发者账号**
   - 访问 [developer.apple.com](https://developer.apple.com)
   - 个人账号 99 美元/年，企业账号 299 美元/年

2. **创建证书和描述文件**
   - 登录 [Apple Developer](https://developer.apple.com/account)
   - Certificates → 创建 iOS Distribution 证书
   - 下载 .cer 文件，导出为 .p12 文件
   - Profiles → 创建 Ad Hoc 或 App Store 描述文件
   - 下载 .mobileprovision 文件

3. **在 HBuilderX 中配置**
   - 发行 → 原生 App-云打包
   - 选择 iOS
   - 选择「使用自有证书」
   - 上传 .p12 证书文件和密码
   - 上传 .mobileprovision 描述文件
   - 点击打包

**分发方式：**

| 描述文件类型 | 用途 | 安装方式 |
|-------------|------|---------|
| Development | 开发调试 | 需要添加设备 UDID |
| Ad Hoc | 内部测试 | 需要添加设备 UDID（最多 100 台）|
| App Store | 上架商店 | 通过 App Store 安装 |
| Enterprise | 企业分发 | 任意设备安装（需企业账号）|

#### 常见问题

**Q: 没有 Apple 开发者账号能让普通 iPhone 安装吗？**
A: 不能。iOS 系统要求所有 App 必须经过签名，签名需要开发者证书。公共测试证书打包的 IPA 只能装越狱设备。

**Q: 有免费 Apple ID 能打包吗？**
A: HBuilderX 云打包不支持免费账号。免费账号只能在 Mac + Xcode 环境下真机调试。

**Q: 如何获取设备 UDID？**
A: 
- 方法1：将 iPhone 连接电脑，打开 iTunes/访达，点击设备序列号切换显示 UDID
- 方法2：访问 [udid.io](https://udid.io) 等网站获取
- 方法3：使用爱思助手等工具查看

**Q: Ad Hoc 描述文件最多支持多少设备？**
A: 每个开发者账号每年最多注册 100 台测试设备。

---

### 自定义配置

编辑 `hbuilder/manifest.json` 可修改：
- `name`：应用名称
- `id`：应用唯一标识（DCloud 的 AppID，正式发布需要在 DCloud 后台申请）
- `version.name`：版本号
- `plus.distribute.google.permissions`：Android 权限
- `plus.distribute.apple`：iOS 相关配置

### 更换应用图标

需要准备以下尺寸的图标，放到 `hbuilder/static/icons/` 目录：

**Android 图标：**
- 72x72.png (hdpi)
- 96x96.png (xhdpi)
- 144x144.png (xxhdpi)
- 192x192.png (xxxhdpi)

**iOS 图标：**
- 20x20.png, 40x40.png (iPad Notifications)
- 29x29.png, 58x58.png, 87x87.png (Settings)
- 40x40.png, 80x80.png, 120x120.png (Spotlight)
- 60x60.png, 120x120.png, 180x180.png (App Icon)
- 76x76.png, 152x152.png (iPad App)
- 167x167.png (iPad Pro App)
- 1024x1024.png (App Store)

---

## 方案三：Capacitor 原生 APP

### 优点
- 生成真正的原生 APP（APK/IPA）
- 可发布到应用商店
- 支持更多原生功能

### 缺点
- 需要安装 Android Studio / Xcode
- 更新需要重新打包

### 环境准备

#### Android 开发环境
1. 下载安装 [Android Studio](https://developer.android.com/studio)
2. 安装 Android SDK（API Level 22+）
3. 配置环境变量 `ANDROID_HOME`

#### iOS 开发环境（仅 Mac）
1. 安装 Xcode（App Store）
2. 安装 Xcode Command Line Tools：`xcode-select --install`

### 初始化 Capacitor

```bash
# 1. 安装 Capacitor 依赖
pnpm add @capacitor/core @capacitor/cli
pnpm add -D @capacitor/android @capacitor/ios

# 2. 构建 Web 资源
pnpm build:app

# 3. 添加平台
pnpm cap:android   # Android
pnpm cap:ios       # iOS（仅 Mac）
```

### 打包 Android APK

```bash
# 1. 构建并同步
pnpm app:build

# 2. 打开 Android Studio
pnpm cap:open:android

# 3. 在 Android Studio 中：
#    - Build → Build Bundle(s) / APK(s) → Build APK(s)
#    - 或 Build → Generate Signed Bundle / APK
```

APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 打包 iOS IPA（仅 Mac）

iOS 打包相比 Android 更为复杂，需要配置开发者账号和证书。

#### 环境要求

- macOS 系统（10.15+）
- Xcode 14+（从 App Store 安装）
- Apple 开发者账号（免费账号可真机调试，付费账号可上架）
- CocoaPods（用于管理 iOS 依赖）

#### 方式一：使用打包脚本（推荐）

```bash
# 给脚本执行权限
chmod +x build-ios.sh

# 运行打包脚本
./build-ios.sh
```

脚本会自动完成以下步骤：
1. 检查环境（Xcode、Node.js）
2. 安装项目依赖
3. 构建 Web 资源
4. 添加 iOS 平台（首次）
5. 同步资源到 iOS 项目
6. 安装 CocoaPods 依赖

#### 方式二：手动步骤

```bash
# 1. 构建并同步
pnpm ios:build

# 2. 安装 CocoaPods（首次）
sudo gem install cocoapods

# 3. 安装 iOS 依赖
cd ios/App && pod install && cd ../..

# 4. 打开 Xcode
pnpm ios:open
# 或
open ios/App/App.xcworkspace
```

#### 在 Xcode 中配置签名

1. 打开 `ios/App/App.xcworkspace`（注意是 `.xcworkspace` 不是 `.xcodeproj`）
2. 在项目导航中选择 **App** 项目
3. 选择 **Signing & Capabilities** 标签
4. 勾选 **Automatically manage signing**
5. 选择你的 **Team**（开发者账号）
6. 如果 Bundle Identifier 冲突，修改为唯一值（如 `com.yourname.pims`）

#### 真机调试

1. 用数据线连接 iPhone/iPad
2. 在 Xcode 顶部选择你的设备
3. 首次运行需要在设备上信任开发者：
   - 设置 → 通用 → VPN与设备管理 → 信任开发者
4. 点击运行按钮 ▶️

#### 打包发布（Archive）

```bash
# 在 Xcode 中
Product → Archive

# 等待归档完成，然后可以：
# - Distribute App → Ad Hoc (测试分发)
# - Distribute App → App Store Connect (上架)
```

#### 常见问题

**Q: 提示 "Signing for App requires a development team"**
A: 在 Xcode 中选择 Signing & Capabilities，选择一个 Team

**Q: Pod install 失败**
A: 尝试运行 `pod repo update` 更新仓库，然后重新 `pod install`

**Q: 真机运行提示 "不受信任的开发者"**
A: 在 iPhone 上：设置 → 通用 → VPN与设备管理 → 信任此开发者

**Q: 免费账号可以打包吗？**
A: 可以，但有限制：
- 只能安装在自己的设备上（最多 3 台）
- App 有效期 7 天，需定期重新安装
- 无法上架 App Store

### 常用命令

```bash
# 同步 Web 资源到原生项目
pnpm cap:sync

# 只构建 Web
pnpm build:app

# 构建 + 同步（通用）
pnpm app:build

# iOS 专用命令
pnpm ios:build    # 构建 + 同步 iOS
pnpm ios:open     # 打开 Xcode

# Android 专用命令
pnpm android:build    # 构建 + 同步 Android
pnpm android:open     # 打开 Android Studio
```

---

## 推荐方案

| 场景 | 推荐方案 |
|------|----------|
| 快速部署测试 | PWA |
| 内部使用、不需上架 | HBuilderX 云打包 |
| 无本地开发环境 | HBuilderX 云打包 |
| 需要上架应用商店 | Capacitor 或 HBuilderX |
| 需要离线完整功能 | Capacitor 或 HBuilderX |

---

## 注意事项

1. **Mock 数据**：APP 使用 localStorage 存储数据，卸载会丢失
2. **网络请求**：当前使用 Mock.js，实际部署需替换为真实 API
3. **签名**：
   - Android：正式发布需要创建 keystore 签名文件
   - iOS：需要 Apple 开发者账号配置证书和描述文件
4. **图标**：
   - HBuilderX：替换 `hbuilder/static/icons/` 中的图标
   - Android：替换 `android/app/src/main/res/` 中的图标
   - iOS：替换 `ios/App/App/Assets.xcassets/AppIcon.appiconset/` 中的图标
5. **iOS 打包限制**：
   - 只能在 macOS 系统上进行
   - 免费开发者账号 App 有效期 7 天
   - 上架 App Store 需要付费账号（99 美元/年）
