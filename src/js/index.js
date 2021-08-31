// 引入样式资源
import '../css/index.css';
import '../css/a.css';
import '../css/b.css';
import print from './print';
/* eslint import/no-extraneous-dependencies: ["error", {"peerDependencies": true}] */
import '@babel/polyfill';

const add = (x, y) => x + y;

// 下一行不进行eslint检查;
// eslint - disable - next - line;
console.log(add(3, 5));

const promise = new Promise((resolve) => {
  setTimeout(() => {
    // eslint-disable-next-line
    console.log('计时器执行完了 ssxxx');
    resolve();
  }, 1000);
});
print();
// eslint - disable - next - line;
console.log(promise);

function sum(...args) {
  return args.reduce((p, c) => p + c, 0);
}

console.log(sum(1, 2, 3, 4, 5, 6));

/**
 * 1、eslint不认识window、navigator全局变量
 * 解决：需要修改package。json中 "env":{ "browser" : true}支持浏览器的全局变量
 * serviceworker必须运行到服务器上
 *  1、nodejs
 *  2、npm i serve -g
 *     serve -s build 启动服务器，将build目录下的所有资源作为静态资源暴漏出去
 *
 */

/**
 * 注册serviceworker
 * 处理兼容问题
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        console.log('sw 注册成功！');
      })
      .catch(() => {
        console.log('sw 注册失败！');
      });
  });
}

if (module.hot) {
  module.hot.accept();
}
