// 强制重新加载i18n翻译资源的调试脚本
console.log('=== 强制重新加载i18n翻译资源 ===');

if (typeof window !== 'undefined' && window.i18n) {
  console.log('当前i18n实例状态:');
  console.log('- 当前语言:', window.i18n.language);
  console.log('- 可用语言:', Object.keys(window.i18n.store.data));
  
  // 检查具体的翻译键
  console.log('\n=== 检查问题翻译键 ===');
  console.log('kexts.search 存在:', window.i18n.exists('kexts.search'));
  console.log('kexts.development_status.active 存在:', window.i18n.exists('kexts.development_status.active'));
  
  // 尝试获取翻译
  console.log('\n=== 尝试翻译 ===');
  console.log('kexts.search:', window.i18n.t('kexts.search'));
  console.log('kexts.development_status.active:', window.i18n.t('kexts.development_status.active'));
  
  // 检查英文资源
  console.log('\n=== 检查英文资源 ===');
  const enResources = window.i18n.store.data.en;
  if (enResources && enResources.translation) {
    console.log('英文翻译资源存在');
    console.log('kexts 部分:', enResources.translation.kexts ? '存在' : '不存在');
    if (enResources.translation.kexts) {
      console.log('kexts.search:', enResources.translation.kexts.search);
      console.log('kexts.development_status:', enResources.translation.kexts.development_status);
    }
  } else {
    console.log('英文翻译资源不存在或结构异常');
  }
  
  // 强制重新加载当前语言
  console.log('\n=== 强制重新加载当前语言 ===');
  const currentLang = window.i18n.language;
  window.i18n.reloadResources().then(() => {
    console.log('资源重新加载完成');
    console.log('重新加载后 kexts.search:', window.i18n.t('kexts.search'));
    console.log('重新加载后 kexts.development_status.active:', window.i18n.t('kexts.development_status.active'));
  }).catch(err => {
    console.error('重新加载资源失败:', err);
  });
  
} else {
  console.log('❌ i18n实例不存在');
}

// 清除localStorage中的语言缓存
console.log('\n=== 清除语言缓存 ===');
localStorage.removeItem('i18nextLng');
console.log('已清除localStorage中的i18nextLng');

console.log('\n请刷新页面以查看效果');