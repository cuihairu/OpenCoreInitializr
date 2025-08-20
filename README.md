# OpenCore Initializr

🚀 一个现代化的 OpenCore EFI 配置生成器，帮助用户快速创建适合自己硬件的 Hackintosh 引导配置。

## ✨ 项目特色

- **🎯 智能向导**: 通过简单的步骤引导用户完成硬件选择和配置
- **🔧 硬件适配**: 支持 Intel 和 AMD 处理器，自动识别并配置相应的设置
- **📦 一键生成**: 自动下载必需的 Kext 驱动和 OpenCore 文件
- **🎨 现代界面**: 基于 React + TypeScript 构建的响应式 Web 界面
- **📱 移动友好**: 支持桌面和移动设备访问
- **🌐 多语言**: 支持中文和英文界面
- **⚡ 实时预览**: 提供配置文件预览和详细的生成进度

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **包管理器**: pnpm
- **部署平台**: GitHub Pages

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 本地开发

```bash
# 克隆项目
git clone https://github.com/cuihairu/OpenCoreInitializr.git
cd OpenCoreInitializr

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 📋 功能特性

### 🎯 配置向导

1. **平台选择**: 选择 Intel 或 AMD 处理器平台
2. **硬件配置**: 详细配置 CPU、主板、显卡等硬件信息
3. **驱动选择**: 智能推荐并选择必需的 Kext 驱动
4. **最终确认**: 预览配置并生成 EFI 包

### 📦 自动化生成

- 📥 从 OpenCore 官方仓库下载最新配置模板
- ⚙️ 根据硬件配置自动定制 config.plist
- 📦 下载并整合必需的 Kext 驱动文件
- 🔧 应用硬件特定的补丁和修复
- 📁 生成完整的 EFI 文件夹结构
- 💾 打包为 ZIP 文件供用户下载

### 🎨 用户体验

- **详细进度显示**: 实时显示每个生成步骤的进度
- **错误处理**: 友好的错误提示和恢复机制
- **配置预览**: 生成前可预览完整的配置文件
- **历史记录**: 保存用户的配置历史（计划中）

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   ├── wizard/         # 配置向导组件
│   └── layout/         # 布局组件
├── lib/                # 核心逻辑
│   ├── config/         # OpenCore 配置生成
│   ├── package/        # EFI 包打包逻辑
│   ├── download/       # 文件下载管理
│   └── validation/     # 配置验证
├── data/               # 静态数据
│   ├── hardware/       # 硬件数据库
│   ├── kexts/          # Kext 信息
│   └── locales/        # 多语言文件
├── pages/              # 页面组件
├── types/              # TypeScript 类型定义
└── hooks/              # 自定义 React Hooks
```

## 🔧 开发状态

> ⚠️ **注意**: 本项目目前仍在积极开发中，功能可能不完整或存在 Bug。

### ✅ 已完成功能

- [x] 基础项目架构搭建
- [x] 配置向导界面
- [x] 硬件选择和配置
- [x] Kext 驱动选择
- [x] OpenCore 配置生成
- [x] EFI 包打包和下载
- [x] 详细的任务进度显示
- [x] 响应式界面设计

### 🚧 开发中功能

- [ ] 更多硬件型号支持
- [ ] 配置文件验证和优化
- [ ] 用户配置历史记录
- [ ] 高级配置选项
- [ ] 多语言完善
- [ ] 单元测试覆盖

### 📋 计划功能

- [ ] 在线配置编辑器
- [ ] 社区配置分享
- [ ] 自动更新检测
- [ ] 配置文件导入/导出
- [ ] 详细的使用文档

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

本工具仅用于学习和研究目的。使用本工具生成的配置文件时，请确保：

1. 遵守当地法律法规
2. 拥有合法的 macOS 许可证
3. 理解 Hackintosh 的风险和限制
4. 备份重要数据

作者不对使用本工具造成的任何损失承担责任。

## 🔗 相关链接

- [OpenCore 官方文档](https://dortania.github.io/OpenCore-Install-Guide/)
- [Dortania 安装指南](https://dortania.github.io/)
- [OpenCore 仓库](https://github.com/acidanthera/OpenCorePkg)

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**
