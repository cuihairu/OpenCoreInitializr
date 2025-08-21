import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要修复的文件列表
const filesToFix = [
  'fr.json',
  'es.json', 
  'ko.json'
];

const localesDir = './src/data/locales';

filesToFix.forEach(filename => {
  const filePath = path.join(localesDir, filename);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 修复缺少逗号的问题
    // 在 "auto": "..." 后面添加逗号（如果后面跟着 }）
    content = content.replace(/"auto":\s*"[^"]*"\s*\n\s*}/g, match => {
      return match.replace(/"\s*\n/, '",\n');
    });
    
    // 在 "language": "..." 后面添加逗号（如果后面跟着 }）
    content = content.replace(/"language":\s*"[^"]*"\s*\n\s*}/g, match => {
      return match.replace(/"\s*\n/, '",\n');
    });
    
    // 验证JSON格式
    try {
      JSON.parse(content);
      console.log(`✅ ${filename}: JSON格式修复成功`);
    } catch (parseError) {
      console.log(`❌ ${filename}: JSON格式仍有问题:`, parseError.message);
      return;
    }
    
    // 写入修复后的内容
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 ${filename}: 文件已更新`);
    
  } catch (error) {
    console.error(`❌ 处理 ${filename} 时出错:`, error.message);
  }
});

console.log('\n🔍 JSON语法修复完成！');