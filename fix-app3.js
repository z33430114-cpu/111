const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

const fixes = [
  ['<span>登录登录</span><strong>? ${status?.intervalMinutes || 60} 登录</strong>', '<span>同步间隔</span><strong>${status?.intervalMinutes || 60} 分钟</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.lastRunAt)</strong>', '<span>上次执行</span><strong>${formatDateTime(status?.lastRunAt)}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.nextRunAt)</strong>', '<span>下次执行</span><strong>${formatDateTime(status?.nextRunAt)}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(status?.updatedAt)</strong>', '<span>最近入库</span><strong>${formatDateTime(status?.updatedAt)}</strong>'],
  ['<span>登录登录</span><strong>${status?.itemCount 登录 0}</strong>', '<span>价格条目</span><strong>${status?.itemCount || 0}</strong>'],
  ['账号中心${status.lastError}</p>', '最近错误：${status.lastError}</p>'],
  ['<div class="empty-state">BUFF Cookie 账号中心账号中心账号中心登录登录登录</div>', '<div class="empty-state">BUFF Cookie<br>请通过服务器配置接口设置。</div>'],
  ['>账号中心登录?</button>', '>立即执行价格同步</button>'],
  ['"账号中心账号中心账号中心登录登录"</small>', '"登录后即可手动触发价格同步。"</small>'],
  ['账号中心登录登录 Steam 账号中心登录登录 BUFF 登录登录登录?', '在这里管理登录状态、Steam 库存同步和 BUFF 价格同步状态。'],
  ['账号中心账号中心 <code>node scripts/serve.mjs</code>登录登录? <code>http://127.0.0.1:4173</code>?', '请通过本地服务器访问。请使用 <code>node scripts/serve.mjs</code> 启动本地服务，并使用 <code>http://127.0.0.1:4173</code> 打开页面。'],
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