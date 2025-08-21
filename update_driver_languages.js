const fs = require('fs');
const path = require('path');

// 驱动文件目录
const driversDir = './src/data/driver-support/drivers';

// 语言映射函数
function updateLanguageCodes(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(updateLanguageCodes);
  }
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'zh' && typeof value === 'string') {
      // 将 zh 替换为 zh-CN 和 zh-TW
      result['zh-CN'] = value;
      result['zh-TW'] = getTraditionalChinese(value);
      result['ja'] = getJapanese(value);
      result['de'] = getGerman(value);
      result['ru'] = getRussian(value);
    } else if (typeof value === 'object' && value !== null && 'zh' in value && 'en' in value) {
      // 处理包含语言对象的情况
      result[key] = {
        en: value.en,
        'zh-CN': value.zh,
        'zh-TW': getTraditionalChinese(value.zh),
        ja: getJapanese(value.zh, value.en),
        de: getGerman(value.zh, value.en),
        ru: getRussian(value.zh, value.en)
      };
    } else {
      result[key] = updateLanguageCodes(value);
    }
  }
  
  return result;
}

// 简体转繁体的基本映射
function getTraditionalChinese(simplified) {
  const mapping = {
    '驱动': '驅動程式',
    '音频': '音訊',
    '网络': '網路',
    '无线': '無線',
    '有线': '有線',
    '蓝牙': '藍牙',
    '显卡': '顯示卡',
    '传感器': '感測器',
    '输入设备': '輸入裝置',
    '触控板': '觸控板',
    '键盘': '鍵盤',
    '系统': '系統',
    '声音': '聲音',
    '启用': '啟用',
    '功能': '功能',
    '支持': '支援',
    '修复': '修復',
    '原生': '原生',
    '连续互通': '連續互通',
    '博通': '博通',
    '瑞昱': '瑞昱',
    '英特尔': '英特爾',
    '英伟达': '輝達'
  };
  
  let result = simplified;
  for (const [s, t] of Object.entries(mapping)) {
    result = result.replace(new RegExp(s, 'g'), t);
  }
  return result;
}

// 获取日语翻译（基本映射）
function getJapanese(chinese, english = '') {
  const mapping = {
    'WiFi': 'WiFi',
    '音频': 'オーディオ',
    '声音': 'サウンド',
    '网络': 'ネットワーク',
    '无线网络': 'ワイヤレスネットワーク',
    '蓝牙': 'Bluetooth',
    '显卡': 'グラフィックス',
    '传感器': 'センサー',
    '输入设备': '入力デバイス',
    '触控板': 'トラックパッド',
    '键盘': 'キーボード',
    '系统': 'システム',
    '连续互通': '連携機能',
    'USB': 'USB',
    'CPU': 'CPU'
  };
  
  return mapping[chinese] || english || chinese;
}

// 获取德语翻译（基本映射）
function getGerman(chinese, english = '') {
  const mapping = {
    'WiFi': 'WiFi',
    '音频': 'Audio',
    '声音': 'Sound',
    '网络': 'Netzwerk',
    '无线网络': 'Drahtloses Netzwerk',
    '蓝牙': 'Bluetooth',
    '显卡': 'Grafik',
    '传感器': 'Sensoren',
    '输入设备': 'Eingabegeräte',
    '触控板': 'Trackpad',
    '键盘': 'Tastatur',
    '系统': 'System',
    '连续互通': 'Kontinuität',
    'USB': 'USB',
    'CPU': 'CPU'
  };
  
  return mapping[chinese] || english || chinese;
}

// 获取俄语翻译（基本映射）
function getRussian(chinese, english = '') {
  const mapping = {
    'WiFi': 'WiFi',
    '音频': 'Аудио',
    '声音': 'Звук',
    '网络': 'Сеть',
    '无线网络': 'Беспроводная сеть',
    '蓝牙': 'Bluetooth',
    '显卡': 'Графика',
    '传感器': 'Датчики',
    '输入设备': 'Устройства ввода',
    '触控板': 'Трекпад',
    '键盘': 'Клавиатура',
    '系统': 'Система',
    '连续互通': 'Непрерывность',
    'USB': 'USB',
    'CPU': 'Процессор'
  };
  
  return mapping[chinese] || english || chinese;
}

// 处理所有驱动文件
function processAllDrivers() {
  const files = fs.readdirSync(driversDir);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(driversDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // 更新语言代码
        const updatedData = updateLanguageCodes(data);
        
        // 写回文件
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
        
        console.log(`✅ Updated: ${file}`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
  });
}

// 执行处理
console.log('开始批量更新驱动文件语言代码...');
processAllDrivers();
console.log('批量更新完成！');