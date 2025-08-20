#!/usr/bin/env node

/**
 * 驱动版本自动更新脚本
 * 检查GitHub仓库的最新版本并更新JSON文件中的版本信息
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub API配置
const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_DELAY = 1000; // API请求间隔（毫秒）

/**
 * 发送HTTP请求
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpenCore-Driver-Version-Checker',
        // Add Authorization header if a token is provided
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 从GitHub仓库获取最新版本信息
 */
async function getLatestRelease(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      console.warn(`无效的GitHub URL: ${repoUrl}`);
      return null;
    }
    
    const [, owner, repo] = match;
    const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo.replace('.git', '')}/releases/latest`;
    
    console.log(`正在检查: ${owner}/${repo}`);
    const response = await makeRequest(apiUrl);
    
    return {
      version: response.tag_name.replace(/^v/, ''),
      releaseDate: response.published_at.split('T')[0],
      downloadUrl: response.html_url,
      changelog: response.body || '版本更新',
      assets: response.assets || []
    };
  } catch (error) {
    console.warn(`获取 ${repoUrl} 版本信息失败:`, error.message);
    return null;
  }
}

/**
 * 简单的版本比较函数
 */
function compareVersions(version1, version2) {
    // Handle non-semantic versions by removing leading 'v' and splitting
    const cleanV1 = String(version1).replace(/^v/, '');
    const cleanV2 = String(version2).replace(/^v/, '');

    const v1parts = cleanV1.split('.').map(part => part.match(/^\d+/)?.[0] || '0').map(Number);
    const v2parts = cleanV2.split('.').map(part => part.match(/^\d+/)?.[0] || '0').map(Number);

    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
        const v1part = v1parts[i] || 0;
        const v2part = v2parts[i] || 0;

        if (v1part < v2part) return -1;
        if (v1part > v2part) return 1;
    }

    return 0;
}


/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (!bytes) return '未知';
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * 更新单个驱动文件中的版本信息
 */
async function updateSingleDriverFile(filePath) {
  try {
    const driver = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fileModified = false;
    
    const repoUrl = driver.source || driver.github?.repositoryUrl || driver.links?.github;
    const driverName = driver.name?.en || driver.name || driver.id;

    if (repoUrl && driver.version) {
      const latestInfo = await getLatestRelease(repoUrl);
      
      if (latestInfo) {
        // User wants to use the release date as the "last updated" time.
        const latestReleaseDate = latestInfo.releaseDate;

        // Update lastUpdated field if it's different from the latest release date
        if (driver.version.lastUpdated !== latestReleaseDate) {
            driver.version.lastUpdated = latestReleaseDate;
            fileModified = true;
        }

        const currentVersion = driver.version.version;
        const latestVersion = latestInfo.version;
        
        const comparison = compareVersions(currentVersion, latestVersion);
        
        if (comparison < 0) {
          console.log(`✅ 发现 ${driverName} 新版本: ${currentVersion} -> ${latestVersion}`);
          
          driver.version.version = latestVersion;
          driver.version.releaseDate = latestInfo.releaseDate;
          // lastUpdated is already set
          driver.version.downloadUrl = latestInfo.downloadUrl;
          driver.version.changelog = latestInfo.changelog.substring(0, 300) + (latestInfo.changelog.length > 300 ? '...' : '');
          driver.version.isLatest = true;
          
          if (latestInfo.assets.length > 0) {
            const mainAsset = latestInfo.assets.find(asset => 
              asset.name.toLowerCase().includes('release') && asset.name.endsWith('.zip')
            ) || latestInfo.assets.find(asset => asset.name.endsWith('.zip')) || latestInfo.assets[0];
            
            if (mainAsset && mainAsset.size) {
              driver.version.fileSize = formatFileSize(mainAsset.size);
            }
          }
          
          fileModified = true;
        } else if (comparison === 0) {
          console.log(`ℹ️  ${driverName} 已是最新版本: ${currentVersion}`);
        } else {
          console.log(`⚠️  ${driverName} 当前版本 ${currentVersion} 比仓库版本 ${latestVersion} 更新`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    } else {
      console.log(`⏭️  跳过 ${driverName}：无GitHub仓库信息`);
    }
    
    if (fileModified) {
      fs.writeFileSync(filePath, JSON.stringify(driver, null, 2) + '\n');
      console.log(`📝 已更新文件: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理文件 ${path.basename(filePath)} 时出错:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始检查驱动版本更新...');
  
  const driversDir = path.join(__dirname, '..', 'src', 'data', 'driver-support', 'drivers');
  
  if (!fs.existsSync(driversDir)) {
    console.error(`❌ 驱动数据目录不存在: ${driversDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(driversDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(driversDir, file));
  
  console.log(`📁 找到 ${files.length} 个驱动文件`);
  
  let totalUpdates = 0;
  const startTime = Date.now();
  
  for (const file of files) {
    try {
      const hasUpdate = await updateSingleDriverFile(file);
      if (hasUpdate) totalUpdates++;
    } catch (error) {
      console.error(`❌ 处理文件失败: ${file}`, error.message);
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`\n🎉 检查完成！`);
  console.log(`⏱️  耗时: ${duration} 秒`);
  console.log(`📊 更新统计: ${totalUpdates}/${files.length} 个文件有更新`);
  
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=${totalUpdates > 0}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `update_count=${totalUpdates}\n`);
  }
  
  return totalUpdates;
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main, updateSingleDriverFile, getLatestRelease };