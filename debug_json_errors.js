import fs from 'fs';
import path from 'path';

// 需要检查的文件列表
const filesToCheck = [
  'fr.json',
  'es.json', 
  'ko.json'
];

const localesDir = './src/data/locales';

filesToCheck.forEach(filename => {
  const filePath = path.join(localesDir, filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      JSON.parse(content);
      console.log(`✅ ${filename}: JSON格式正确`);
    } catch (parseError) {
      console.log(`❌ ${filename}: JSON格式错误:`, parseError.message);
      
      // 尝试找到错误位置的上下文
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const position = parseInt(errorMatch[1]);
        const start = Math.max(0, position - 50);
        const end = Math.min(content.length, position + 50);
        const context = content.substring(start, end);
        
        console.log(`错误位置 ${position} 附近的内容:`);
        console.log(`"${context}"`);
        console.log(' '.repeat(Math.min(50, position - start)) + '^');
        
        // 显示错误字符的详细信息
        const errorChar = content[position];
        const errorCharCode = content.charCodeAt(position);
        console.log(`错误字符: '${errorChar}' (Unicode: ${errorCharCode})`);
        
        // 检查是否有不可见字符
        if (errorCharCode < 32 || errorCharCode > 126) {
          console.log('⚠️  发现不可见字符或特殊字符');
        }
      }
      console.log('---');
    }
    
  } catch (error) {
    console.error(`❌ 读取 ${filename} 时出错:`, error.message);
  }
});

console.log('\n🔍 JSON错误调试完成！');