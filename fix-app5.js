const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

const fixes = [
  ['登录登录', '创建时间'],
  ['账号中心账号中心账号中心登录', '登录后即可查看价格同步状态。'],
  ['账号中心账号中心登录登录登录 Cookie?', '请先配置 BUFF Cookie 以启用价格同步。'],
  ['登录 BUFF 登录登录', 'BUFF 价格同步'],
  ['登录 BUFF 登录', '同步状态'],
  ['登录登录</span><strong>${formatDateTime(status?.lastRunAt)</strong>', '上次执行</span><strong>${formatDateTime(status?.lastRunAt)}</strong>'],
  ['登录登录</span><strong>${formatDateTime(status?.nextRunAt)</strong>', '下次执行</span><strong>${formatDateTime(status?.nextRunAt)}</strong>'],
  ['登录登录</span><strong>${formatDateTime(status?.updatedAt)</strong>', '最近入库</span><strong>${formatDateTime(status?.updatedAt)}</strong>'],
  ['""未绑定"', '"未绑定"'],
];

fixes.forEach(function(f) {
  const count = (text.split(f[0]).length - 1);
  if (count > 0) {
    const escaped = f[0].replace(/[.*+?^${}()|[\]\\]/g, function(c) { return '\\' + c; });
    text = text.replace(new RegExp(escaped, 'g'), f[1]);
    console.log('Fixed (' + count + 'x): ' + f[0].substring(0, 50));
  }
});

fs.writeFileSync('C:/Users/35191/Documents/git1/app.js', text, 'utf8');
console.log('Done');