# OpenCore Initializer 部署指南

## 概述

本文档详细说明了如何部署 OpenCore Initializer 应用到不同的平台，包括本地开发环境、Cloudflare Workers 和其他静态托管服务。

## 环境要求

### 开发环境
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **Git**: 用于版本控制
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **内存**: 最少 4GB RAM（推荐 8GB+）
- **存储**: 最少 2GB 可用空间
- **网络**: 稳定的互联网连接（用于下载依赖和文件）

## 本地开发部署

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/your-username/OpenCoreInitializr.git
cd OpenCoreInitializr

# 安装依赖
npm install
```

### 2. 环境配置

创建 `.env.local` 文件：

```env
# 应用配置
VITE_APP_TITLE=OpenCore Initializer
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=OpenCore Configuration Generator

# API 配置
VITE_OPENCORE_API_BASE=https://api.github.com/repos/acidanthera/OpenCorePkg
VITE_KEXT_API_BASE=https://api.github.com/repos/acidanthera

# 功能开关
VITE_ENABLE_ISO_GENERATION=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false

# 开发模式配置
VITE_DEV_MODE=true
VITE_DEBUG_LOGGING=true
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或者指定端口
npm run dev -- --port 3000
```

访问 `http://localhost:5173` 查看应用。

### 4. 开发工具

```bash
# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint

# 修复代码问题
npm run lint:fix

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

## 生产环境构建

### 1. 构建应用

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 2. 构建优化

在 `vite.config.ts` 中配置构建优化：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          utils: ['jszip', 'js-yaml', 'file-saver'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

## Cloudflare Workers 部署

### 1. 安装 Wrangler CLI

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 或者使用项目本地安装
npm install --save-dev wrangler
```

### 2. 配置 wrangler.toml

```toml
name = "opencore-initializer"
main = "dist/worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npm run build:worker"
cwd = "."
watch_dir = "src"

[vars]
ENVIRONMENT = "production"
APP_VERSION = "1.0.0"

# 静态资源配置
[[rules]]
type = "Text"
globs = ["**/*.html", "**/*.txt"]

[[rules]]
type = "Data"
globs = ["**/*.wasm", "**/*.bin"]

# 路由配置
[[routes]]
pattern = "opencore-initializer.example.com/*"
zone_name = "example.com"
```

### 3. 创建 Worker 脚本

创建 `src/worker.ts`：

```typescript
import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS 配置
app.use('*', cors({
  origin: ['https://opencore-initializer.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 静态文件服务
app.use('/*', serveStatic({ root: './dist' }));

// API 路由
app.get('/api/versions', async (c) => {
  // 获取 OpenCore 和 Kext 版本信息
  const versions = await fetchLatestVersions();
  return c.json(versions);
});

app.get('/api/download/:type/:name', async (c) => {
  // 代理文件下载
  const { type, name } = c.req.param();
  const file = await downloadFile(type, name);
  return new Response(file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
});

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.notFound((c) => {
  return c.html('<h1>Page Not Found</h1>', 404);
});

export default app;

// 辅助函数
async function fetchLatestVersions() {
  // 实现版本获取逻辑
  return {
    opencore: '0.9.7',
    kexts: {
      Lilu: '1.6.7',
      WhateverGreen: '1.6.6',
      AppleALC: '1.8.8',
    },
  };
}

async function downloadFile(type: string, name: string) {
  // 实现文件下载逻辑
  const response = await fetch(`https://github.com/acidanthera/${name}/releases/latest`);
  return response.arrayBuffer();
}
```

### 4. 部署到 Cloudflare

```bash
# 登录 Cloudflare
wrangler login

# 部署到开发环境
wrangler deploy --env development

# 部署到生产环境
wrangler deploy --env production

# 查看部署状态
wrangler tail
```

## 其他部署选项

### 1. Vercel 部署

创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_APP_TITLE": "OpenCore Initializer",
    "VITE_APP_VERSION": "1.0.0"
  }
}
```

部署命令：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

### 2. Netlify 部署

创建 `netlify.toml`：

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_APP_TITLE = "OpenCore Initializer"
  VITE_APP_VERSION = "1.0.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. GitHub Pages 部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_APP_TITLE: OpenCore Initializer
        VITE_APP_VERSION: ${{ github.sha }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 性能优化

### 1. 缓存策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
});
```

### 2. CDN 配置

```typescript
// 使用 CDN 加速静态资源
const CDN_BASE = 'https://cdn.example.com/opencore-initializer';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? CDN_BASE : '/',
});
```

## 监控和日志

### 1. 错误监控

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT,
    tracesSampleRate: 0.1,
  });
}
```

### 2. 性能监控

```typescript
// src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // 发送性能指标到分析服务
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 安全配置

### 1. 内容安全策略 (CSP)

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.github.com;
  worker-src 'self' blob:;
">
```

### 2. 环境变量安全

```bash
# 生产环境变量
VITE_APP_TITLE=OpenCore Initializer
VITE_APP_VERSION=1.0.0
# 不要在前端暴露敏感信息
# VITE_API_SECRET=xxx  # ❌ 错误
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除 node_modules 并重新安装
   - 检查 TypeScript 类型错误

2. **部署失败**
   - 检查环境变量配置
   - 验证构建输出目录
   - 检查网络连接

3. **运行时错误**
   - 检查浏览器控制台
   - 验证 API 端点
   - 检查 CORS 配置

### 调试工具

```bash
# 详细构建日志
npm run build -- --debug

# 分析构建包大小
npm run build -- --analyze

# 检查依赖
npm audit
npm audit fix
```

## 总结

本部署指南涵盖了 OpenCore Initializer 应用的完整部署流程，从本地开发到生产环境部署。选择合适的部署平台和配置，确保应用的稳定性、性能和安全性。

定期更新依赖、监控应用性能、备份重要数据，是维护生产环境的重要实践。