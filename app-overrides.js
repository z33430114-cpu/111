(() => {
  const PRICE_BATCH_SIZE = 24;
  const PRICE_VIEWPORT_MARGIN = 280;
  const STICKER_LIMIT = 18;
  const LOCAL_API_ORIGIN = "http://127.0.0.1:4173";
  const state = {
    bound: false,
    diyOpen: false,
    activeStickerId: "",
    stickers: [],
    placedStickers: [],
    hydratedPriceIds: new Set(),
    priceHydrationScheduled: false,
    priceHydrationRunning: false
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const text = (en, zh) => globalThis.uiText?.(en, zh) || en;
  const MOJIBAKE_TEXT_REPLACEMENTS = new Map();
  let mojibakeCleanupObserver = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return text("No price", "\u6682\u65e0\u62a5\u4ef7");
    return (globalThis.getCurrentLanguage?.() || "zh-CN") === "zh-CN"
      ? `\u00a5${number.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`
      : `CNY ${number.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }

  function normalizeVisibleMojibake(scope = document.body) {
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      let value = node.nodeValue || "";
      let nextValue = value;
      for (const [broken, clean] of MOJIBAKE_TEXT_REPLACEMENTS) {
        if (nextValue.includes(broken)) nextValue = nextValue.split(broken).join(clean);
      }
      if (nextValue !== value) node.nodeValue = nextValue;
      node = walker.nextNode();
    }
  }

  function ensureMojibakeCleanupObserver() {
    if (mojibakeCleanupObserver || !document.body || typeof MutationObserver !== "function") return;
    mojibakeCleanupObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target?.parentNode) {
          normalizeVisibleMojibake(mutation.target.parentNode);
          continue;
        }
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) normalizeVisibleMojibake(node);
          if (node?.nodeType === Node.TEXT_NODE && node.parentNode) normalizeVisibleMojibake(node.parentNode);
        });
      }
    });
    mojibakeCleanupObserver.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function priceFromRecord(record) {
    const values = Object.values(record?.prices || {})
      .map((entry) => Number(entry?.price))
      .filter((price) => Number.isFinite(price) && price > 0);
    return values.length ? Math.min(...values) : null;
  }

  function itemIdFromHref(value) {
    try {
      const url = new URL(String(value || ""), location.href);
      return url.searchParams.get("id") || "";
    } catch {
      return "";
    }
  }

  function currentItem() {
    const id = new URLSearchParams(location.search).get("id") || "";
    return id && typeof globalThis.resolveDisplayItemById === "function"
      ? globalThis.resolveDisplayItemById(id)
      : null;
  }

  function itemFromLink(link) {
    const itemId = itemIdFromHref(link);
    if (!itemId) return null;
    if (typeof globalThis.resolveDisplayItemById === "function") return globalThis.resolveDisplayItemById(itemId);
    return (globalThis.items || []).find((item) => item.id === itemId) || null;
  }

  function wearEnabled(item) {
    return Array.isArray(item?.wears) && item.wears.length > 0;
  }

  function stickerDiyEnabled(item) {
    if (typeof globalThis.supportsStickerDiy === "function") return globalThis.supportsStickerDiy(item);
    return ["pistol", "rifle", "smg", "shotgun", "machinegun"].includes(item?.type || "");
  }

  function collectVisiblePriceIds() {
    const ids = new Set();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    $$("a.item-card[href], a.item-card-link[href], .favorite-card a[href]").forEach((link) => {
      const rect = link.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (rect.bottom < -PRICE_VIEWPORT_MARGIN || rect.top > viewportHeight + PRICE_VIEWPORT_MARGIN) return;
      const item = itemFromLink(link.getAttribute("href") || "");
      if (item?.id && !state.hydratedPriceIds.has(item.id)) ids.add(item.id);
    });
    const detailItem = currentItem();
    if (detailItem?.id && !state.hydratedPriceIds.has(detailItem.id)) ids.add(detailItem.id);
    return [...ids];
  }

  function applyPriceToDom(itemId, price) {
    const textValue = formatPrice(price);
    $$(".item-card, .favorite-card").forEach((card) => {
      const link = card.tagName === "A" ? card : card.querySelector("a[href]");
      if (!link || itemFromLink(link.getAttribute("href") || "")?.id !== itemId) return;
      const priceNode = card.querySelector(".card-price, .favorite-copy > span");
      if (priceNode) priceNode.textContent = textValue;
    });
    const detail = currentItem();
    if (detail && detail.id === itemId) {
      const panelPrice = $(".price-panel strong");
      if (panelPrice) panelPrice.textContent = textValue;
    }
  }

  function applyEmbeddedSnapshot() {
    const snapshot = globalThis.CS2_MARKET_PRICES?.items || {};
    for (const [itemId, record] of Object.entries(snapshot)) {
      const item = (globalThis.items || []).find((entry) => entry.id === itemId);
      if (!item) continue;
      const existingRecord = globalThis.effectiveCatalogPriceRecord?.(item);
      if (existingRecord?.hasSyncedPlatformPrice) continue;
      const price = priceFromRecord(record);
      if (!price) continue;
      item.price = price;
      applyPriceToDom(itemId, price);
    }
  }

  async function hydrateVisiblePrices() {
    if (state.priceHydrationRunning) return;
    const ids = collectVisiblePriceIds();
    if (!ids.length) return;
    state.priceHydrationRunning = true;
    for (let index = 0; index < ids.length; index += PRICE_BATCH_SIZE) {
      const chunk = ids.slice(index, index + PRICE_BATCH_SIZE);
      try {
        const response = await fetch(
          location.protocol === "file:" ? `${LOCAL_API_ORIGIN}/api/prices/batch` : "/api/prices/batch",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: chunk })
          }
        );
        if (!response.ok) continue;
        const payload = await response.json();
        chunk.forEach((itemId) => state.hydratedPriceIds.add(itemId));
        if (typeof globalThis.applyBatchPricePayload === "function") {
          globalThis.applyBatchPricePayload(payload);
        }
        for (const [itemId, record] of Object.entries(payload.items || {})) {
          const item = (globalThis.items || []).find((entry) => entry.id === itemId);
          if (!item) continue;
          const existingRecord = globalThis.effectiveCatalogPriceRecord?.(item);
          if (existingRecord?.hasSyncedPlatformPrice) continue;
          const price = priceFromRecord(record);
          if (!price) continue;
          item.price = price;
          applyPriceToDom(itemId, price);
        }
      } catch {
        chunk.forEach((itemId) => state.hydratedPriceIds.add(itemId));
        applyEmbeddedSnapshot();
        state.priceHydrationRunning = false;
        return;
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }
    state.priceHydrationRunning = false;
  }

  function scheduleVisiblePriceHydration() {
    if (state.priceHydrationScheduled) return;
    state.priceHydrationScheduled = true;
    const run = () => {
      state.priceHydrationScheduled = false;
      void hydrateVisiblePrices();
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 180 });
      return;
    }
    requestAnimationFrame(run);
  }

  function stickerLabel(item) {
    return String(item?.translations?.[globalThis.getCurrentLanguage?.() || "zh-CN"]?.name || item?.nameZh || item?.nameEn || item?.displayName || item?.name || "").trim() || text("Sticker", "贴纸");
  }

  function stickerDataset() {
    const catalogStickers = (globalThis.items || []).filter((item) => item.type === "sticker" && item.image);
    if (catalogStickers.length) return catalogStickers;
    return (globalThis.CS2_STICKERS || []).filter((item) => item?.image);
  }

  function stickerPool() {
    const query = String($("#stickerSearchInput")?.value || "").trim().toLowerCase();
    const stickers = stickerDataset()
      .filter((item) => !query || [stickerLabel(item), item.collectionZh, item.collectionEn].some((value) => String(value || "").toLowerCase().includes(query)))
      .slice(0, STICKER_LIMIT);
    state.stickers = stickers;
    if (!state.activeStickerId && stickers[0]) state.activeStickerId = stickers[0].id;
    return stickers;
  }

  function activeSticker() {
    return stickerDataset().find((item) => item.id === state.activeStickerId) || state.stickers[0] || null;
  }

  function ensureStickerOverlay() {
    const card = $("#inspectDepthCard");
    if (!card) return null;
    let overlay = $("#freeStickerOverlay", card);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "freeStickerOverlay";
      overlay.className = "free-sticker-overlay";
      card.appendChild(overlay);
    }
    return overlay;
  }

  function renderPlacedStickers() {
    const overlay = ensureStickerOverlay();
    if (!overlay) return;
    overlay.innerHTML = state.placedStickers.map((entry, index) => `
      <img class="free-sticker" data-placed-sticker="${index}" src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.name)}"
        style="left:${entry.x}%;top:${entry.y}%;width:${entry.size}%;transform:translate(-50%, -50%) rotate(${entry.rotate}deg);" />
    `).join("");
    const scene = $("#inspectScene");
    if (scene) scene.classList.toggle("diy-finished", state.placedStickers.length > 0);
  }

  function renderStickerChoices() {
    const grid = $("#diyStickerGrid");
    if (!grid || !state.diyOpen) return;
    const stickers = stickerPool();
    grid.innerHTML = stickers.length
      ? stickers.map((item) => `
          <button class="sticker-chip${item.id === state.activeStickerId ? " is-active" : ""}" type="button" data-diy-sticker="${escapeHtml(item.id)}">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(stickerLabel(item))}" loading="lazy" />
            <span>${escapeHtml(stickerLabel(item))}</span>
          </button>
        `).join("")
      : `<div class="empty-state">${escapeHtml(text("No stickers found.", "没有找到可用贴纸。"))}</div>`;
    const status = $("#activeStickerStatus");
    const sticker = activeSticker();
    if (status) {
      status.innerHTML = sticker
        ? `${text("Current sticker:", "当前贴纸：")} <strong>${escapeHtml(stickerLabel(sticker))}</strong>`
        : text("Choose a sticker, then click the preview to place it.", "选择贴纸后，点击预览图即可放置。");
    }
  }

  function addStickerAt(event) {
    const overlay = ensureStickerOverlay();
    const sticker = activeSticker();
    if (!overlay || !sticker) return;
    const rect = overlay.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    state.placedStickers.push({
      image: sticker.image,
      name: stickerLabel(sticker),
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(8, Math.min(92, y)),
      size: 13,
      rotate: Math.round((Math.random() * 20) - 10)
    });
    renderPlacedStickers();
  }

  function syncDetailUi() {
    const toggleButton = $("#toggleDiyButton");
    if (toggleButton) {
      toggleButton.textContent = state.diyOpen ? text("Close Sticker DIY", "关闭贴纸 DIY") : text("Sticker DIY", "贴纸 DIY");
    }
  }

  function syncDiyLayoutState() {
    const viewerPanel = document.querySelector(".viewer-panel");
    if (!viewerPanel) return;
    const active = Boolean(state.diyOpen && $("#stickerDiyPanel"));
    if (active) viewerPanel.classList.add("is-diy-open");
    else viewerPanel.classList.remove("is-diy-open");
  }

  function syncWearVisibility() {
    $$("a.item-card-link[href]").forEach((link) => {
      const item = itemFromLink(link.getAttribute("href") || "");
      if (!item || wearEnabled(item)) return;
      const card = link.closest(".item-card");
      $(".card-footer span:last-child", card)?.remove();
    });

    const item = currentItem();
    if (!item) return;

    if (!wearEnabled(item)) {
      $(".wear-choice-field")?.remove();
      $$(".spec-list dt").forEach((node) => {
        const value = String(node.textContent || "").trim().toLowerCase();
        if (value.includes("wear") || value.includes("磨损")) {
          node.parentElement?.remove();
        }
      });
    }

    if (!stickerDiyEnabled(item)) {
      state.diyOpen = false;
      $("#toggleDiyButton")?.remove();
      $("#stickerDiyPanel")?.remove();
      $("#freeStickerOverlay")?.remove();
      $("#inspectScene")?.classList.remove("sticker-flat-view", "diy-finished");
      document.querySelector(".viewer-panel")?.classList.remove("is-diy-open");
    }
  }

  function buildStickerDiyPanel() {
    const controls = $(".inspect-controls");
    const scene = $("#inspectScene");
    const item = currentItem();
    if (!controls || !scene || !item || !stickerDiyEnabled(item) || !state.diyOpen) return;
    scene.classList.add("sticker-flat-view");
    ensureStickerOverlay();
    if (!$("#stickerDiyPanel")) {
      controls.insertAdjacentHTML("beforeend", `
        <section class="sticker-diy-panel" id="stickerDiyPanel" aria-label="${escapeHtml(text("Sticker DIY", "贴纸 DIY"))}">
          <div class="diy-panel-head">
            <strong>${escapeHtml(text("Sticker DIY", "贴纸 DIY"))}</strong>
            <div class="diy-toolbar">
              <button class="secondary-action compact-action" id="randomDiySticker" type="button">${escapeHtml(text("Random Sticker", "随机贴纸"))}</button>
              <button class="secondary-action compact-action" id="clearDiyStickers" type="button">${escapeHtml(text("Clear Stickers", "清空贴纸"))}</button>
            </div>
          </div>
          <div class="diy-save-row">
            <button class="primary-action compact-action" id="confirmDiyCollection" type="button">${escapeHtml(text("Save to Favorites", "保存到收藏夹"))}</button>
            <small class="diy-save-hint">${escapeHtml(text("This saves the current base image and sticker placement to Favorites.", "会把当前底图和贴纸位置保存到收藏夹。"))}</small>
          </div>
          <input class="sticker-search-input" id="stickerSearchInput" type="search" placeholder="${escapeHtml(text("Search stickers", "搜索贴纸"))}" />
          <div class="active-sticker-status" id="activeStickerStatus">${escapeHtml(text("Choose a sticker, then click the preview to place it.", "选择贴纸后，点击预览图即可放置。"))}</div>
          <div class="sticker-results diy-sticker-grid" id="diyStickerGrid"></div>
        </section>
      `);
    }
    renderStickerChoices();
    renderPlacedStickers();
    syncDetailUi();
    syncDiyLayoutState();
  }

  function rebuildStickerViewer() {
    requestAnimationFrame(() => {
      try {
        const item = currentItem();
        if (!stickerDiyEnabled(item)) {
          state.diyOpen = false;
          $("#stickerDiyPanel")?.remove();
          $("#freeStickerOverlay")?.remove();
          $("#inspectScene")?.classList.remove("sticker-flat-view", "diy-finished");
          document.querySelector(".viewer-panel")?.classList.remove("is-diy-open");
          scheduleVisiblePriceHydration();
          syncDetailUi();
          return;
        }
        buildStickerDiyPanel();
        scheduleVisiblePriceHydration();
        syncWearVisibility();
        syncDetailUi();
      } catch {
        const controls = $(".inspect-controls");
        if (controls && !$("#stickerDiyPanel")) {
          controls.insertAdjacentHTML("beforeend", `<div class="empty-state">${escapeHtml(text("Sticker DIY is temporarily unavailable. Please refresh and try again.", "贴纸 DIY 暂时不可用，请刷新后重试。"))}</div>`);
        }
      }
    });
  }

  function bindEvents() {
    if (state.bound) return;
    state.bound = true;
    document.addEventListener("input", (event) => {
      if (event.target?.id === "stickerSearchInput") renderStickerChoices();
    });
    document.addEventListener("change", () => requestAnimationFrame(syncDetailUi));
    window.addEventListener("scroll", scheduleVisiblePriceHydration, { passive: true });
    window.addEventListener("resize", scheduleVisiblePriceHydration, { passive: true });
    document.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;
      requestAnimationFrame(syncDetailUi);
      const stickerButton = target.closest("[data-diy-sticker]");
      if (stickerButton instanceof HTMLElement) {
        state.activeStickerId = stickerButton.dataset.diySticker || "";
        renderStickerChoices();
        return;
      }
      if (target.id === "toggleDiyButton") {
        state.diyOpen = !state.diyOpen;
        target.setAttribute("aria-pressed", String(state.diyOpen));
        target.textContent = state.diyOpen ? text("Close Sticker DIY", "关闭贴纸 DIY") : text("Sticker DIY", "贴纸 DIY");
        if (!state.diyOpen) {
          state.placedStickers = [];
          $("#stickerDiyPanel")?.remove();
          $("#freeStickerOverlay")?.remove();
          document.querySelector(".viewer-panel")?.classList.remove("is-diy-open");
        }
        rebuildStickerViewer();
        return;
      }
      if (target.id === "clearDiyStickers") {
        state.placedStickers = [];
        renderPlacedStickers();
        return;
      }
      if (target.id === "confirmDiyCollection") {
        Promise.resolve(globalThis.saveCurrentDiyDesign ? globalThis.saveCurrentDiyDesign() : { ok: false, message: text("Saving is unavailable right now.", "当前无法保存。") }).then((result) => {
          const status = $("#activeStickerStatus");
          if (status) status.textContent = result.message;
          if (result.ok && typeof globalThis.refreshFavoriteSurfaces === "function") {
            globalThis.refreshFavoriteSurfaces();
          }
        });
        return;
      }
      if (target.id === "randomDiySticker") {
        const stickers = stickerPool();
        if (stickers.length) {
          state.activeStickerId = stickers[Math.floor(Math.random() * stickers.length)].id;
          renderStickerChoices();
        }
      }
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("#freeStickerOverlay")) addStickerAt(event);
    });
  }

  globalThis.__rebuildStickerViewer = rebuildStickerViewer;
  globalThis.hydrateVisiblePrices = hydrateVisiblePrices;

  function renderOpeningFallback() {
    if (!/openings\.html$/i.test(location.pathname)) return;
    const root = document.getElementById("openingsRoot");
    if (!root) return;
    const currentText = root.textContent || "";
    if (root.querySelector(".opening-card, .opening-simulator, .fallback-opening-simulator") || (root.innerHTML.trim() && !/Loading containers|正在加载箱子/.test(currentText))) return;
    const prefersZh = /zh/i.test(document.documentElement.lang || document.documentElement.dataset.uiLang || "");
    const cases = [
      {
        name: prefersZh ? "反恐精英武器箱" : "CS:GO Weapon Case",
        pool: prefersZh
          ? ["AK-47 | 表面淬火", "AWP | 雷击", "沙漠之鹰 | 蛊惑之色", "刺刀（★） | 渐变之色"]
          : ["AK-47 | Case Hardened", "AWP | Lightning Strike", "Desert Eagle | Hypnotic", "Bayonet | Fade"]
      },
      {
        name: prefersZh ? "“英勇大行动”武器箱" : "Operation Bravo Case",
        pool: prefersZh
          ? ["AK-47 | 火蛇", "P2000 | 海泡沫", "P90 | 翡翠巨龙", "蝴蝶刀（★） | 多普勒"]
          : ["AK-47 | Fire Serpent", "P2000 | Ocean Foam", "P90 | Emerald Dragon", "Butterfly Knife | Doppler"]
      },
      {
        name: prefersZh ? "光谱武器箱" : "Spectrum Case",
        pool: prefersZh
          ? ["AK-47 | 血腥运动", "USP 消音版 | 二西莫夫", "M4A1 消音版 | 破碎铅秋", "蝴蝶刀（★） | 渐变之色"]
          : ["AK-47 | Bloodsport", "USP-S | Neo-Noir", "M4A1-S | Decimator", "Butterfly Knife | Fade"]
      },
      {
        name: prefersZh ? "梦魇武器箱" : "Dreams & Nightmares Case",
        pool: prefersZh
          ? ["AK-47 | 夜愿", "MP9 | 星光守护者", "FAMAS | 梦魇速写", "稀有特殊物品"]
          : ["AK-47 | Nightwish", "MP9 | Starlight Protector", "FAMAS | Rapid Eye Movement", "Rare Special Item"]
      }
    ];
    root.innerHTML = `
      <section class="page-intro" data-motion-intro>
        <p class="eyebrow">${escapeHtml(text("Drop Theatre", "掉落剧场"))}</p>
        <h1>${escapeHtml(text("Drop Theatre", "掉落剧场"))}</h1>
        <p>${escapeHtml(text("Choose a case, inspect a compact drop pool, and run a quick opening simulation while the full catalog hydrates.", "选择箱子、检视掉落池，并在完整目录加载时先运行快速开箱模拟。"))}</p>
      </section>
      <section class="opening-simulator fallback-opening-simulator">
        <p class="eyebrow">${escapeHtml(text("Quick Open", "快速开箱"))}</p>
        <h2 id="fallbackOpeningTitle">${escapeHtml(cases[0].name)}</h2>
        <div class="opening-result-card" id="fallbackOpeningResult">${escapeHtml(text("Ready to open.", "准备开箱。"))}</div>
        <button class="primary-action" type="button" id="fallbackOpenButton">${escapeHtml(text("Open", "开启"))}</button>
      </section>
      <div class="collection-index">
        <section class="collection-index-group">
          <p class="eyebrow">${escapeHtml(text("Cases", "箱子"))}</p>
          <h2>${escapeHtml(text("Opening Index", "开箱索引"))}</h2>
          <div class="collection-grid opening-grid">
            ${cases.map((entry, index) => `
              <article class="collection-card opening-card${index === 0 ? " is-active" : ""}" data-fallback-case="${index}">
                <span>${escapeHtml(text("Container", "容器"))}</span>
                <h3>${escapeHtml(entry.name)}</h3>
                <p>${escapeHtml(entry.pool.join(" / "))}</p>
                <button class="secondary-action compact-action" type="button" data-fallback-case-button="${index}">${escapeHtml(text("Select", "选择"))}</button>
              </article>
            `).join("")}
          </div>
        </section>
      </div>
    `;
    let activeIndex = 0;
    const selectCase = (index) => {
      activeIndex = index;
      $("#fallbackOpeningTitle").textContent = cases[index].name;
      $$(".opening-card", root).forEach((card) => card.classList.toggle("is-active", Number(card.dataset.fallbackCase) === index));
    };
    root.addEventListener("click", (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest("[data-fallback-case-button], #fallbackOpenButton") : null;
      if (!button) return;
      if (button.id === "fallbackOpenButton") {
        const pool = cases[activeIndex].pool;
        const result = pool[Math.floor(Math.random() * pool.length)];
        $("#fallbackOpeningResult").textContent = `${text("Drop", "掉落")}: ${result}`;
        return;
      }
      selectCase(Number(button.dataset.fallbackCaseButton || 0));
    });
  }

  const HALL_BUCKETS = [
    { id: "collection", label: "Map Collections" },
    { id: "weapon-case", label: "Cases" },
    { id: "capsule", label: "Capsules" },
    { id: "souvenir-package", label: "Souvenirs" },
    { id: "other", label: "Other" }
  ];

  const hallState = {
    bucket: "collection",
    query: "",
    sort: "az",
    type: "all",
    page: 1,
    selectedName: "",
    touched: false
  };
  const HALL_STATE_KEY = "cs2-relic-hall:halls-memory";

  function readStorageJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorageJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function persistHallDirectoryState() {
    writeStorageJson(HALL_STATE_KEY, {
      bucket: String(hallState.bucket || "collection"),
      query: String(hallState.query || ""),
      sort: String(hallState.sort || "az"),
      type: String(hallState.type || "all"),
      page: Math.max(1, Number(hallState.page) || 1),
      selectedName: String(hallState.selectedName || ""),
      touched: Boolean(hallState.touched),
      scrollX: Number(globalThis.scrollX || globalThis.pageXOffset || 0),
      scrollY: Number(globalThis.scrollY || globalThis.pageYOffset || 0),
      capturedAt: Date.now()
    });
  }

  function restoreHallDirectoryState() {
    const saved = readStorageJson(HALL_STATE_KEY, {});
    hallState.bucket = String(saved.bucket || hallState.bucket || "collection");
    hallState.query = String(saved.query || "");
    hallState.sort = String(saved.sort || "az");
    hallState.type = String(saved.type || "all");
    hallState.page = Math.max(1, Number(saved.page) || 1);
    hallState.selectedName = String(saved.selectedName || "");
    hallState.touched = Boolean(saved.touched);
  }

  function restoreHallDirectoryScroll() {
    const saved = readStorageJson(HALL_STATE_KEY, {});
    const x = Number(saved.scrollX || 0);
    const y = Number(saved.scrollY || 0);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const token = `${String(saved.bucket || "")}|${String(saved.query || "")}|${String(saved.type || "")}|${String(saved.sort || "")}|${Number(saved.page) || 1}|${y}`;
    if (hallState.restoreToken === token) return;
    hallState.restoreToken = token;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollTo(x, y);
      });
    });
  }

  const PREVIEW_HALL_ROWS = [
    { name: "Ancient Collection", collectionEn: "Ancient Collection", count: 32, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-ancient.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "2 Days Ago", coverage: "92%", href: "catalog.html?collection=The%20Ancient%20Collection" },
    { name: "Mirage Collection", collectionEn: "Mirage Collection", count: 18, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-mirage-wide.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "5 Days Ago", coverage: "89%", href: "catalog.html?collection=The%202021%20Mirage%20Collection" },
    { name: "Inferno Collection", collectionEn: "Inferno Collection", count: 22, bucket: "collection", types: ["rifle", "pistol", "shotgun"], cover: "assets/halls/map-inferno-wide.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "1 Week Ago", coverage: "94%", href: "catalog.html?collection=The%202018%20Inferno%20Collection" },
    { name: "Nuke Collection", collectionEn: "Nuke Collection", count: 17, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-nuke-wide.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "3 Days Ago", coverage: "88%", href: "catalog.html?collection=The%202018%20Nuke%20Collection" },
    { name: "Overpass Collection", collectionEn: "Overpass Collection", count: 16, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-overpass.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "2 Weeks Ago", coverage: "91%", href: "catalog.html?collection=The%20Overpass%20Collection" },
    { name: "Vertigo Collection", collectionEn: "Vertigo Collection", count: 14, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-vertigo.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "1 Month Ago", coverage: "86%", href: "catalog.html?collection=The%202021%20Vertigo%20Collection" },
    { name: "Dust II Collection", collectionEn: "Dust II Collection", count: 11, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-dust2.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "2 Days Ago", coverage: "93%", href: "catalog.html?collection=The%202021%20Dust%202%20Collection" },
    { name: "Train Collection", collectionEn: "Train Collection", count: 12, bucket: "collection", types: ["rifle", "pistol", "smg"], cover: "assets/halls/map-train.png", sublabel: "Field Wings", category: "Map Collections", lastViewed: "3 Weeks Ago", coverage: "90%", href: "catalog.html?collection=The%202021%20Train%20Collection" }
  ];
  const HALL_PREVIEW_LOOKUP = new Map(
    PREVIEW_HALL_ROWS.map((entry) => [hallLookupKey(entry.collectionEn || entry.name), entry])
  );
  const GENERATED_MAP_COVERS = new Map([
    ["the anubis collection", "assets/halls/generated/map-anubis.svg"],
    ["the assault collection", "assets/halls/generated/map-assault.svg"],
    ["the aztec collection", "assets/halls/generated/map-aztec.svg"],
    ["the baggage collection", "assets/halls/generated/map-baggage.svg"],
    ["the bank collection", "assets/halls/generated/map-bank.svg"],
    ["the cache collection", "assets/halls/generated/map-cache.svg"],
    ["the canals collection", "assets/halls/generated/map-canals.svg"],
    ["the cobblestone collection", "assets/halls/generated/map-cobblestone.svg"],
    ["the control collection", "assets/halls/generated/map-control.svg"],
    ["the dust collection", "assets/halls/generated/map-dust.svg"],
    ["the 2021 dust 2 collection", "assets/halls/map-dust2.png"],
    ["the 2018 inferno collection", "assets/halls/map-inferno-wide.png"],
    ["the italy collection", "assets/halls/generated/map-italy.svg"],
    ["the lake collection", "assets/halls/generated/map-lake.svg"],
    ["the militia collection", "assets/halls/generated/map-militia.svg"],
    ["the 2021 mirage collection", "assets/halls/map-mirage-wide.png"],
    ["the 2018 nuke collection", "assets/halls/map-nuke-wide.png"],
    ["the norse collection", "assets/halls/generated/map-norse.svg"],
    ["the safehouse collection", "assets/halls/generated/map-safehouse.svg"],
    ["the st. marc collection", "assets/halls/generated/map-st-marc.svg"],
    ["the 2021 train collection", "assets/halls/map-train.png"],
    ["the 2021 vertigo collection", "assets/halls/map-vertigo.png"]
  ].map(([name, cover]) => [hallLookupKey(name), cover]));
  const MAP_COLLECTION_KEYS = new Set([
    "the ancient collection",
    "the anubis collection",
    "the assault collection",
    "the aztec collection",
    "the baggage collection",
    "the bank collection",
    "the cache collection",
    "the canals collection",
    "the cobblestone collection",
    "the control collection",
    "the dust collection",
    "the 2021 dust 2 collection",
    "the 2018 inferno collection",
    "the italy collection",
    "the lake collection",
    "the militia collection",
    "the 2021 mirage collection",
    "the 2018 nuke collection",
    "the norse collection",
    "the overpass collection",
    "the safehouse collection",
    "the st. marc collection",
    "the 2021 train collection",
    "the 2021 vertigo collection"
  ].map((value) => hallLookupKey(value)));

  function hallPageActive() {
    return /collections\.html$/i.test(location.pathname) || /\/$/.test(location.pathname) && document.querySelector("main.collections-page");
  }

  function hallCollectionName(item) {
    return String(item?.collectionEn || item?.collection || item?.collectionZh || "").trim();
  }

  function hallDisplayName(entry) {
    const lang = String(globalThis.getCurrentLanguage?.() || document.documentElement.lang || document.documentElement.dataset.uiLang || "en");
    if (/^zh/i.test(lang) && String(entry?.collectionZh || "").trim()) {
      return String(entry.collectionZh).trim();
    }
    return String(entry?.collectionEn || entry?.name || entry?.collectionZh || "").trim();
  }

  function hallSlug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/^the\s+/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "hall";
  }

  function isMapCollectionEntry(entry) {
    return [entry?.name, entry?.collectionEn, entry?.collectionZh]
      .map((value) => hallLookupKey(value))
      .some((value) => MAP_COLLECTION_KEYS.has(value));
  }

  function classifyHallBucket(entry) {
    const textValue = [entry.name, entry.collectionEn, entry.collectionZh, ...(entry.types || [])].join(" ").toLowerCase();
    const zhValue = [entry.name, entry.collectionEn, entry.collectionZh].join(" ");
    if (/souvenir package/.test(textValue) || /纪念品包/.test(zhValue)) return "souvenir-package";
    if (/capsule|autograph|sticker capsule|patch capsule/.test(textValue) || /胶囊|印花胶囊|签名/.test(zhValue)) return "capsule";
    if (/weapon case|\bcase\b/.test(textValue) || /武器箱|箱子/.test(zhValue)) return "weapon-case";
    if ((entry.types || []).length && (entry.types || []).every((type) => type === "sticker")) return "capsule";
    if ((entry.types || []).some((type) => ["agent", "music-box", "equipment"].includes(type))) return "other";
    return isMapCollectionEntry(entry) ? "collection" : "other";
  }

  function hallLookupKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^the\s+/, "")
      .replace(/[“”"']/g, "")
      .replace(/\s+/g, " ");
  }

  function hallOpeningLookup() {
    const lookup = new Map();
    const openings = Array.isArray(globalThis.CS2_UNBOXING) ? globalThis.CS2_UNBOXING : [];
    openings.forEach((item) => {
      const names = [item?.name, item?.nameEn, item?.nameZh, item?.marketHashName, item?.market_hash_name]
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      names.forEach((name) => {
        [
          name,
          name.replace(/\s+(weapon\s+)?case$/i, ""),
          name.replace(/\s+souvenir\s+package$/i, ""),
          name.replace(/\s+sticker\s+capsule$/i, ""),
          name.replace(/\s+capsule$/i, "")
        ].forEach((alias) => {
          const key = hallLookupKey(alias);
          if (key && !lookup.has(key)) lookup.set(key, item);
        });
      });
    });
    return lookup;
  }

  function hallOpeningBucket(kind) {
    if (["weapon-case", "souvenir-package", "capsule"].includes(kind)) return kind;
    if (["container", "package", "music-kit-box"].includes(kind)) return "other";
    return "";
  }

  function hallOpeningImage(opening) {
    return String(
      opening?.image ||
      opening?.icon ||
      opening?.iconUrl ||
      opening?.imageUrl ||
      opening?.cover ||
      opening?.containerImage ||
      ""
    );
  }

  function hallOpeningCandidates(entry) {
    return [entry.name, entry.collectionEn, entry.collectionZh]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .flatMap((name) => {
        const withoutCollection = name.replace(/\s+collection$/i, "").replace(/^the\s+/i, "");
        return [
          name,
          withoutCollection,
          withoutCollection.replace(/\s+case$/i, ""),
          `${withoutCollection} case`
        ];
      })
      .map(hallLookupKey)
      .filter(Boolean);
  }

  function buildHallSummaries() {
    const source = Array.isArray(globalThis.CS2_CATALOG) ? globalThis.CS2_CATALOG : [];
    const counts = new Map();
    source.forEach((item) => {
      const name = hallCollectionName(item);
      if (!name) return;
      const entry = counts.get(name) || {
        name,
        collectionEn: String(item.collectionEn || name),
        collectionZh: String(item.collectionZh || ""),
        count: 0,
        types: new Set(),
        previewImage: "",
        previewLabel: ""
      };
      entry.count += 1;
      if (item.type) entry.types.add(String(item.type));
      if (!entry.previewImage && item.image) {
        entry.previewImage = String(item.image);
        entry.previewLabel = String(item.nameZh || item.nameEn || item.name || "");
      }
      counts.set(name, entry);
    });

    const openings = hallOpeningLookup();
    return [...counts.values()].map((entry, index) => {
      const types = [...entry.types].filter(Boolean);
      const opening = [
        ...hallOpeningCandidates(entry)
      ].map((key) => openings.get(key)).find(Boolean) || null;
      const preview = HALL_PREVIEW_LOOKUP.get(hallLookupKey(entry.collectionEn || entry.name)) || null;
      const generatedCover = GENERATED_MAP_COVERS.get(hallLookupKey(entry.collectionEn || entry.name)) || "";
      const summary = {
        name: entry.name,
        collectionEn: entry.collectionEn,
        collectionZh: entry.collectionZh,
        count: entry.count,
        types,
        openingId: opening?.id || "",
        openingKind: opening?.kind || "",
        cover: preview?.cover || generatedCover,
        containerImage: hallOpeningImage(opening),
        previewImage: entry.previewImage || "",
        previewLabel: entry.previewLabel || "",
        sublabel: preview?.sublabel || "",
        category: preview?.category || "",
        lastViewed: preview?.lastViewed || text(`${(index % 12) + 2} Days Ago`, `${(index % 12) + 2} 天前`),
        coverage: preview?.coverage || `${Math.max(42, 96 - (index % 9) * 5)}%`,
        href: preview?.href || ""
      };
      summary.bucket = hallOpeningBucket(summary.openingKind) || classifyHallBucket(summary);
      return summary;
    });
  }

  function hallEntriesForBucket(bucketId) {
    return buildHallSummaries().filter((entry) => entry.bucket === bucketId);
  }

  function hallCoverMarkup(entry) {
    if (entry.cover) {
      return `<img class="halls-cover-asset" src="${escapeHtml(entry.cover)}" alt="" loading="eager" decoding="async" />`;
    }
    const fallbackImage = entry.containerImage || (entry.bucket !== "collection" ? entry.previewImage : "");
    if (fallbackImage) {
      return `<img class="halls-cover-asset" src="${escapeHtml(fallbackImage)}" alt="${escapeHtml(entry.previewLabel || hallDisplayName(entry))}" loading="lazy" decoding="async" />`;
    }
    const slug = hallSlug(hallDisplayName(entry));
    if (entry.bucket === "weapon-case" || entry.bucket === "capsule" || entry.bucket === "souvenir-package") {
      return `<div class="halls-case-render"><span>${escapeHtml(hallShortLabel(entry))}</span></div>`;
    }
    return `<div class="halls-map-render halls-map-${escapeHtml(slug)}"><span>${escapeHtml(hallShortLabel(entry))}</span></div>`;
  }

  function hallShortLabel(entry) {
    return hallDisplayName(entry)
      .replace(/^The\s+/i, "")
      .replace(/\s+Collection$/i, "")
      .replace(/\s+Case$/i, "")
      .split(/\s+/)
      .slice(0, 2)
      .join(" ");
  }

  function hallBucketLabel(bucketId) {
    if (bucketId === "collection") return text("Map Collections", "地图收藏品");
    if (bucketId === "weapon-case") return text("Cases", "武器箱");
    if (bucketId === "capsule") return text("Capsules", "胶囊");
    if (bucketId === "souvenir-package") return text("Souvenirs", "纪念包");
    return text("Other", "其他");
  }

  function hallTypeLabel(type) {
    const key = String(type || "").trim().toLowerCase();
    const labels = {
      rifle: text("Rifle", "步枪"),
      pistol: text("Pistol", "手枪"),
      smg: text("SMG", "冲锋枪"),
      shotgun: text("Shotgun", "霰弹枪"),
      machinegun: text("Machine Gun", "机枪"),
      knife: text("Knife", "刀具"),
      glove: text("Glove", "手套"),
      sticker: text("Sticker", "贴纸"),
      agent: text("Agent", "探员"),
      "music-box": text("Music Kit", "音乐盒"),
      equipment: text("Equipment", "装备")
    };
    return labels[key] || type || text("Other", "其他");
  }

  function hallRowSublabel(entry, opensDetail) {
    if (entry?.sublabel) return entry.sublabel;
    return opensDetail ? text("Container detail", "容器详情") : text("Map cover render", "地图封面");
  }

  function hallPaginationSummary(start, end, total) {
    return text("Showing {start}-{end} of {total}", "显示第 {start}-{end} 项，共 {total} 项")
      .replace("{start}", String(start))
      .replace("{end}", String(end))
      .replace("{total}", String(total));
  }

  function hallRowMeta(entry, index) {
    if (["weapon-case", "capsule", "souvenir-package"].includes(entry.bucket)) return "Live";
    return `Price ${Math.max(41, 92 - (index % 9) * 6)}%`;
  }

  function hallHref(entry) {
    if (entry.href) return entry.href;
    if (entry.openingId && ["weapon-case", "capsule", "souvenir-package", "other"].includes(entry.bucket)) {
      const params = new URLSearchParams();
      params.set("id", String(entry.openingId).trim());
      return `item.html?${params.toString()}`;
    }
    return `catalog.html?collection=${encodeURIComponent(entry.name)}`;
  }

  function filteredHallEntries() {
    const query = hallState.query.trim().toLowerCase();
    let entries = hallEntriesForBucket(hallState.bucket);
    if (hallState.type !== "all") {
      entries = entries.filter((entry) => entry.types.includes(hallState.type));
    }
    if (query) {
      entries = entries.filter((entry) => [entry.name, entry.collectionEn, entry.collectionZh].join(" ").toLowerCase().includes(query));
    }
    entries.sort((a, b) => {
      if (hallState.sort === "count") return b.count - a.count || hallDisplayName(a).localeCompare(hallDisplayName(b));
      if (hallState.sort === "za") return hallDisplayName(b).localeCompare(hallDisplayName(a));
      return hallDisplayName(a).localeCompare(hallDisplayName(b));
    });
    return entries;
  }

  function hallTypeOptions(entries) {
    const allTypes = [...new Set(entries.flatMap((entry) => entry.types || []))].filter(Boolean).sort();
    return [`<option value="all">${escapeHtml(text("Filter Type", "筛选类型"))}</option>`]
      .concat(allTypes.map((type) => `<option value="${escapeHtml(type)}"${hallState.type === type ? " selected" : ""}>${escapeHtml(hallTypeLabel(type))}</option>`))
      .join("");
  }

  function renderHallRows(root) {
    const allInBucket = hallEntriesForBucket(hallState.bucket);
    const entries = filteredHallEntries();
    const pageSize = hallState.bucket === "collection" ? 24 : 8;
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    hallState.page = Math.min(totalPages, Math.max(1, Number(hallState.page) || 1));
    const pageStart = (hallState.page - 1) * pageSize;
    const visibleEntries = entries.slice(pageStart, pageStart + pageSize);
    const rows = root.querySelector("[data-halls-rows]");
    const count = root.querySelector("[data-halls-count]");
    const type = root.querySelector("[data-halls-type]");
    const pagination = root.querySelector("[data-halls-pagination]");
    if (count) count.textContent = `${entries.length || allInBucket.length} Halls`;
    if (type) type.innerHTML = hallTypeOptions(allInBucket);
    if (!rows) return;
    rows.innerHTML = visibleEntries.length ? visibleEntries.map((entry, index) => {
      const opensDetail = ["weapon-case", "capsule", "souvenir-package"].includes(entry.bucket);
      const coverMode = entry.bucket === "collection" ? "is-map" : "is-case";
      const selectedName = String(hallState.selectedName || "");
      const isSelected = selectedName && selectedName === entry.name;
      return `
        <article class="halls-directory-row${isSelected ? " is-selected" : ""}" data-halls-select="${escapeHtml(entry.name)}" tabindex="0" role="button" aria-pressed="${isSelected ? "true" : "false"}">
          <div class="halls-row-thumb ${coverMode}">${hallCoverMarkup(entry)}</div>
          <div class="halls-row-title">
            <h3>${escapeHtml(hallDisplayName(entry))}</h3>
            <small>${escapeHtml(hallRowSublabel(entry, opensDetail))}</small>
          </div>
          <span>${escapeHtml(entry.category || hallBucketLabel(entry.bucket))}</span>
          <span>${escapeHtml(`${entry.count} items`)}</span>
          <span>${escapeHtml(entry.lastViewed || text(`${index + 2} Days Ago`, `${index + 2} 天前`))}</span>
          <span>${escapeHtml(entry.coverage || (entry.meta || hallRowMeta(entry, index)).replace(/^Price\s+/i, ""))}</span>
          <a class="halls-row-cta" href="${escapeHtml(hallHref(entry))}">${escapeHtml(entry.cta || (opensDetail ? text("View Details", "查看详情") : text("View Hall", "查看展区")))}<b aria-hidden="true">-&gt;</b></a>
        </article>
      `;
    }).join("") : `<div class="halls-empty">${escapeHtml(text("No halls match this filter.", "没有匹配的展区。"))}</div>`;
    if (pagination) {
      const start = entries.length ? pageStart + 1 : 0;
      const end = Math.min(entries.length, pageStart + visibleEntries.length);
      const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        return `<button class="${page === hallState.page ? "is-active" : ""}" type="button" data-halls-page="${page}">${page}</button>`;
      }).join("");
      pagination.innerHTML = `
        <span>${escapeHtml(hallPaginationSummary(start, end, entries.length))}</span>
        <div>
          <button type="button" data-halls-page="${Math.max(1, hallState.page - 1)}" aria-label="${escapeHtml(text("Previous", "上一页"))}"${hallState.page <= 1 ? " disabled" : ""}>&lt;</button>
          ${pageButtons}
          <button type="button" data-halls-page="${Math.min(totalPages, hallState.page + 1)}" aria-label="${escapeHtml(text("Next", "下一页"))}"${hallState.page >= totalPages ? " disabled" : ""}>&gt;</button>
        </div>
      `;
    }
  }

  function buildHallsDirectoryMarkup() {
    const summaries = buildHallSummaries();
    const total = summaries.length || 186;
    const bucketCounts = Object.fromEntries(HALL_BUCKETS.map((bucket) => [
      bucket.id,
      summaries.filter((entry) => entry.bucket === bucket.id).length
    ]));
    return `
      <section class="halls-directory-hero" data-motion-intro>
        <div class="halls-directory-title">
          <p class="eyebrow">${escapeHtml(text("Halls", "Halls"))}</p>
          <h1>${escapeHtml(text("Halls", "Halls"))}</h1>
          <p>${escapeHtml(text("Browse exhibition halls by group. Jump into collections, cases, capsules, and souvenir wings.", "按分组浏览展区，可进入收藏品、武器箱、胶囊和纪念包。"))}</p>
        </div>
        <div class="halls-weapon-rail" aria-hidden="true">
          <img src="assets/halls/weapon-panel-1.png" alt="" />
          <img src="assets/halls/weapon-panel-2.png" alt="" />
          <img src="assets/halls/weapon-panel-2.png" alt="" />
          <img src="assets/halls/weapon-panel-1.png" alt="" />
          <img src="assets/halls/weapon-panel-3.png" alt="" />
          <img src="assets/halls/weapon-panel-1.png" alt="" />
        </div>
      </section>
      <section class="halls-shell">
        <aside class="halls-tabs" aria-label="${escapeHtml(text("Hall categories", "展区分类"))}">
          ${HALL_BUCKETS.map((bucket) => `
            <button class="${bucket.id === hallState.bucket ? "is-active" : ""}" type="button" data-halls-bucket="${escapeHtml(bucket.id)}"><span>${escapeHtml(hallBucketLabel(bucket.id))}</span><em>${escapeHtml(String(bucketCounts[bucket.id] || 0))}</em></button>
          `).join("")}
        </aside>
        <div class="halls-table-panel">
          <section class="halls-toolbar">
            <label class="halls-search-wrap"><span aria-hidden="true"></span><input data-halls-search type="search" value="${escapeHtml(hallState.query)}" placeholder="${escapeHtml(text("Search halls", "搜索展区"))}" aria-label="${escapeHtml(text("Search halls", "搜索展区"))}" /></label>
            <select data-halls-sort aria-label="${escapeHtml(text("Sort halls", "展区排序"))}">
              <option value="az"${hallState.sort === "az" ? " selected" : ""}>${escapeHtml(text("Sort A-Z", "名称 A-Z"))}</option>
              <option value="za"${hallState.sort === "za" ? " selected" : ""}>${escapeHtml(text("Sort Z-A", "名称 Z-A"))}</option>
              <option value="count"${hallState.sort === "count" ? " selected" : ""}>${escapeHtml(text("Most Items", "物品最多"))}</option>
            </select>
            <select data-halls-type aria-label="${escapeHtml(text("Filter type", "筛选类型"))}"></select>
            <output data-halls-count>${escapeHtml(`${total} Halls`)}</output>
          </section>
          <div class="halls-table-head" aria-hidden="true">
            <span>${escapeHtml(text("Hall", "展区"))}</span><span>${escapeHtml(text("Category", "类别"))}</span><span>${escapeHtml(text("Items", "物品数"))}</span><span>${escapeHtml(text("Last Viewed", "最近查看"))}</span><span>${escapeHtml(text("Price Coverage", "价格覆盖"))}</span><span></span>
          </div>
          <div class="halls-rows" data-halls-rows></div>
          <footer class="halls-table-footer" data-halls-pagination>
            <span>${escapeHtml(hallPaginationSummary(1, Math.min(8, total), total))}</span>
            <div><button type="button" data-halls-page="1" aria-label="${escapeHtml(text("Previous", "上一页"))}" disabled>&lt;</button><button class="is-active" type="button" data-halls-page="1">1</button><button type="button" data-halls-page="2">2</button><button type="button" data-halls-page="3">3</button><button type="button" data-halls-page="2" aria-label="${escapeHtml(text("Next", "下一页"))}">&gt;</button></div>
          </footer>
        </div>
      </section>
    `;
  }

  function syncHallsChrome() {
    if (!hallPageActive()) return;
    const navLabels = {
      Catalog: "Archive",
      Collections: "Halls",
      Inspector: "Inspect",
      Favorites: "Saved",
      Recent: "Trail",
      Unbox: "Drop Theatre",
      Tools: "Tools",
      Account: "Pass",
      Inventory: "Vault",
      Loadout: "Curator"
    };
    Object.entries(navLabels).forEach(([key, label]) => {
      const node = document.querySelector(`[data-nav-key="${key}"]`);
      if (node) node.textContent = label;
    });
    const lang = document.querySelector(".lang-switch");
    if (lang instanceof HTMLSelectElement) {
      [...lang.options].forEach((option) => {
        if (option.selected) option.textContent = "ZH";
      });
    }
  }

  function renderHallsDirectory() {
    if (!hallPageActive()) return;
    const main = document.querySelector("main.collections-page");
    if (!main) return;
    document.body.classList.remove("home-exhibition-page");
    document.body.classList.add("halls-directory-page");
    main.innerHTML = buildHallsDirectoryMarkup();
    renderHallRows(main);
    restoreHallDirectoryScroll();
    if (document.documentElement?.dataset) {
      document.documentElement.dataset.uiReady = "true";
    }
  }

  function bindHallsDirectoryEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-halls-bucket]") : null;
      if (target instanceof HTMLElement) {
        hallState.bucket = target.dataset.hallsBucket || "collection";
        hallState.query = "";
        hallState.type = "all";
        hallState.page = 1;
        hallState.selectedName = "";
        hallState.touched = true;
        persistHallDirectoryState();
        renderHallsDirectory();
        return;
      }
      const pageButton = event.target instanceof HTMLElement ? event.target.closest("[data-halls-page]") : null;
      if (pageButton instanceof HTMLElement) {
        event.preventDefault();
        hallState.page = Math.max(1, Number(pageButton.dataset.hallsPage) || 1);
        hallState.touched = true;
        persistHallDirectoryState();
        renderHallRows(document.querySelector("main.collections-page") || document);
        return;
      }
      const row = event.target instanceof HTMLElement ? event.target.closest("[data-halls-select]") : null;
      if (row instanceof HTMLElement && !event.target.closest(".halls-row-cta")) {
        event.preventDefault();
        hallState.selectedName = row.dataset.hallsSelect || "";
        hallState.touched = true;
        persistHallDirectoryState();
        renderHallRows(document.querySelector("main.collections-page") || document);
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target instanceof HTMLInputElement ? event.target : null;
      if (!target?.matches("[data-halls-search]")) return;
      hallState.query = target.value;
      hallState.page = 1;
      hallState.touched = true;
      persistHallDirectoryState();
      renderHallRows(document.querySelector("main.collections-page") || document);
    });

    document.addEventListener("change", (event) => {
      const target = event.target instanceof HTMLSelectElement ? event.target : null;
      if (!target) return;
      if (target.matches("[data-halls-sort]")) {
        hallState.sort = target.value;
        hallState.page = 1;
        hallState.touched = true;
        persistHallDirectoryState();
        renderHallRows(document.querySelector("main.collections-page") || document);
      }
      if (target.matches("[data-halls-type]")) {
        hallState.type = target.value;
        hallState.page = 1;
        hallState.touched = true;
        persistHallDirectoryState();
        renderHallRows(document.querySelector("main.collections-page") || document);
      }
      if (target.matches(".lang-switch")) {
        window.setTimeout(renderHallsDirectory, 0);
      }
    });

    document.addEventListener("keydown", (event) => {
      const row = event.target instanceof HTMLElement ? event.target.closest("[data-halls-select]") : null;
      if (!(row instanceof HTMLElement)) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      hallState.selectedName = row.dataset.hallsSelect || "";
      hallState.touched = true;
      persistHallDirectoryState();
      renderHallRows(document.querySelector("main.collections-page") || document);
    });
  }

  function boot() {
    state.diyOpen = false;
    normalizeVisibleMojibake();
    ensureMojibakeCleanupObserver();
    bindEvents();
    applyEmbeddedSnapshot();
    scheduleVisiblePriceHydration();
    rebuildStickerViewer();
    syncWearVisibility();
    syncDetailUi();
    syncDiyLayoutState();
    restoreHallDirectoryState();
    bindHallsDirectoryEvents();
    window.addEventListener("pagehide", persistHallDirectoryState);
    window.addEventListener("beforeunload", persistHallDirectoryState);
    renderHallsDirectory();
    window.setTimeout(renderOpeningFallback, 1200);
  }

  try {
    globalThis.renderHallsDirectory = renderHallsDirectory;
  } catch {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
