const fs = require('fs');
let text = fs.readFileSync('C:/Users/35191/Documents/git1/app.js', 'utf8');

// Replace the entire accountMainMarkup function
const startIdx = text.indexOf('function accountMainMarkup()');
const endIdx = text.indexOf('function renderAccount()');
if (startIdx >= 0 && endIdx > startIdx) {
  const correctFunc = `function accountMainMarkup() {
  if (!authState.session?.authenticated) {
    return \`
      <section class="account-panel">
        <p class="eyebrow">Account</p>
        <h2>登录或注册</h2>
        <div class="auth-grid account-auth-grid">
          <form class="auth-form" id="accountLoginForm">
            <h3>登录</h3>
            <label>用户名<input name="username" required minlength="3" maxlength="24" /></label>
            <label>密码<input name="password" type="password" required minlength="6" /></label>
            <button class="primary-action" type="submit">登录账号</button>
          </form>
          <form class="auth-form" id="accountRegisterForm">
            <h3>注册</h3>
            <label>用户名<input name="username" required minlength="3" maxlength="24" /></label>
            <label>密码<input name="password" type="password" required minlength="6" /></label>
            <button class="secondary-action" type="submit">创建账号</button>
          </form>
        </div>
      </section>
    \`;
  }

  const user = authState.session.user;
  return \`
    <section class="account-panel">
      <p class="eyebrow">Profile</p>
      <h2>\${user.username}</h2>
      <div class="account-meta">
        <div><span>创建时间</span><strong>\${formatDateTime(user.createdAt)}</strong></div>
        <div><span>Steam ID</span><strong>\${user.steamId || "未绑定"}</strong></div>
        <div><span>库存同步</span><strong>\${formatDateTime(user.lastInventorySyncAt)}</strong></div>
        <div><span>同步数量</span><strong>\${user.lastInventoryCount || 0}</strong></div>
      </div>
      <form class="steam-bind" id="accountSteamBindForm">
        <label>
          Steam ID / 64 位账号
          <input name="steamId" placeholder="7656119..." value="\${user.steamId || ""}" />
        </label>
        <button class="primary-action" type="submit">保存 Steam 绑定</button>
      </form>
      <div class="account-actions">
        <button class="secondary-action" id="syncSteamButton" type="button"\${user.steamId ? "" : " disabled"}>同步 Steam 库存</button>
        <button class="secondary-action" id="accountLogoutButton" type="button">退出登录</button>
      </div>
    </section>
    <section class="account-panel">
      <p class="eyebrow">Steam Inventory</p>
      <h2>库存预览</h2>
      <div id="steamInventoryRoot"></div>
    </section>
  \`;
}

`;
  text = text.substring(0, startIdx) + correctFunc + text.substring(endIdx);
  console.log('Replaced accountMainMarkup');
}

// Replace syncPanelMarkup
const syncStart = text.indexOf('function syncPanelMarkup()');
const syncEnd = text.indexOf('function accountMainMarkup()');
if (syncStart >= 0 && syncEnd > syncStart) {
  const correctSync = `function syncPanelMarkup() {
  const status = syncStatusState.value;
  const buffConfigured = !!buffConfigState.value?.cookie;
  const helperText = "当前版本优先使用可访问的公开市场价格，不再展示本地估算值。";

  return \`
    <section class="account-panel">
      <p class="eyebrow">Price Sync</p>
      <h2>价格同步状态</h2>
      <div class="account-meta sync-meta">
        <div><span>当前来源</span><strong>公开市场</strong></div>
        <div><span>同步周期</span><strong>每 \${status?.intervalMinutes || 60} 分钟</strong></div>
        <div><span>同步任务</span><strong>\${status?.running ? "运行中" : "空闲"}</strong></div>
        <div><span>上次执行</span><strong>\${formatDateTime(status?.lastRunAt)}</strong></div>
        <div><span>下次执行</span><strong>\${formatDateTime(status?.nextRunAt)}</strong></div>
        <div><span>最近入库</span><strong>\${formatDateTime(status?.updatedAt)}</strong></div>
        <div><span>价格条目</span><strong>\${status?.itemCount ?? 0}</strong></div>
      </div>
      \${status?.lastError ? \`<p class="account-error">最近错误：\${status.lastError}</p>\` : ""}
      <div class="empty-state">账号中心现在只展示真实同步状态，不再要求前端填写 Cookie。</div>
      <div class="account-actions">
        <button class="primary-action" id="runSyncButton" type="button"\${authState.session?.authenticated ? "" : " disabled"}>立即执行价格同步</button>
        <small>\${authState.session?.authenticated ? helperText : "登录后即可手动触发价格同步。"}</small>
      </div>
    </section>
  \`;
}

`;
  text = text.substring(0, syncStart) + correctSync + text.substring(syncEnd);
  console.log('Replaced syncPanelMarkup');
}

fs.writeFileSync('C:/Users/35191/Documents/git1/app.js', text, 'utf8');
console.log('Done');