const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

const fixes = [
  ['<span>登录登录</span><strong>${formatDateTime(user.createdAt)</strong>', '<span>创建时间</span><strong>${formatDateTime(user.createdAt)}</strong>'],
  ['登录?"}</strong>', '"未绑定"}</strong>'],
  ['<span>登录登录</span><strong>${formatDateTime(user.lastInventorySyncAt)</strong>', '<span>库存同步</span><strong>${formatDateTime(user.lastInventorySyncAt)}</strong>'],
  ['<span>登录登录</span><strong>${user.lastInventoryCount', '<span>同步数量</span><strong>${user.lastInventoryCount'],
  ['>保存 Steam 绑定</button>', '>同步 Steam 库存</button>'],
  ['登录登录账号</button>', '退出登录</button>'],
];

fixes.forEach(function(f) {
  const count = (text.split(f[0]).length - 1);
  if (count > 0) {
    const escaped = f[0].replace(/[.*+?^${}()|[\]\\]/g, function(c) { return '\\' + c; });
    text = text.replace(new RegExp(escaped, 'g'), f[1]);
    console.log('Fixed: ' + f[0].substring(0, 50));
  }
});

fs.writeFileSync('C:/Users/35191/Documents/git1/app.js', text, 'utf8');
console.log('Done');