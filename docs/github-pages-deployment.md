# GitHub Pages 部署指南

本项目已配置好自动部署到 GitHub Pages 的 GitHub Actions 工作流。

## 部署步骤

### 1. 推送代码到 GitHub

确保你的代码已经推送到 GitHub 仓库的 `main` 或 `master` 分支。

### 2. 启用 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**

### 3. 自动部署

一旦配置完成，每次推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. 安装依赖 (`npm ci`)
2. 构建项目 (`npm run build`)
3. 部署到 GitHub Pages

### 4. 访问网站

部署完成后，你可以通过以下 URL 访问你的网站：

```
https://[你的用户名].github.io/OpenCoreInitializr/
```

## 配置说明

### GitHub Actions 工作流

工作流文件位于 `.github/workflows/deploy.yml`，包含以下主要步骤：

- **构建作业 (build)**：安装依赖、构建项目、上传构建产物
- **部署作业 (deploy)**：将构建产物部署到 GitHub Pages

### Vite 配置

`vite.config.ts` 已配置为在生产环境下使用正确的 base 路径：

```typescript
base: mode === 'production' ? '/OpenCoreInitializr/' : '/'
```

这确保了静态资源在 GitHub Pages 上能够正确加载。

## 环境变量

工作流中设置了以下环境变量：

- `VITE_APP_TITLE`: 应用标题
- `VITE_APP_VERSION`: 基于 Git commit SHA 的版本号
- `VITE_APP_DESCRIPTION`: 应用描述

## 故障排除

### 构建失败

如果构建失败，请检查：

1. **依赖问题**：确保 `package.json` 中的依赖版本正确
2. **TypeScript 错误**：修复所有 TypeScript 类型错误
3. **ESLint 错误**：修复代码规范问题

**注意**：当前项目可能存在一些 TypeScript 类型定义不完整的问题，特别是 `KextInfo` 接口。如果遇到构建错误，可以考虑：

- 临时在 `tsconfig.json` 中设置 `"skipLibCheck": true`
- 或者在构建脚本中添加 `--skipLibCheck` 参数
- 完善相关的类型定义

### 部署失败

如果部署失败，请检查：

1. **权限设置**：确保仓库的 Actions 权限已正确配置
2. **Pages 设置**：确保 GitHub Pages 源设置为 "GitHub Actions"
3. **分支名称**：确保推送到正确的分支（main 或 master）

### 资源加载问题

如果网站部署后资源无法加载，请检查：

1. **Base 路径**：确保 `vite.config.ts` 中的 base 路径正确
2. **仓库名称**：确保 base 路径与你的仓库名称匹配

## 本地预览生产构建

在部署前，你可以本地预览生产构建：

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 自定义域名

如果你想使用自定义域名，可以：

1. 在 `public` 目录下创建 `CNAME` 文件
2. 在文件中写入你的域名
3. 在域名提供商处配置 DNS 记录

更多信息请参考 [GitHub Pages 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)。