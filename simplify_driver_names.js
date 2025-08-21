import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function simplifyDriverName(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 如果name字段是对象，将其简化为字符串
    if (data.name && typeof data.name === 'object') {
      const nameValue = data.name.en || data.name['zh-CN'] || data.name.zh || 'Unknown';
      data.name = nameValue;
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Simplified name in: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⏭️  Skipped: ${path.basename(filePath)} (name already simplified)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
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
  
  console.log(`🚀 Found ${files.length} driver files to process...\n`);
  
  let simplifiedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  files.forEach(filePath => {
    const result = simplifyDriverName(filePath);
    if (result === true) {
      simplifiedCount++;
    } else if (result === false) {
      skippedCount++;
    } else {
      errorCount++;
    }
  });
  
  console.log(`\n📊 Processing Summary:`);
  console.log(`✅ Simplified: ${simplifiedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (errorCount === 0) {
    console.log('🎉 All driver names simplified successfully!');
  }
}

main();