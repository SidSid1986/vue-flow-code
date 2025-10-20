// 基准大小
const baseSize = 51.2; // 与 postcss-pxtorem 的 rootValue 保持一致
// 设置 rem 函数
function setRem() {
  const scale = document.documentElement.clientWidth / 1024; // 750 是设计稿的宽度
  const fontSize = baseSize * Math.min(scale, 2);
  document.documentElement.style.fontSize = fontSize + "px";
  console.log(`Current scale: ${scale}, font size set to: ${fontSize}px`);
}
// 初始化
setRem();
// 改变窗口大小时重新设置 rem,这里最好加上节流
window.onresize = function () {
  setRem();
};
