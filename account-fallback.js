(() => {
  const LOCAL_API_CANDIDATES = detectLocalApiOrigins();
  const LOCAL_API_ORIGIN = LOCAL_API_CANDIDATES[0] || "http://127.0.0.1:4173";
  const AUTH_SESSION_TOKEN_KEY = "cs2-relic-hall:session-token";
  const AUTH_SESSION_COOKIE_KEY = "cs2_relic_hall_session_token";

  function localPageUrl(path = "") {
    const normalized = String(path || "").replace(/^\/+/, "");
    return `${LOCAL_API_ORIGIN}/${normalized}`;
  }

  function detectLocalApiOrigins() {
    const configuredOrigin = typeof globalThis.CS2_LOCAL_API_ORIGIN === "string" ? globalThis.CS2_LOCAL_API_ORIGIN.trim() : "";
    const storedOrigin = (() => {
      try {
        return String(localStorage.getItem("cs2-relic-hall:local-api-origin") || "").trim();
      } catch (_error) {
        return "";
      }
    })();
    const currentOrigin = /^https?:$/.test(location.protocol || "") && /^(127\.0\.0\.1|localhost)$/i.test(location.hostname || "")
      ? location.origin
      : "";
    return [...new Set([
      configuredOrigin,
      storedOrigin,
      currentOrigin,
      "http://127.0.0.1:4173",
      "http://localhost:4173",
      "http://127.0.0.1:4174",
      "http://localhost:4174"
    ].filter(Boolean))];
  }

  function apiCandidates(path) {
    if (!String(path || "").startsWith("/api/")) return [path];
    const candidates = location.protocol === "file:" ? [] : [path];
    for (const origin of LOCAL_API_CANDIDATES) candidates.push(`${origin}${path}`);
    return [...new Set(candidates.filter(Boolean))];
  }

  function shouldRetry(error) {
    if (!error) return false;
    if (error.status === 404 || error.status === 0) return true;
    return /fetch|network|failed|load failed/i.test(String(error.message || ""));
  }

  function localServiceHelpText() {
    return "本地服务连接失败。请先运行 node scripts/serve.mjs，并通过 http://127.0.0.1:4173 打开页面。";
  }

  function normalizeApiError(error) {
    if (!error) return new Error(localServiceHelpText());
    if (error.status) return error;
    if (/fetch|network|failed|load failed/i.test(String(error.message || ""))) {
      const nextError = new Error(localServiceHelpText());
      nextError.code = error.code || "network_error";
      nextError.cause = error;
      return nextError;
    }
    return error;
  }

  const text = {
    requestFailed: "\u8bf7\u6c42\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
    loggingIn: "\u767b\u5f55\u4e2d...",
    registering: "\u521b\u5efa\u4e2d...",
    loginOk: "\u767b\u5f55\u6210\u529f\u3002\u6b63\u5728\u5237\u65b0\u8d26\u53f7\u72b6\u6001...",
    registerOk: "\u8d26\u53f7\u5df2\u521b\u5efa\u5e76\u767b\u5f55\u3002",
    missingUser: "\u8be5\u8d26\u53f7\u4e0d\u5b58\u5728\uff0c\u8bf7\u5148\u6ce8\u518c\u3002",
    badPassword: "\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u786e\u8ba4\u540e\u518d\u767b\u5f55\u3002",
    saving: "\u4fdd\u5b58\u4e2d...",
    steamSaved: "Steam \u7ed1\u5b9a\u5df2\u4fdd\u5b58\u3002\u6b63\u5728\u5237\u65b0\u8d26\u53f7\u72b6\u6001...",
    needLogin: "\u8bf7\u5148\u91cd\u65b0\u767b\u5f55\u8d26\u53f7\uff0c\u518d\u4fdd\u5b58 Steam \u7ed1\u5b9a\u3002",
    badSteam: "\u8bf7\u8f93\u5165\u6709\u6548\u7684 SteamID64\uff0c\u6216\u5305\u542b SteamID64 \u7684 Steam \u4e3b\u9875\u94fe\u63a5\u3002",
    steamFailed: "Steam \u7ed1\u5b9a\u4fdd\u5b58\u5931\u8d25\u3002"
  };

  function message(value, isError = false) {
    const root = document.getElementById("accountRoot");
    if (!root) return;
    let node = document.getElementById("accountFallbackMessage") || document.getElementById("accountNativeLoginMessage");
    if (!node) {
      node = document.createElement("p");
      node.id = "accountFallbackMessage";
      node.className = "auth-feedback";
      root.prepend(node);
    }
    node.className = `auth-feedback${isError ? " is-error" : ""}`;
    node.textContent = value;
  }

  function sessionTokenFromCookie() {
    const entry = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${AUTH_SESSION_COOKIE_KEY}=`));
    return entry ? decodeURIComponent(entry.slice(AUTH_SESSION_COOKIE_KEY.length + 1)) : "";
  }

  function saveSessionToken(token) {
    if (!token) return;
    localStorage.setItem(AUTH_SESSION_TOKEN_KEY, token);
    document.cookie = `${AUTH_SESSION_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=1209600`;
  }

  async function request(path, body) {
    const sessionToken = localStorage.getItem(AUTH_SESSION_TOKEN_KEY) || sessionTokenFromCookie();
    if (sessionToken && !localStorage.getItem(AUTH_SESSION_TOKEN_KEY)) localStorage.setItem(AUTH_SESSION_TOKEN_KEY, sessionToken);
    let lastError = null;
    for (const targetUrl of apiCandidates(path)) {
      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
          },
          body: JSON.stringify(body || {})
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(payload.error || payload.message || text.requestFailed);
          error.status = response.status;
          error.code = payload.code || "";
          throw error;
        }
        return payload;
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        lastError = normalizedError;
        if (!shouldRetry(error)) throw normalizedError;
      }
    }
    throw lastError || new Error(text.requestFailed);
  }

  function formBody(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  async function handleAuth(form, endpoint) {
    const button = form.querySelector('button[type="submit"]');
    const original = button?.textContent || "";
    const isLogin = endpoint.includes("login");
    if (button) {
      button.textContent = isLogin ? text.loggingIn : text.registering;
      button.setAttribute("disabled", "disabled");
    }
    try {
      const result = await request(endpoint, formBody(form));
      saveSessionToken(result.sessionToken);
      message(isLogin ? text.loginOk : text.registerOk);
      const target = location.protocol === "file:" ? localPageUrl("account.html?login=1") : "account.html?login=1";
      window.setTimeout(() => location.assign(target), 80);
    } catch (error) {
      if (button) {
        button.textContent = original;
        button.removeAttribute("disabled");
      }
      const value = isLogin && (error.code === "account_not_found" || error.status === 404)
        ? text.missingUser
        : isLogin && (error.code === "bad_password" || error.status === 401)
          ? text.badPassword
          : (error.message || text.requestFailed);
      message(value, true);
      window.alert?.(value);
    }
  }

  async function handleSteamBind(form) {
    const button = form.querySelector('button[type="submit"]');
    const original = button?.textContent || "";
    const body = formBody(form);
    const match = String(body.steamId || "").match(/7656119\d{10}/);
    if (match) body.steamId = match[0];
    if (button) {
      button.textContent = text.saving;
      button.setAttribute("disabled", "disabled");
    }
    try {
      await request("/api/auth/steam/bind", body);
      message(text.steamSaved);
      const target = location.protocol === "file:" ? localPageUrl("account.html?steam=1") : "account.html?steam=1";
      window.setTimeout(() => location.assign(target), 80);
    } catch (error) {
      if (button) {
        button.textContent = original;
        button.removeAttribute("disabled");
      }
      const value = error.status === 401 ? text.needLogin : error.status === 400 ? text.badSteam : (error.message || text.steamFailed);
      message(value, true);
      window.alert?.(value);
    }
  }

  function handleForm(form) {
    if (form.id === "accountNativeLoginForm") return handleAuth(form, "/api/auth/login");
    if (form.id === "accountSteamBindForm") return handleSteamBind(form);
    return null;
  }

  document.addEventListener("submit", (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!(form instanceof HTMLFormElement)) return;
    if (!["accountNativeLoginForm", "accountSteamBindForm"].includes(form.id)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('button[type="submit"]') : null;
    const form = button?.closest("form");
    if (!(form instanceof HTMLFormElement)) return;
    if (!["accountNativeLoginForm", "accountSteamBindForm"].includes(form.id)) return;
    if (!form.reportValidity()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    handleForm(form);
  }, true);
})();
