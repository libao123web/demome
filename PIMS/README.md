# PIMS 档案管理系统

> Personnel Information Management System - 人员信息管理系统

## 项目简介

PIMS 是一个纯前端的档案管理系统，无需后端服务器支持，支持完整的 CRUD 操作。

### 技术栈

- **框架**: Vue 3 + TypeScript
- **UI**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **构建工具**: Vite 5.x
- **样式**: TailwindCSS
- **数据模拟**: Mock.js
- **APP 打包**: Capacitor / HBuilderX

---

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+（推荐）或 npm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建

```bash
# 静态页面版（双击 HTML 直接运行）
pnpm build:static

# PWA 版（支持离线、可安装）
pnpm build:pwa

# APP 版（用于 Capacitor 打包）
pnpm build:app

# HBuilderX 版（用于云打包）
pnpm build:hbuilder
```

---

## 项目结构

```
PIMS/
├── src/                    # 源代码
│   ├── api/                # API 接口定义
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数
│   ├── constants/          # 常量定义
│   ├── mock/               # Mock 数据
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                 # 公共资源
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── vite.config.static.ts   # 静态版配置
├── vite.config.pwa.ts      # PWA 版配置
├── vite.config.app.ts      # APP 版配置
├── vite.config.hbuilder.ts # HBuilderX 版配置
├── capacitor.config.json   # Capacitor 配置
├── tailwind.config.js      # TailwindCSS 配置
└── tsconfig.json           # TypeScript 配置
```

---

## 打包部署

### 1. 静态页面版

适用于本地使用、U盘分发、无服务器环境。

```bash
pnpm build:static
```

构建完成后，双击 `dist-static/index.html` 即可运行。

### 2. PWA 版

适用于 Web 服务器部署，支持离线使用和安装到桌面。

```bash
pnpm build:pwa
```

将 `dist-pwa` 目录部署到 HTTPS 服务器。

### 3. Android APK

**方式一：HBuilderX 云打包（推荐，无需环境）**

```bash
pnpm build:hbuilder
# 然后用 HBuilderX 打开 hbuilder 目录进行云打包
```

**方式二：Capacitor 本地打包（需要 Android Studio）**

```bash
pnpm android:build
pnpm android:open
# 在 Android Studio 中 Build → Build APK
```

### 4. iOS IPA

**方式一：HBuilderX 云打包**

```bash
pnpm build:hbuilder
# 在 HBuilderX 中选择 iOS 打包
# 注意：需要 Apple 开发者证书
```

**方式二：Xcode 本地打包（仅 Mac）**

```bash
pnpm ios:build
pnpm ios:open
# 在 Xcode 中配置签名并打包
```

详细打包说明请参考 [APP打包说明.md](./APP打包说明.md)

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 默认构建 |
| `pnpm build:static` | 构建静态页面版 |
| `pnpm build:pwa` | 构建 PWA 版 |
| `pnpm build:app` | 构建 APP 版 |
| `pnpm build:hbuilder` | 构建 HBuilderX 版 |
| `pnpm android:build` | 构建并同步 Android |
| `pnpm ios:build` | 构建并同步 iOS |
| `pnpm test` | 运行测试 |

---

## 交付包说明

运行以下脚本可生成可直接部署的交付包：

**Windows:**
```bash
build-release.bat
```

**Mac/Linux:**
```bash
./build-release.sh
```

交付包将生成在 `release/` 目录，包含：

```
PIMS-v1.0.0-YYYYMMDD/
├── web-static/      # 静态页面版（双击 index.html 即可运行）
├── hbuilder-app/    # HBuilderX APP 打包资源
└── README.md        # 使用说明
```

**使用方式：**
- **Web 版**: 直接打开 `web-static/index.html`
- **APP 版**: 用 HBuilderX 导入 `hbuilder-app` 目录进行云打包

---

## 默认账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

---

## 许可证

MIT License
