import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'data', 'locales');

// 需要修复的语言文件
const languagesToFix = ['es', 'de', 'fr', 'ru'];

// 修复函数
function fixNavigationKexts(filePath) {
  console.log(`修复文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 检查是否存在问题
    if (data.navigation && typeof data.navigation.kexts === 'object' && data.navigation.kexts.title) {
      console.log(`  发现问题结构，正在修复...`);
      
      // 保存kexts对象的内容
      const kextsContent = data.navigation.kexts;
      
      // 修复navigation.kexts为字符串
      data.navigation.kexts = kextsContent.title || 'Kext Selection';
      
      // 添加缺失的navigation字段
      if (!data.navigation.tools) data.navigation.tools = getTranslation('tools', filePath);
      if (!data.navigation.drivers) data.navigation.drivers = getTranslation('drivers', filePath);
      if (!data.navigation.confirmation) data.navigation.confirmation = getTranslation('confirmation', filePath);
      if (!data.navigation.download) data.navigation.download = getTranslation('download', filePath);
      if (!data.navigation.help) data.navigation.help = getTranslation('help', filePath);
      if (!data.navigation.settings) data.navigation.settings = getTranslation('settings', filePath);
      if (!data.navigation.docs) data.navigation.docs = getTranslation('docs', filePath);
      
      // 创建独立的kexts对象
      data.kexts = {
        title: kextsContent.title || 'Kext Selection',
        search: kextsContent.search || 'Search Kexts',
        search_placeholder: kextsContent.search_placeholder || 'Search kexts...',
        priority: kextsContent.priority || 'Priority',
        select_priority: kextsContent.select_priority || 'Select priority',
        all_priorities: kextsContent.all_priorities || 'All priorities',
        essential: kextsContent.essential || 'Essential',
        recommended: kextsContent.recommended || 'Recommended',
        optional: kextsContent.optional || 'Optional',
        category: kextsContent.category || 'Category',
        all_drivers: kextsContent.all_drivers || 'All Drivers',
        recommended_drivers: kextsContent.recommended_drivers || 'Recommended Drivers',
        recent_updates: kextsContent.recent_updates || 'Recent Updates',
        loading: kextsContent.loading || 'Loading...',
        essential_drivers: kextsContent.essential_drivers || 'Essential Drivers',
        optional_drivers: kextsContent.optional_drivers || 'Optional Drivers'
      };
      
      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  ✅ 修复完成`);
    } else {
      console.log(`  ✅ 结构正常，无需修复`);
    }
  } catch (error) {
    console.error(`  ❌ 修复失败: ${error.message}`);
  }
}

// 获取翻译文本的辅助函数
function getTranslation(key, filePath) {
  const lang = path.basename(filePath, '.json');
  const translations = {
    es: {
      tools: 'Herramientas y Utilidades',
      drivers: 'Controladores UEFI',
      confirmation: 'Resumen de Configuración',
      download: 'Descargar y Empaquetar',
      help: 'Ayuda y Documentación',
      settings: 'Configuración',
      docs: 'Documentación'
    },
    de: {
      tools: 'Tools und Dienstprogramme',
      drivers: 'UEFI-Treiber',
      confirmation: 'Konfigurationsübersicht',
      download: 'Download und Paket',
      help: 'Hilfe und Dokumentation',
      settings: 'Einstellungen',
      docs: 'Dokumentation'
    },
    fr: {
      tools: 'Outils et Utilitaires',
      drivers: 'Pilotes UEFI',
      confirmation: 'Résumé de Configuration',
      download: 'Télécharger et Empaqueter',
      help: 'Aide et Documentation',
      settings: 'Paramètres',
      docs: 'Documentation'
    },
    ru: {
      tools: 'Инструменты и Утилиты',
      drivers: 'UEFI Драйверы',
      confirmation: 'Сводка Конфигурации',
      download: 'Скачать и Упаковать',
      help: 'Справка и Документация',
      settings: 'Настройки',
      docs: 'Документация'
    }
  };
  
  return translations[lang]?.[key] || key;
}

// 主函数
function main() {
  console.log('开始修复navigation.kexts结构问题...');
  
  languagesToFix.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      fixNavigationKexts(filePath);
    } else {
      console.log(`文件不存在: ${filePath}`);
    }
  });
  
  console.log('\n✅ 修复完成！');
}

main();