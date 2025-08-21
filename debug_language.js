console.log("=== 语言设置调试 ===");
console.log("当前语言:", localStorage.getItem("i18nextLng"));
console.log("浏览器语言:", navigator.language);
console.log("HTML lang属性:", document.documentElement.lang);
console.log("i18n实例:", window.i18n || "未找到");
if (window.i18n) {
  console.log("i18n当前语言:", window.i18n.language);
  console.log("i18n资源:", Object.keys(window.i18n.store.data));
  console.log("测试翻译 kexts.title:", window.i18n.t("kexts.title"));
  console.log("测试翻译 kexts.search:", window.i18n.t("kexts.search"));
}
console.log("=== 尝试清除语言缓存并重新加载 ===");
localStorage.removeItem("i18nextLng");
console.log("已清除语言缓存，请刷新页面测试");
