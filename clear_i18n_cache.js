// 清除 i18n 缓存并重新加载页面的脚本
// 请在浏览器控制台中运行此脚本

(function() {
  console.log('=== 清除 i18n 缓存 ===');
  
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.error('此脚本必须在浏览器控制台中运行，不能在 Node.js 环境中运行');
    console.log('请复制以下代码到浏览器控制台中执行：');
    console.log('localStorage.clear(); sessionStorage.clear(); location.reload();');
    return;
  }
  
  // 清除所有 i18n 相关的 localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('i18n') || key.includes('language') || key.includes('lng')) {
      console.log('删除缓存键:', key, '值:', localStorage.getItem(key));
      localStorage.removeItem(key);
    }
  });
  
  // 清除会话存储
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('i18n') || key.includes('language') || key.includes('lng')) {
      console.log('删除会话存储键:', key);
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('缓存已清除，3秒后重新加载页面...');
  
  // 3秒后重新加载页面
  setTimeout(() => {
    window.location.reload();
  }, 3000);
})();

// 如果在 Node.js 环境中运行，显示提示信息
if (typeof window === 'undefined') {
  console.log('\n=== 浏览器控制台执行指令 ===');
  console.log('请在浏览器中打开开发者工具，在控制台中执行以下代码：');
  console.log('localStorage.clear(); sessionStorage.clear(); location.reload();');
  console.log('\n或者复制整个脚本内容到浏览器控制台执行。');
}