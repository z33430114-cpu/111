const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

const fixes = [
  ['<span>登录登录</span><strong>${status?.running ? "登录?" : "登录"}</strong>', '<span>状态</span><strong>${status?.running ? "运行中" : "空闲"}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.lastRunAt)</strong>', '<span>上次执行</span><strong>${formatDateTime(status?.lastRunAt)}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.nextRunAt)</strong>', '<span>下次执行</span><strong>${formatDateTime(status?.nextRunAt)}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.updatedAt)</strong>', '<span>最近入库</span><strong>${formatDateTime(status?.updatedAt)}</strong>'],
];

fixes.forEach(function(f) {
  const count = (text.split(f[0]).length - 1);
  if (count > 0) {
    const escaped = f[0].replace(/[.*+?^${}()|[\]\\]/g, function(c) { return '\\' + c; });
    text = text.replace(new RegExp(escaped, 'g'), f[1]);
    console.log('Fixed: ' + f[0].substring(0, 60));
  }
});

fs.writeFileSync('C:/Users/35191/Documents/git1/app.js', text, 'utf8');
console.log('Done');