import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== 修复驱动文件中的 zh 标签 ===');

const driversDir = path.join(__dirname, 'src/data/driver-support/drivers');

if (!fs.existsSync(driversDir)) {
  console.error('驱动目录不存在:', driversDir);
  process.exit(1);
}

const files = fs.readdirSync(driversDir).filter(file => file.endsWith('.json'));
console.log(`找到 ${files.length} 个驱动文件`);

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(driversDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let hasChanges = false;
    
    // 检查并修复 tags 中的 zh 标签
    if (data.tags) {
      Object.keys(data.tags).forEach(tagKey => {
        const tag = data.tags[tagKey];
        if (tag && typeof tag === 'object' && tag.zh) {
          // 将 zh 改为 zh-CN
          tag['zh-CN'] = tag.zh;
          delete tag.zh;
          hasChanges = true;
          console.log(`${file}: 修复标签 ${tagKey} 中的 zh -> zh-CN`);
        }
      });
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      totalFixed++;
    }
    
  } catch (error) {
    console.error(`处理文件 ${file} 时出错:`, error.message);
  }
});

console.log(`\n=== 修复完成 ===`);
console.log(`总共修复了 ${totalFixed} 个文件`);