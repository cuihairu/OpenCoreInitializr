import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const driversDir = path.join(__dirname, 'src/data/driver-support/drivers');

// 需要添加的语言
const missingLanguages = ['ko', 'es', 'fr'];

// 处理本地化文本对象
function addMissingLanguages(localizedObj) {
  if (!localizedObj || typeof localizedObj !== 'object') {
    return localizedObj;
  }
  
  // 获取英文文本作为默认值
  const englishText = localizedObj.en || 'Not available';
  
  // 为缺失的语言添加英文文本
  missingLanguages.forEach(lang => {
    if (!localizedObj[lang]) {
      localizedObj[lang] = englishText;
    }
  });
  
  return localizedObj;
}

// 递归处理对象中的所有本地化字段
function processObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processObject(item));
  }
  
  const processed = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'description' || key === 'notes') {
      // 这些是本地化字段
      processed[key] = addMissingLanguages(value);
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      processed[key] = processObject(value);
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

// 处理单个驱动文件
function processDriverFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 处理整个数据对象
    const processedData = processObject(data);
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2) + '\n');
    
    console.log(`✅ 已更新: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('开始为驱动JSON文件添加缺失的语言支持...');
  console.log(`需要添加的语言: ${missingLanguages.join(', ')}`);
  
  if (!fs.existsSync(driversDir)) {
    console.error(`❌ 驱动目录不存在: ${driversDir}`);
    return;
  }
  
  const files = fs.readdirSync(driversDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(driversDir, file));
  
  console.log(`找到 ${files.length} 个驱动文件`);
  
  files.forEach(processDriverFile);
  
  console.log('\n✅ 所有驱动文件已更新完成！');
  console.log('现在所有驱动JSON文件都支持完整的9种语言。');
}

main();