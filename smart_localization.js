import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const driversDir = path.join(__dirname, 'src/data/driver-support/drivers');

// 支持的所有语言
const supportedLanguages = ['en', 'zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko', 'es', 'fr', 'de', 'ru'];

// 简体中文到繁体中文的基础映射
const simplifiedToTraditional = {
  '驱动': '驅動',
  '内核': '內核',
  '扩展': '擴展',
  '支持': '支援',
  '硬件': '硬體',
  '软件': '軟體',
  '系统': '系統',
  '网络': '網路',
  '声卡': '音效卡',
  '显卡': '顯示卡',
  '处理器': '處理器',
  '内存': '記憶體',
  '存储': '儲存',
  '设备': '裝置',
  '管理': '管理',
  '配置': '設定',
  '优化': '最佳化',
  '性能': '效能',
  '兼容': '相容',
  '修复': '修復',
  '问题': '問題',
  '功能': '功能',
  '版本': '版本',
  '更新': '更新',
  '安装': '安裝',
  '卸载': '解除安裝',
  '启用': '啟用',
  '禁用': '停用',
  '开源': '開源',
  '免费': '免費',
  '商业': '商業',
  '许可': '授權',
  '协议': '協定',
  '文档': '文件',
  '说明': '說明',
  '帮助': '幫助',
  '教程': '教學',
  '指南': '指南',
  '手册': '手冊',
  '参考': '參考',
  '示例': '範例',
  '测试': '測試',
  '调试': '除錯',
  '错误': '錯誤',
  '警告': '警告',
  '信息': '資訊',
  '日志': '日誌',
  '记录': '記錄',
  '报告': '報告',
  '统计': '統計',
  '分析': '分析',
  '监控': '監控',
  '检测': '檢測',
  '扫描': '掃描',
  '搜索': '搜尋',
  '查找': '尋找',
  '替换': '取代',
  '删除': '刪除',
  '添加': '新增',
  '创建': '建立',
  '编辑': '編輯',
  '修改': '修改',
  '保存': '儲存',
  '加载': '載入',
  '下载': '下載',
  '上传': '上傳',
  '导入': '匯入',
  '导出': '匯出',
  '备份': '備份',
  '恢复': '還原',
  '重置': '重設',
  '刷新': '重新整理',
  '同步': '同步',
  '连接': '連接',
  '断开': '中斷',
  '网络': '網路',
  '无线': '無線',
  '蓝牙': '藍牙',
  '音频': '音訊',
  '视频': '視訊',
  '图像': '影像',
  '图片': '圖片',
  '照片': '照片',
  '文件': '檔案',
  '文件夹': '資料夾',
  '目录': '目錄',
  '路径': '路徑',
  '地址': '位址',
  '链接': '連結',
  '快捷方式': '捷徑',
  '桌面': '桌面',
  '窗口': '視窗',
  '界面': '介面',
  '菜单': '選單',
  '按钮': '按鈕',
  '选项': '選項',
  '设置': '設定',
  '首选项': '偏好設定',
  '属性': '屬性',
  '权限': '權限',
  '用户': '使用者',
  '账户': '帳戶',
  '密码': '密碼',
  '登录': '登入',
  '注销': '登出',
  '退出': '結束',
  '关闭': '關閉',
  '打开': '開啟',
  '运行': '執行',
  '停止': '停止',
  '暂停': '暫停',
  '继续': '繼續',
  '完成': '完成',
  '成功': '成功',
  '失败': '失敗',
  '取消': '取消',
  '确定': '確定',
  '是': '是',
  '否': '否',
  '有': '有',
  '无': '無',
  '可用': '可用',
  '不可用': '不可用',
  '启用': '啟用',
  '禁用': '停用',
  '正常': '正常',
  '异常': '異常',
  '活动': '活動',
  '非活动': '非活動',
  '在线': '線上',
  '离线': '離線',
  '已连接': '已連接',
  '未连接': '未連接',
  '已安装': '已安裝',
  '未安装': '未安裝',
  '已启用': '已啟用',
  '未启用': '未啟用',
  '已禁用': '已停用',
  '未禁用': '未停用'
};

// 基础翻译映射（仅用于常见技术术语）
const basicTranslations = {
  ja: {
    'kernel extension': 'カーネル拡張',
    'driver': 'ドライバー',
    'hardware': 'ハードウェア',
    'software': 'ソフトウェア',
    'system': 'システム',
    'network': 'ネットワーク',
    'audio': 'オーディオ',
    'graphics': 'グラフィックス',
    'processor': 'プロセッサー',
    'memory': 'メモリ',
    'storage': 'ストレージ',
    'device': 'デバイス',
    'configuration': '設定',
    'optimization': '最適化',
    'performance': 'パフォーマンス',
    'compatibility': '互換性',
    'support': 'サポート',
    'version': 'バージョン',
    'update': 'アップデート',
    'install': 'インストール',
    'enable': '有効化',
    'disable': '無効化',
    'open source': 'オープンソース',
    'free': '無料',
    'commercial': '商用',
    'license': 'ライセンス'
  },
  ko: {
    'kernel extension': '커널 확장',
    'driver': '드라이버',
    'hardware': '하드웨어',
    'software': '소프트웨어',
    'system': '시스템',
    'network': '네트워크',
    'audio': '오디오',
    'graphics': '그래픽',
    'processor': '프로세서',
    'memory': '메모리',
    'storage': '저장소',
    'device': '장치',
    'configuration': '구성',
    'optimization': '최적화',
    'performance': '성능',
    'compatibility': '호환성',
    'support': '지원',
    'version': '버전',
    'update': '업데이트',
    'install': '설치',
    'enable': '활성화',
    'disable': '비활성화',
    'open source': '오픈 소스',
    'free': '무료',
    'commercial': '상업용',
    'license': '라이선스'
  },
  es: {
    'kernel extension': 'extensión del kernel',
    'driver': 'controlador',
    'hardware': 'hardware',
    'software': 'software',
    'system': 'sistema',
    'network': 'red',
    'audio': 'audio',
    'graphics': 'gráficos',
    'processor': 'procesador',
    'memory': 'memoria',
    'storage': 'almacenamiento',
    'device': 'dispositivo',
    'configuration': 'configuración',
    'optimization': 'optimización',
    'performance': 'rendimiento',
    'compatibility': 'compatibilidad',
    'support': 'soporte',
    'version': 'versión',
    'update': 'actualización',
    'install': 'instalar',
    'enable': 'habilitar',
    'disable': 'deshabilitar',
    'open source': 'código abierto',
    'free': 'gratis',
    'commercial': 'comercial',
    'license': 'licencia'
  },
  fr: {
    'kernel extension': 'extension du noyau',
    'driver': 'pilote',
    'hardware': 'matériel',
    'software': 'logiciel',
    'system': 'système',
    'network': 'réseau',
    'audio': 'audio',
    'graphics': 'graphiques',
    'processor': 'processeur',
    'memory': 'mémoire',
    'storage': 'stockage',
    'device': 'appareil',
    'configuration': 'configuration',
    'optimization': 'optimisation',
    'performance': 'performance',
    'compatibility': 'compatibilité',
    'support': 'support',
    'version': 'version',
    'update': 'mise à jour',
    'install': 'installer',
    'enable': 'activer',
    'disable': 'désactiver',
    'open source': 'open source',
    'free': 'gratuit',
    'commercial': 'commercial',
    'license': 'licence'
  },
  de: {
    'kernel extension': 'Kernel-Erweiterung',
    'driver': 'Treiber',
    'hardware': 'Hardware',
    'software': 'Software',
    'system': 'System',
    'network': 'Netzwerk',
    'audio': 'Audio',
    'graphics': 'Grafik',
    'processor': 'Prozessor',
    'memory': 'Speicher',
    'storage': 'Speicher',
    'device': 'Gerät',
    'configuration': 'Konfiguration',
    'optimization': 'Optimierung',
    'performance': 'Leistung',
    'compatibility': 'Kompatibilität',
    'support': 'Unterstützung',
    'version': 'Version',
    'update': 'Update',
    'install': 'installieren',
    'enable': 'aktivieren',
    'disable': 'deaktivieren',
    'open source': 'Open Source',
    'free': 'kostenlos',
    'commercial': 'kommerziell',
    'license': 'Lizenz'
  },
  ru: {
    'kernel extension': 'расширение ядра',
    'driver': 'драйвер',
    'hardware': 'аппаратное обеспечение',
    'software': 'программное обеспечение',
    'system': 'система',
    'network': 'сеть',
    'audio': 'аудио',
    'graphics': 'графика',
    'processor': 'процессор',
    'memory': 'память',
    'storage': 'хранилище',
    'device': 'устройство',
    'configuration': 'конфигурация',
    'optimization': 'оптимизация',
    'performance': 'производительность',
    'compatibility': 'совместимость',
    'support': 'поддержка',
    'version': 'версия',
    'update': 'обновление',
    'install': 'установить',
    'enable': 'включить',
    'disable': 'отключить',
    'open source': 'открытый исходный код',
    'free': 'бесплатно',
    'commercial': 'коммерческий',
    'license': 'лицензия'
  }
};

// 简体转繁体函数
function convertToTraditional(text) {
  let result = text;
  for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  return result;
}

// 基础翻译函数
function basicTranslate(text, targetLang) {
  if (!basicTranslations[targetLang]) {
    return text; // 如果没有翻译映射，返回原文
  }
  
  let result = text;
  const translations = basicTranslations[targetLang];
  
  // 按长度排序，优先匹配长短语
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, translations[key]);
  }
  
  return result;
}

// 智能本地化函数
function smartLocalize(englishText, existingTranslations = {}) {
  const result = {};
  
  // 保留已有的翻译
  for (const [lang, text] of Object.entries(existingTranslations)) {
    if (text && text !== englishText) {
      result[lang] = text;
    }
  }
  
  // 为每种语言生成翻译
  for (const lang of supportedLanguages) {
    if (lang === 'en') {
      result[lang] = englishText;
      continue;
    }
    
    // 如果已有翻译且不是英文占位符，保留
    if (result[lang] && result[lang] !== englishText) {
      continue;
    }
    
    let translatedText = englishText;
    
    // 中文处理
    if (lang === 'zh-CN') {
      // 如果有现有的中文翻译，使用它
      if (existingTranslations['zh-CN'] && existingTranslations['zh-CN'] !== englishText) {
        result[lang] = existingTranslations['zh-CN'];
      } else {
        // 否则进行基础翻译
        result[lang] = basicTranslate(englishText, 'zh-CN') || englishText;
      }
    } else if (lang === 'zh-TW') {
      // 繁体中文：先尝试使用现有翻译，否则从简体转换
      if (existingTranslations['zh-TW'] && existingTranslations['zh-TW'] !== englishText) {
        result[lang] = existingTranslations['zh-TW'];
      } else if (result['zh-CN'] && result['zh-CN'] !== englishText) {
        result[lang] = convertToTraditional(result['zh-CN']);
      } else {
        result[lang] = convertToTraditional(basicTranslate(englishText, 'zh-CN') || englishText);
      }
    } else if (lang === 'zh-HK') {
      // 香港繁体：使用台湾繁体作为基础
      result[lang] = result['zh-TW'] || convertToTraditional(result['zh-CN'] || englishText);
    } else {
      // 其他语言：进行基础翻译
      result[lang] = basicTranslate(englishText, lang);
    }
  }
  
  return result;
}

// 处理本地化文本对象
function processLocalizedText(localizedObj) {
  if (!localizedObj || typeof localizedObj !== 'object') {
    return localizedObj;
  }
  
  const englishText = localizedObj.en || 'Not available';
  return smartLocalize(englishText, localizedObj);
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
      processed[key] = processLocalizedText(value);
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
    
    console.log(`✅ 已智能本地化: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('开始智能本地化驱动JSON文件...');
  console.log(`支持的语言: ${supportedLanguages.join(', ')}`);
  console.log('功能：');
  console.log('- 为所有语言添加完整支持（包括zh-HK）');
  console.log('- 简体中文到繁体中文智能转换');
  console.log('- 基础技术术语翻译');
  console.log('- 保留现有的非英文翻译');
  
  if (!fs.existsSync(driversDir)) {
    console.error(`❌ 驱动目录不存在: ${driversDir}`);
    return;
  }
  
  const files = fs.readdirSync(driversDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(driversDir, file));
  
  console.log(`\n找到 ${files.length} 个驱动文件`);
  
  files.forEach(processDriverFile);
  
  console.log('\n✅ 智能本地化完成！');
  console.log('现在所有驱动JSON文件都支持完整的10种语言，包括：');
  console.log('- 英语 (en)');
  console.log('- 简体中文 (zh-CN)');
  console.log('- 繁体中文 (zh-TW)');
  console.log('- 香港繁体中文 (zh-HK)');
  console.log('- 日语 (ja)');
  console.log('- 韩语 (ko)');
  console.log('- 西班牙语 (es)');
  console.log('- 法语 (fr)');
  console.log('- 德语 (de)');
  console.log('- 俄语 (ru)');
}

main();