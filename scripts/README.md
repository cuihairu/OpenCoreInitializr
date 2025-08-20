# 驱动版本自动更新脚本

这个目录包含用于自动检查和更新驱动版本信息的脚本。

## 文件说明

### `update-driver-versions.cjs`

主要的版本更新脚本，功能包括：

- 🔍 自动检查所有驱动的GitHub仓库
- 📊 比较当前版本与最新版本
- 📝 自动更新JSON文件中的版本信息
- 🛡️ 错误处理和跳过机制
- 📈 详细的执行日志和统计

## 使用方法

### 本地运行

```bash
# 在项目根目录下运行
node scripts/update-driver-versions.cjs
```

### GitHub Actions自动运行

脚本会通过 `.github/workflows/update-driver-versions.yml` 每天自动运行：

- ⏰ 每天UTC时间02:00（北京时间10:00）自动执行
- 🔄 也可以手动触发工作流
- 📋 如果有版本更新，会自动创建Pull Request

## 工作原理

1. **扫描驱动文件**：读取 `src/data/driver-support/` 目录下的所有JSON文件
2. **提取仓库信息**：从每个驱动的 `githubRepo` 或 `links.github` 字段获取GitHub仓库URL
3. **查询最新版本**：调用GitHub API获取最新的release信息
4. **版本比较**：使用语义化版本比较当前版本和最新版本
5. **更新信息**：如果发现新版本，更新以下字段：
   - `version.version` - 版本号
   - `version.releaseDate` - 发布日期
   - `version.lastUpdated` - 最后更新日期
   - `version.downloadUrl` - 下载链接
   - `version.changelog` - 更新日志
   - `version.fileSize` - 文件大小（如果可获取）

## 错误处理

脚本具有完善的错误处理机制：

- ❌ **API请求失败**：记录警告并跳过该驱动
- ❌ **无效的GitHub URL**：跳过处理
- ❌ **版本格式错误**：跳过版本比较
- ❌ **文件读写错误**：记录错误并继续处理其他文件
- ⏱️ **API限制**：请求间添加1秒延迟避免触发限制

## 输出格式

脚本运行时会显示详细的进度信息：

```
🚀 开始检查驱动版本更新...
📁 找到 2 个驱动文件

正在处理文件: src/data/driver-support/essential.json
正在检查: acidanthera/Lilu
✅ 发现 Lilu 新版本: 1.6.7 -> 1.6.8
正在检查: acidanthera/VirtualSMC
ℹ️  VirtualSMC 已是最新版本: 1.3.2
📝 已更新文件: src/data/driver-support/essential.json

🎉 检查完成！
⏱️  耗时: 15 秒
📊 更新统计: 1/2 个文件有更新
```

## 配置说明

### 环境变量

- `GITHUB_OUTPUT` - GitHub Actions输出文件路径（自动设置）

### 配置参数

在脚本中可以调整以下参数：

```javascript
const REQUEST_DELAY = 1000; // API请求间隔（毫秒）
```

## 支持的版本格式

脚本支持以下版本号格式：

- ✅ `1.2.3` - 标准语义化版本
- ✅ `v1.2.3` - 带v前缀的版本（自动移除前缀）
- ✅ `1.2` - 两位版本号
- ✅ `1.2.3-beta` - 预发布版本

## 注意事项

1. **API限制**：GitHub API有速率限制，脚本已添加延迟机制
2. **网络依赖**：需要稳定的网络连接访问GitHub API
3. **权限要求**：GitHub Actions需要写入权限来创建PR
4. **数据备份**：建议在大量更新前备份原始数据

## 故障排除

### 常见问题

**Q: 脚本报告"无效的GitHub URL"**
A: 检查驱动数据中的 `githubRepo` 或 `links.github` 字段格式是否正确

**Q: 版本比较不准确**
A: 确保版本号遵循语义化版本规范，避免使用特殊字符

**Q: API请求失败**
A: 可能是网络问题或GitHub API限制，脚本会自动跳过并继续处理

### 调试模式

如需更详细的调试信息，可以修改脚本中的日志级别或添加额外的console.log语句。

## 贡献

如果需要改进脚本功能，请：

1. 在 `scripts/update-driver-versions.js` 中修改逻辑
2. 测试本地运行是否正常
3. 更新此README文档
4. 提交Pull Request