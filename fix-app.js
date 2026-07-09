const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

const fixes = [
  ['登录?<input name="username"', '用户名<input name="username"'],
  ['登录<input name="password"', '密码<input name="password"'],
  ['登录登录</button>', '登录账号</button>'],
  ['登录登录?</button>', '注册并登录</button>'],
  ['Steam 登录</span>', 'Steam ID</span>'],
  ['64 登录?', '64 位账号'],
  ['登录 Steam 登录</button>', '保存 Steam 绑定</button>'],
  ['登录登录登录</button>', '退出登录</button>'],
  ['登录登录?</h2>', '库存预览</h2>'],
  ['<h2>账号中心</h2>', '<h2>登录或注册</h2>'],
];

fixes.forEach(function(f) {
  const count = (text.split(f[0]).length - 1);
  if (count > 0) {
    const escaped = f[0].replace(/[.*+?^${}()|[\]\\]/g, function(c) { return '\\' + c; });
    text = text.replace(new RegExp(escaped, 'g'), f[1]);
    console.log('Fixed: ' + f[0]);
  }
});

fs.writeFileSync('C:/Users/35191/Documents/git1/app.js', text, 'utf8');
console.log('Done');