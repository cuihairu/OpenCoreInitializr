const fs = require('fs');
const path = require('path');

// 简体中文到繁体中文的基本映射
const zhCNToZhTW = {
  '显卡': '顯卡', '驱动': '驅動', '网络': '網路', '以太网': '乙太網路', '无线网络': '無線網路',
  '蓝牙': '藍牙', '音频': '音訊', '传感器': '感測器', '温度': '溫度', '电池': '電池',
  '键盘': '鍵盤', '触控板': '觸控板', '系统': '系統', '核心': '核心', '必需': '必需',
  '修补': '修補', '电源管理': '電源管理', '性能优化': '效能最佳化', '兼容性': '相容性',
  '休眠': '休眠', '睡眠': '睡眠', '存储': '儲存', '输入设备': '輸入裝置', '硬件监控': '硬體監控',
  '固件': '韌體', '无线': '無線', '端口映射': '連接埠對應', '配置文件': '設定檔',
  '主板监控': '主機板監控', '风扇控制': '風扇控制', '功能解锁': '功能解鎖', '锐龙': '銳龍',
  '笔记本': '筆記型電腦', '健康度': '健康度', '充电': '充電', '夜览': '夜覽',
  '蓝光过滤': '藍光過濾', '显示': '顯示', '英特尔': '英特爾', '原生': '原生',
  '千兆': '千兆', '嵌入式控制器': '嵌入式控制器', '补丁': '修補程式', '有线网络': '有線網路',
  '环境光': '環境光', '自动亮度': '自動亮度', '光线': '光線', '多点触控': '多點觸控',
  '触摸屏': '觸控螢幕', '集成显卡': '整合顯卡', '内核崩溃': '核心當機', '修复': '修復',
  '时钟同步': '時鐘同步', '多核': '多核心', '数字音频': '數位音訊'
};

function convertZhCNToZhTW(text) {
  let result = text;
  for (const [cn, tw] of Object.entries(zhCNToZhTW)) {
    result = result.replace(new RegExp(cn, 'g'), tw);
  }
  return result;
}

function updateDriverFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    let updated = false;

    // 更新 name 字段
    if (data.name && data.name.zh) {
      const zhCN = data.name.zh;
      const zhTW = convertZhCNToZhTW(zhCN);
      data.name = {
        en: data.name.en,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        ja: data.name.en,
        de: data.name.en,
        ru: data.name.en
      };
      updated = true;
    }

    // 更新 description 字段
    if (data.description && data.description.zh) {
      const zhCN = data.description.zh;
      const zhTW = convertZhCNToZhTW(zhCN);
      data.description = {
        en: data.description.en,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        ja: data.description.en,
        de: data.description.en,
        ru: data.description.en
      };
      updated = true;
    }

    // 更新 tags 字段
    if (data.tags && Array.isArray(data.tags)) {
      data.tags = data.tags.map(tag => {
        if (typeof tag === 'object' && tag.zh) {
          const zhCN = tag.zh;
          const zhTW = convertZhCNToZhTW(zhCN);
          updated = true;
          return {
            en: tag.en,
            'zh-CN': zhCN,
            'zh-TW': zhTW,
            ja: tag.en,
            de: tag.en,
            ru: tag.en
          };
        }
        return tag;
      });
    }

    // 更新 notes 字段
    if (data.notes && data.notes.zh) {
      const zhCN = data.notes.zh;
      const zhTW = convertZhCNToZhTW(zhCN);
      data.notes = {
        en: data.notes.en,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        ja: data.notes.en,
        de: data.notes.en,
        ru: data.notes.en
      };
      updated = true;
    }

    // 更新嵌套的 notes 字段（在 compatibility 中）
    if (data.compatibility && Array.isArray(data.compatibility)) {
      data.compatibility.forEach(comp => {
        if (comp.notes && comp.notes.zh) {
          const zhCN = comp.notes.zh;
          const zhTW = convertZhCNToZhTW(zhCN);
          comp.notes = {
            en: comp.notes.en,
            'zh-CN': zhCN,
            'zh-TW': zhTW,
            ja: comp.notes.en,
            de: comp.notes.en,
            ru: comp.notes.en
          };
          updated = true;
        }
      });
    }

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ 已更新: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

// 需要更新的文件列表
const filesToUpdate = [
  'AppleIGC.json', 'NootedRed.json', 'SMCLightSensor.json', 'hibernationfixup.json',
  'smcprocessor.json', 'restrictevents.json', 'IntelBTPatcher.json', 'IntelBluetoothFirmware.json',
  'smcsuperio.json', 'AppleMCEReporterDisabler.json', 'VoodooI2C.json', 'brcmpatchram.json',
  'NootRX.json', 'XHCI-unsupported.json', 'LucyRTL8125Ethernet.json', 'AppleALCU.json',
  'RealtekRTL8111.json', 'VoodooSMBus.json', 'bluetoolfixup.json', 'SMCAMDProcessor.json',
  'nightshiftenabler.json', 'featureunlock.json', 'RadeonSensor.json', 'cputscsync.json',
  'VoodooRMI.json', 'AMDRyzenCPUPowerManagement.json', 'SMCRadeonSensors.json', 'USBToolBox.json',
  'VoodooPS2.json', 'IntelMausi.json', 'SMCBatteryManager.json', 'AirportItlwm.json',
  'UTBMap.json', 'ECEnabler.json', 'AtherosE2200Ethernet.json', 'cpufriend.json', 'nvmefix.json'
];

const driversDir = path.join(__dirname, 'src/data/driver-support/drivers');

console.log(`开始处理 ${filesToUpdate.length} 个驱动文件...\n`);

filesToUpdate.forEach(file => {
  const filePath = path.join(driversDir, file);
  if (fs.existsSync(filePath)) {
    updateDriverFile(filePath);
  } else {
    console.log(`⚠️  文件不存在: ${file}`);
  }
});

console.log('\n✅ 批量更新完成！');