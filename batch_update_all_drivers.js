import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 简体中文到繁体中文的映射
const zhMapping = {
  '系统': '系統',
  '电源管理': '電源管理',
  '性能优化': '效能最佳化',
  '内核崩溃': '核心當機',
  '修复': '修復',
  '无线网络': '無線網路',
  '英特尔': '英特爾',
  '端口映射': '連接埠映射',
  '配置文件': '配置檔案',
  '驱动': '驅動程式',
  '网卡': '網卡',
  '声卡': '音效卡',
  '显卡': '顯示卡',
  '处理器': '處理器',
  '传感器': '感測器',
  '电池': '電池',
  '管理': '管理',
  '监控': '監控',
  '优化': '最佳化',
  '支持': '支援',
  '功能': '功能',
  '兼容': '相容',
  '修复': '修復',
  '启用': '啟用',
  '禁用': '禁用',
  '增强': '增強',
  '改进': '改進'
};

function convertToTraditional(text) {
  let result = text;
  for (const [simplified, traditional] of Object.entries(zhMapping)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  return result;
}

function updateLanguageKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(updateLanguageKeys);
  }

  const updated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'name' && typeof value === 'object' && value !== null) {
       // name字段只保留英文版本，转换为字符串
       updated[key] = value.en || value['zh-CN'] || value.zh || 'Unknown';
    } else if (typeof value === 'object' && value !== null && value.hasOwnProperty('zh')) {
      // 处理包含zh键的对象
      const newValue = { ...value };
      const zhText = newValue.zh;
      delete newValue.zh;
      
      newValue['zh-CN'] = zhText;
      newValue['zh-TW'] = convertToTraditional(zhText);
      
      // 添加其他语言支持（使用英文内容）
      if (newValue.en) {
        newValue.ja = newValue.en;
        newValue.de = newValue.en;
        newValue.ru = newValue.en;
      }
      
      updated[key] = newValue;
    } else {
      updated[key] = updateLanguageKeys(value);
    }
  }
  
  return updated;
}

function updateDriverFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    const updatedData = updateLanguageKeys(data);
    
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`✅ Updated: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

function main() {
  const driversDir = path.join(__dirname, 'src/data/driver-support/drivers');
  
  if (!fs.existsSync(driversDir)) {
    console.error('❌ Drivers directory not found:', driversDir);
    return;
  }
  
  const files = fs.readdirSync(driversDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(driversDir, file));
  
  console.log(`🚀 Found ${files.length} driver files to update...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  files.forEach(filePath => {
    if (updateDriverFile(filePath)) {
      successCount++;
    } else {
      errorCount++;
    }
  });
  
  console.log(`\n📊 Update Summary:`);
  console.log(`✅ Successfully updated: ${successCount} files`);
  console.log(`❌ Failed to update: ${errorCount} files`);
  
  if (errorCount === 0) {
    console.log('🎉 All driver files updated successfully!');
  }
}

main();