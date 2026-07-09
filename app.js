  const STATE_KEY = "cs2-relic-hall:state";
  const DIY_KEY = "cs2-relic-hall:diy-designs";
  const OPENING_STATE_KEY = "cs2-relic-hall:openings";
  const INSPECTOR_STATE_KEY = "cs2-relic-hall:inspector";
  const AI_LOADOUT_STATE_KEY = "cs2-relic-hall:ai-loadout";
  const DEFAULT_DETAIL_ALIAS = "ak-inheritance";
  const PAGE_SIZE = 24;
  const INVENTORY_PAGE_SIZE = 72;
  const PRO_LOADOUT_TEAM_PAGE_SIZE = 6;
  const PRO_LOADOUT_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
  const AI_LOADOUT_SCHEMA_VERSION = 20260708;
  const LOADOUT_ZH = {
    curator: "????",
    introReady: "?????????????????????????????",
    introLoading: "??????????????????????????",
    preparing: "????????...",
    proLoading: "??????????...",
    inventoryLoading: "??????????...",
    inventoryEmpty: "?????????????????????????",
    inventoryTitle: "????",
    inventoryHeading: "???????????",
    inventoryCopy: "????????????????????????????????????",
    priceData: "????",
    priceLoading: "???????",
    anotherSet: "???",
    refresh: "????",
    refreshing: "???...",
    combo: "?????????",
    premium: "????",
    noSnapshot: "????????????????",
    chatTitle: "AI ????",
    chatHeading: "???????????",
    chatCopy: "???????????????????????????????",
    askWhat: "??????????",
    askAi: "? AI ??",
    clearChat: "????",
    thinking: "???...",
    aiRecommendation: "AI ????",
    updating: "????????...",
    chatEmpty: "?????????????????????????",
    proTitle: "??????",
    byTeam: "???",
    source: "??",
    loadMoreTeams: "??????",
    proUnavailable: "????????????"
  };
  const CATEGORY_ORDER = ["rifle", "pistol", "smg", "shotgun", "machinegun", "knife", "glove", "sticker", "agent", "music-box"];
  const OPENING_KIND_ORDER = ["weapon-case", "souvenir-package", "capsule", "music-kit-box", "package", "container"];
  const CATEGORY_I18N = {
    pistol: { en: "Pistol", "zh-CN": "手枪" },
    rifle: { en: "Rifle", "zh-CN": "步枪" },
    smg: { en: "SMG", "zh-CN": "冲锋枪" },
    shotgun: { en: "Shotgun", "zh-CN": "霰弹枪" },
    machinegun: { en: "Machine Gun", "zh-CN": "机枪" },
    equipment: { en: "Equipment", "zh-CN": "装备" },
    knife: { en: "Knife", "zh-CN": "刀具" },
    glove: { en: "Glove", "zh-CN": "手套" },
    sticker: { en: "Sticker", "zh-CN": "贴纸" },
    agent: { en: "Agent", "zh-CN": "探员" },
    "music-box": { en: "Music Kit", "zh-CN": "音乐盒" }
  };
  const WEAR_TEXT = {
    "factory-new": { en: "Factory New", zh: "崭新出厂" },
    "minimal-wear": { en: "Minimal Wear", zh: "略有磨损" },
    "field-tested": { en: "Field-Tested", zh: "久经沙场" },
    "well-worn": { en: "Well-Worn", zh: "破损不堪" },
    "battle-scarred": { en: "Battle-Scarred", zh: "战痕累累" }
  };
  const CLEAN_CATEGORY_LABELS_ZH = {
    pistol: "手枪",
    rifle: "步枪",
    smg: "冲锋枪",
    shotgun: "霰弹枪",
    machinegun: "机枪",
    equipment: "装备",
    knife: "刀具",
    glove: "手套",
    sticker: "贴纸",
    agent: "探员",
    "music-box": "音乐盒",
    sniper: "狙击枪"
  };
  const CLEAN_WEAR_LABELS_ZH = {
    "factory-new": "崭新出厂",
    "minimal-wear": "略有磨损",
    "field-tested": "久经沙场",
    "well-worn": "破损不堪",
    "battle-scarred": "战痕累累"
  };
  const CLEAN_RARITY_LABELS_ZH = {
    "Consumer Grade": "消费级",
    "Industrial Grade": "工业级",
    "Mil-Spec Grade": "军规级",
    Restricted: "受限级",
    Classified: "保密级",
    Covert: "隐秘级",
    Contraband: "违禁",
    Base: "普通级",
    "Base Grade": "普通级",
    High: "高级",
    "High Grade": "高级",
    Remarkable: "卓越",
    Exotic: "奇异",
    Extraordinary: "非凡",
    Master: "大师"
  };
  const WEAR_FLOAT_RANGES = [
    { id: "factory-new", min: 0, max: 0.07 },
    { id: "minimal-wear", min: 0.07, max: 0.15 },
    { id: "field-tested", min: 0.15, max: 0.38 },
    { id: "well-worn", min: 0.38, max: 0.45 },
    { id: "battle-scarred", min: 0.45, max: 1 }
  ];
  const OPENING_WEAR_PROBABILITIES = {
    "factory-new": 0.03,
    "minimal-wear": 0.24,
    "field-tested": 0.33,
    "well-worn": 0.24,
    "battle-scarred": 0.16
  };
  const OPENING_KEY_PRICE_CNY = 18;
  const UI_META_SEPARATOR = " · ";
  const WEAPON_CASE_RARITY_PROBABILITIES = {
    "mil-spec": 0.7992327,
    restricted: 0.1598465,
    classified: 0.0319693,
    covert: 0.0063939,
    "rare-special": 0.0025575
  };
  const SOUVENIR_PACKAGE_PROBABILITY_MAP = {
    "consumer|industrial|mil-spec": {
      consumer: 0.80537,
      industrial: 0.16107,
      "mil-spec": 0.03356
    },
    "industrial|mil-spec|restricted": {
      industrial: 0.8,
      "mil-spec": 0.16667,
      restricted: 0.03333
    },
    "consumer|industrial|mil-spec|restricted": {
      consumer: 0.8,
      industrial: 0.16,
      "mil-spec": 0.03333,
      restricted: 0.00667
    },
    "consumer|industrial|mil-spec|restricted|classified": {
      consumer: 0.79893,
      industrial: 0.15979,
      "mil-spec": 0.03329,
      restricted: 0.00666,
      classified: 0.00133
    },
    "consumer|industrial|mil-spec|restricted|classified|covert": {
      consumer: 0.79872,
      industrial: 0.15974,
      "mil-spec": 0.03328,
      restricted: 0.00666,
      classified: 0.00133,
      covert: 0.00027
    }
  };
  const CAPSULE_PROBABILITY_MAP = {
    "high-grade|remarkable": {
      "high-grade": 0.83333,
      remarkable: 0.16667
    },
    "high-grade|remarkable|exotic": {
      "high-grade": 0.80645,
      remarkable: 0.16129,
      exotic: 0.03226
    },
    "remarkable|exotic": {
      remarkable: 0.83333,
      exotic: 0.16667
    },
    "high-grade|remarkable|exotic|extraordinary": {
      "high-grade": 0.80128,
      remarkable: 0.16026,
      exotic: 0.03205,
      extraordinary: 0.00641
    },
    "high-grade|exotic": {
      "high-grade": 0.96154,
      exotic: 0.03846
    },
    "high-grade|remarkable|extraordinary": {
      "high-grade": 0.82782,
      remarkable: 0.16556,
      extraordinary: 0.00662
    }
  };
  const RARITY_FALLBACK = {
    "Consumer Grade": { en: "Consumer Grade", zh: "娑堣垂绾?" },
    "Mil-Spec Grade": { en: "Mil-Spec Grade", zh: "军规级" },
    "Mil-Spec Grade": { en: "Mil-Spec Grade", zh: "\u519b\u89c4\u7ea7" },
    Restricted: { en: "Restricted", zh: "受限" },
    Classified: { en: "Classified", zh: "保密" },
    Covert: { en: "Covert", zh: "隐秘" },
    Remarkable: { en: "Remarkable", zh: "鍗撹秺" },
    Extraordinary: { en: "Extraordinary", zh: "非凡" },
    Exotic: { en: "Exotic", zh: "濂囧紓" },
    Contraband: { en: "Contraband", zh: "违禁" },
    "High Grade": { en: "High Grade", zh: "楂樼骇" },
    Standard: { en: "Standard", zh: "鏍囧噯" }
  };
  const appState = {
    catalogRenderedCount: PAGE_SIZE,
    authLoaded: false,
    authLoading: false,
    authStatus: "loading",
    session: null,
    inventoryPreview: null,
    steamKeyStatus: null,
    steamProfile: null,
    steamProfileMeta: null,
    buffStatus: null,
    youpinStatus: null,
    syncStatus: null,
    accountMessage: "",
    accountError: "",
    accountBusyAction: "",
    suppressAuthAutofillUntil: 0,
    inventorySyncRunning: false,
    inventoryAutoSyncStarted: false,
    pendingWear: "",
    pendingVariant: "",
    pendingTemplate: "",
    collectionPickerSuper: "",
    collectionPickerQuery: "",
    collectionPickerVisibleLimit: 60,
    inventorySortCache: { source: null, language: "", sorted: [] },
    inventoryRenderedCount: INVENTORY_PAGE_SIZE,
    livePrices: {},
    livePriceRequests: {},
    catalogPriceOverrides: {},
    catalogPriceOverridesLoaded: false,
    catalogPriceOverridesLoading: false,
    activeOpeningId: "",
    openingSpinning: false,
    openingResult: null,
    openingResultOpeningId: "",
    openingBatchCount: 10,
    openingBatchResults: [],
    openingHistory: [],
    openingPickerOpen: false,
    openingPickerKind: "",
    openingIndexVisibleByKind: {},
    openingRenderToken: 0,
    openingAnimationToken: 0,
    openingDeferredRender: false,
    aiInventoryRecommendations: null,
    aiInventoryLoading: false,
    aiInventoryPriceSnapshotLoadedAt: 0,
    aiInventoryPriceSnapshotRefreshing: false,
    aiInventoryUpgradeGroupIndex: 0,
    aiProLoadouts: null,
    aiProLoadoutsLoading: false,
    aiProLoadoutsFetchedAt: 0,
    aiProLoadoutsSchemaVersion: AI_LOADOUT_SCHEMA_VERSION,
    aiLoadoutChatMessages: [],
    aiLoadoutChatPending: false,
    aiLoadoutChatRequestToken: 0,
    aiLoadoutChatDraft: "",
    aiLoadoutBudgetDraft: "",
    aiLoadoutPreset: "auto",
    aiLoadoutColorFilter: "",
    aiLoadoutStyleFilter: "",
    aiInventoryCategory: "all",
    aiLoadoutCategory: "all",
    loadoutHydrationStarted: false,
    loadoutFrameReady: false,
    aiProTeamsRenderedCount: PRO_LOADOUT_TEAM_PAGE_SIZE,
    activeProPlayerKey: "",
    inventoryMarketPricesRequested: false,
    aiItemAnalyses: {},
    aiItemAnalysisRequests: {},
    aiOpeningAnalyses: {},
    aiOpeningAnalysisRequests: {},
    openingHistoryPage: 0,
    deferredImagePage: "",
    deferredImageReady: true,
    deferredImageHydrationScheduled: false
  };
  const catalogOptionsCache = new Map();
  const openingLootCache = new Map();
  let catalogDataPromise = null;
  let catalogAssetsPromise = null;
  const relatedDataPromises = new Map();
  let openingDataPromise = null;
  let accountOverviewUnavailableUntil = 0;
  let openingItems = Array.isArray(globalThis.CS2_UNBOXING) ? globalThis.CS2_UNBOXING : [];
  const runtimeUiText = typeof globalThis.uiText === "function" && globalThis.uiText.name !== "uiText" ? globalThis.uiText.bind(globalThis) : null;
  const runtimeUiTemplate = typeof globalThis.uiTemplate === "function" && globalThis.uiTemplate.name !== "uiTemplate" ? globalThis.uiTemplate.bind(globalThis) : null;
  const ZH_CN_UI_OVERRIDES = {
    "Curator": "策展室",
    "AI Loadout Studio": "AI 饰品搭配工作室",
    "AI Loadout Chat": "AI 搭配对话",
    "Describe Your Ideal Setup": "描述你理想的搭配",
    "Ask for budget-aware skin pairings, same-color inventory upgrades, and pro-inspired references.": "获取预算内饰品搭配、同色系库存升级和职业选手参考方案。",
    "The curator console appears first; recommendations and references stream in after catalog data is ready.": "策展控制台会先显示，等图鉴数据准备好后再补齐推荐与职业参考。",
    "Preparing recommendations...": "正在准备推荐内容...",
    "Loading pro references...": "正在加载职业参考...",
    "Loading pro loadouts...": "正在加载职业搭配...",
    "Pro Loadouts": "职业选手搭配",
    "Pro loadouts are temporarily unavailable.": "职业选手搭配暂时不可用。",
    "By Team": "按战队",
    "Load More Teams": "加载更多战队",
    "Start with a color, mood, weapon preference, or pro player name.": "可以从颜色、风格、武器偏好或职业选手名字开始描述。",
    "Low budget requests stay on gun skins first, and vague requests trigger follow-up questions before recommendations.": "低预算会优先推荐枪皮；如果描述太模糊，系统会先追问再给出建议。",
    "What do you want?": "你想要什么样的搭配？",
    "AI Recommendation": "AI 搭配推荐",
    "Updating the recommendation...": "正在更新搭配推荐...",
    "Ask AI": "让 AI 推荐",
    "Clear Chat": "清空对话",
    "Thinking...": "分析中...",
    "Source": "来源",
    "Save": "收藏",
    "Saved": "已收藏",
    "Compare": "加入对比",
    "Remove Compare": "移出对比",
    "No price": "暂无报价",
    "No image": "暂无图片",
    "Loading preview": "正在加载预览",
    "Load More": "加载更多",
    "Loading containers...": "正在加载箱子与胶囊...",
    "View Details": "查看详情",
    "Retry": "重试",
    "Select": "选择",
    "Simulate Unbox": "模拟开箱",
    "Run Multi-open": "连开",
    "Run Multi-open Again": "再次连开",
    "Opening...": "开箱中...",
    "Multi-opening...": "连开中...",
    "Choose Another Container": "更换箱子或胶囊",
    "Back to Unbox": "返回开箱",
    "Type": "类型",
    "Market Hash Name": "市场名称",
    "First Sale": "首次发售",
    "Listed Drops": "列出掉落",
    "Rare Specials": "稀有特殊物品",
    "Container price": "箱子价格",
    "Opening cost": "开箱成本",
    "Key": "钥匙",
    "key": "钥匙",
    "Unknown": "未知",
    "No description available.": "暂无说明。",
    "Weapon Case": "武器箱",
    "Souvenir Package": "纪念品包",
    "Capsule": "胶囊",
    "Music Kit Box": "音乐盒",
    "Package": "礼包",
    "Container": "容器",
    "Drop Theatre": "掉落剧场",
    "Openable Drops": "可开启掉落",
    "Weapon Cases": "武器箱",
    "Souvenir Packages": "纪念品包",
    "Sticker and Autograph Capsules": "贴纸与签名胶囊",
    "Music Kit Boxes": "音乐盒",
    "Other Packages": "其他礼包",
    "Other Containers": "其他容器",
    "Collections": "收藏品系列",
    "Other": "其他",
    "Pistol": "手枪",
    "Rifle": "步枪",
    "SMG": "冲锋枪",
    "Shotgun": "霰弹枪",
    "Machine Gun": "机枪",
    "Equipment": "装备",
    "Knife": "刀具",
    "Glove": "手套",
    "Sticker": "贴纸",
    "Agent": "探员",
    "Music Kit": "音乐盒",
    "Factory New": "崭新出厂",
    "Minimal Wear": "略有磨损",
    "Field-Tested": "久经沙场",
    "Well-Worn": "破损不堪",
    "Battle-Scarred": "战痕累累",
    "Base Grade": "基础级",
    "High Grade": "高级",
    "Standard": "普通",
    "Objects in view": "当前展品",
    "Selected Exhibits": "精选展品",
    "Featured exhibit": "重点展品",
    "Preparing archive image": "正在准备馆藏影像",
    "Exhibition entrances": "展馆入口",
    "Exhibition status": "展馆状态",
    "Archive online": "馆藏在线",
    "Market plates ready": "价格牌就绪",
    "Vault sync available": "藏库可同步",
    "Counter-Strike Digital Exhibition": "Counter-Strike 数字展馆",
    "Enter a black-box archive for CS skins, live market prices, Steam inventory, drop simulation, and AI-curated loadouts.": "进入一座黑色数字展馆，检索 CS 饰品、查看实时价格、同步 Steam 库存、模拟开箱，并让 AI 策展搭配方案。",
    "Enter Archive": "进入馆藏",
    "Open Drop Theatre": "打开掉落剧场",
    "Ask Curator": "询问策展室",
    "Account Center": "账号中心",
    "Inventory Gallery": "库存展厅",
    "AI Loadout Studio": "AI 饰品搭配工作室",
    "Search every exhibit": "检索全部展品",
    "Browse collection wings": "浏览系列展区",
    "Examine one object": "检视单件展品",
    "Open your private case": "打开私人展柜",
    "Return to recent exhibits": "回到最近展品",
    "Simulate openings": "模拟开箱掉落",
    "Manage access and sync": "管理账号与同步",
    "Review Steam inventory": "查看 Steam 藏库",
    "Generate AI loadouts": "生成 AI 搭配"
    ,
    "Checking Session": "正在检查会话",
    "Checking your local account session and synced inventory status.": "正在检查本地账号会话和库存同步状态。",
    "Market Sync": "市场同步",
    "Current source": "当前来源",
    "Public market": "公开市场",
    "Sync interval": "同步周期",
    "Sync task": "同步任务",
    "Idle": "空闲",
    "Last run": "上次执行",
    "Next run": "下次执行",
    "Not yet": "尚未执行",
    "Use the helper browser only for the initial BUFF login. After validation, live prices keep working without leaving that browser open.": "仅首次连接 BUFF 时使用辅助浏览器。验证成功后，实时价格可继续使用。",
    "Connect BUFF to unlock live BUFF prices.": "连接 BUFF 后可启用实时 BUFF 价格。",
    "Connect YouPin to unlock live YouPin prices.": "连接悠悠有品后可启用实时悠悠有品价格。",
    "BUFF price login": "BUFF 价格登录",
    "YouPin price login": "悠悠有品价格登录",
    "Connection status": "连接状态",
    "Not connected": "未连接",
    "Recent validation": "最近验证",
    "Login BUFF": "登录 BUFF",
    "Verify BUFF Login": "验证 BUFF 登录",
    "Unlink BUFF": "解绑 BUFF",
    "Login YouPin": "登录悠悠有品",
    "Verify YouPin Login": "验证悠悠有品登录",
    "Unlink YouPin": "解绑悠悠有品",
    "Sync YouPin Prices": "同步悠悠有品价格",
    "Vault preview": "藏库预览",
    "After binding Steam, synced inventory will appear here.": "绑定 Steam 后，同步到的库存会显示在这里。",
    "No synced inventory yet.": "还没有同步到库存。",
    "Prices are loading in the background and will appear shortly.": "价格正在后台加载，很快会显示。",
    "Loading synced Steam inventory...": "正在加载已同步的 Steam 库存...",
    "No synced inventory yet. Bind Steam and run inventory sync from the account page.": "还没有同步到库存，请在账号页绑定 Steam 并同步库存。",
    "Unable to render account page right now.": "暂时无法渲染账号页面。",
    "Unable to render inventory page right now.": "暂时无法渲染库存页面。",
    "Open Inspector": "打开检视器",
    "Click anywhere on the card to inspect": "点击卡片任意位置即可检视",
    "Drop Result": "掉落结果",
    "Ready to open": "准备开箱",
    "Hit the button to let the reel decide your drop.": "点击按钮，让转盘决定本次掉落。",
    "Inside This Case": "箱内掉落",
    "Full Loot Pool": "完整掉落池",
    "Browse the exact listed contents of this container below.": "在下方查看该容器列出的完整掉落内容。",
    "Case and Capsule Index": "箱子与胶囊索引",
    "Browse weapon cases, souvenir packages, capsules, and music kit boxes in one place.": "在一个页面浏览武器箱、纪念品包、胶囊和音乐盒。",
    "Choose Case": "选择箱子",
    "Pick a category first, then a case": "先选择类型，再选择箱子",
    "Close": "关闭",
    "Close picker": "关闭选择器",
    "Open This Case": "开启这个箱子",
    "Open Again": "再次开启",
    "Multi-open": "连开",
    "Click to Change Case": "点击更换箱子",
    "Choose another case": "选择其他箱子",
    "Roll For Drop": "抽取掉落",
    "The marker stops on your simulated reward.": "指针会停在本次模拟获得的奖励上。",
    "Standard Drops": "普通掉落",
    "These are the listed core drops in this container.": "这些是该容器列出的主要掉落。",
    "These are the extra rare pulls that can appear in place of a standard drop.": "这些是可能替代普通掉落出现的稀有特殊物品。",
    "No loot data yet.": "暂无掉落数据。",
    "Browse the container summary, current prices, and the exact listed loot pool below.": "查看该容器简介、当前价格和下方列出的完整掉落池。",
    "Loading pro references...": "正在加载职业参考...",
    "Loading pro loadouts...": "正在加载职业搭配...",
    "Pro loadouts are temporarily unavailable.": "职业选手搭配暂时不可用。",
    "AI recommendation is temporarily unavailable.": "AI 推荐暂时不可用。",
    "AI market read is temporarily unavailable for this version.": "当前版本的 AI 市场判断暂时不可用。",
    "Local service connection failed. Open this site through http://127.0.0.1:4173 after starting node scripts/serve.mjs.": "本地服务连接失败。请先启动后端服务，再通过 http://127.0.0.1:4173 打开页面。",
    "Account service is unavailable. Start the local server and refresh this page.": "账号服务暂不可用。请启动本地服务后刷新页面。",
    "Service Unavailable": "服务暂不可用",
    "Unable to render account page right now.": "暂时无法渲染账号页面。",
    "Unable to render inventory page right now.": "暂时无法渲染库存页面。",
    "This page hit a temporary render error. Reload once or reopen the page.": "页面暂时渲染失败，请刷新或重新打开。",
    "Profile": "资料",
    "Player": "玩家",
    "Created": "创建时间",
    "Not bound": "未绑定",
    "Inventory Sync": "库存同步",
    "Items Synced": "同步数量",
    "Steam ID / 64-bit account": "Steam ID / 64 位账号",
    "Save Steam Binding": "保存 Steam 绑定",
    "Syncing...": "同步中...",
    "Sync Steam Inventory": "同步 Steam 库存",
    "Sign Out": "退出登录",
    "Platform Access": "平台访问",
    "Sign In or Create an Account": "登录或创建账号",
    "Sign In": "登录",
    "Register": "注册",
    "Username": "用户名",
    "Password": "密码",
    "Signing In...": "登录中...",
    "Sign In Account": "登录账号",
    "Creating...": "创建中...",
    "Create Account": "创建账号",
    "Current Source": "当前来源",
    "Public Market": "公开市场",
    "Sync Interval": "同步周期",
    "Task": "同步任务",
    "Running": "运行中",
    "Last Run": "上次执行",
    "Next Run": "下次执行",
    "BUFF Price Login": "BUFF 价格登录",
    "YouPin Price Login": "悠悠有品价格登录",
    "Connection": "连接状态",
    "Connected": "已连接",
    "Not Connected": "未连接",
    "Last Validation": "最近验证",
    "Log In to BUFF": "登录 BUFF",
    "Validate BUFF Session": "验证 BUFF 登录",
    "Disconnect BUFF": "解绑 BUFF",
    "Log In to YouPin": "登录悠悠有品",
    "Validate YouPin Session": "验证悠悠有品登录",
    "Disconnect YouPin": "解绑悠悠有品",
    "Sync YouPin Prices": "同步悠悠有品价格",
    "Syncing YouPin Prices...": "正在同步悠悠有品价格...",
    "Vault Preview": "藏库预览",
    "After Steam is bound, synced items will appear here.": "绑定 Steam 后，同步库存会显示在这里。",
    "No synced inventory yet.": "还没有同步到库存。",
    "Prices are loading in the background and will appear shortly.": "价格正在后台加载，很快会显示。",
    "Total value": "总价值",
    "Loading synced Steam inventory...": "正在加载已同步的 Steam 库存...",
    "No synced inventory yet. Bind Steam and run inventory sync from the account page.": "还没有同步库存。请在通行证页面绑定 Steam 并同步库存。",
    "Pass": "通行证",
    "Manage account access, Steam binding, platform credentials, inventory sync, and market price sync.": "管理账号通行、Steam 绑定、平台凭证、库存同步和市场价格同步。",
    "Inventory": "库存",
    "Curator": "策展室",
    "Ask for budget-aware skin pairings, same-color inventory upgrades, and pro-inspired references.": "获取预算内饰品搭配、同色系库存升级和职业选手参考方案。",
    "The curator console appears first; recommendations and references stream in after catalog data is ready.": "策展控制台会先出现，推荐和参考会在馆藏数据就绪后补入。",
    "Preparing recommendations...": "正在准备推荐内容...",
    "Compare": "对比",
    "Clear Compare": "清空对比"
    ,
    "YouPin": "悠悠有品",
    "Keyword": "关键词",
    "Search skins or weapons": "搜索展品或武器",
    "Weapon Type": "武器类型",
    "Rarity": "稀有度",
    "Any": "不限",
    "Max Reference Price": "最高参考价",
    "Sort": "排序",
    "Recommended First": "推荐优先",
    "Price: Low to High": "价格从低到高",
    "Price: High to Low": "价格从高到低",
    "Rarity First": "稀有度优先",
    "Name A-Z": "名称排序",
    "Copy Link": "复制链接",
    "RESET FILTERS": "重置筛选",
    "Reset Filters": "重置筛选",
    "Featured": "推荐优先",
    "View Hall": "查看展区",
    "Default": "默认",
    "Reference, BUFF, and YouPin prices remain synced through the existing price system.": "参考价、BUFF 与悠悠有品价格继续通过现有价格系统同步。",
    "Viewing an item now automatically saves the latest platform price and reuses it as the reference price across the catalog and inspector.": "查看任意饰品后，系统会自动保存最新平台价格，并在目录和检视器中作为参考价复用。",
    "Synced YouPin reference": "已同步悠悠有品参考价",
    "YouPin price lookup failed.": "悠悠有品价格查询失败。",
    "YouPin price sync completed, but no matching prices were found.": "悠悠有品价格同步完成，但没有匹配到可用报价。",
    "YouPin login verified and saved. Item pages will now show live YouPin prices without keeping the helper browser open.": "悠悠有品登录已验证并保存，饰品页会在可用时显示实时悠悠有品价格。",
    "YouPin login is not ready yet.": "悠悠有品登录尚未准备好。",
    "YouPin session disconnected.": "悠悠有品会话已解绑。",
    "Please sign in first.": "请先登录。",
    "Steam Item": "Steam 物品",
    "Steam Inventory": "Steam 库存",
    "Reference": "参考价",
    "Version": "版本",
    "Special Template": "特殊模板",
    "Pricing loading...": "价格加载中...",
    "Stickers": "贴纸",
    "Classic CS weapon cases with skin pools and rare specials.": "经典 CS 武器箱，包含饰品池和稀有特殊物品。",
    "Tournament souvenir drops grouped by event and map.": "按赛事和地图分组的锦标赛纪念品掉落。",
    "Sticker capsules, autograph capsules, and related sealed drops.": "贴纸胶囊、签名胶囊及相关密封掉落。",
    "Music kit boxes, with standard and StatTrak sold as separate box variants.": "音乐盒箱子，普通版和 StatTrak 版分开出售。",
    "Gift packages and other sealed drops that are not standard cases.": "礼包及其他非标准武器箱的密封掉落。",
    "Containers": "容器",
    "Everything else that can be opened or unpacked.": "其他所有可以开启或拆封的物品。",
    "Weapon cases, souvenir packages, and capsules.": "武器箱、纪念品包和胶囊。",
    "View this drop": "查看该掉落",
    "Rare Special": "稀有特殊物品",
    "Weapon": "武器",
    "Wear": "磨损",
    "Float": "磨损值",
    "Wear Range": "磨损范围",
    "Wear Tier": "磨损档位",
    "Quality": "品质",
    "Inspect Item": "检视物品",
    "This Multi-open": "本次连开",
    "View this result": "查看该结果",
    "Openings": "开箱记录",
    "Current Container": "当前容器",
    "Input vs Return": "投入与产出",
    "Opening Spend vs Return": "开箱花费与回报",
    "Estimated from current opening costs and historical drop prices.": "基于当前开箱成本和历史掉落价格估算。",
    "Best Drop": "最佳掉落",
    "All Opening History": "全部开箱历史",
    "Opening History": "开箱历史",
    "View this history result": "查看这条历史结果",
    "Unknown drop": "未知掉落",
    "Unknown case": "未知箱子",
    "Finance": "收支分析",
    "Spend": "投入",
    "Return": "产出",
    "Profit": "盈亏",
    "ROI": "回报率",
    "Average Drop": "平均产出",
    "Interactive Unbox": "互动开箱",
    "Spin through the real loot pool and simulate what this container could reveal.": "滚动真实掉落池，模拟这个容器可能开出的物品。",
    "Case rarity odds follow Valve's published case model, and wear is generated as a specific float within each skin's real float range.": "武器箱稀有度概率遵循 Valve 公布的模型，磨损度会在每个皮肤真实的浮点范围内生成具体数值。",
    "View": "查看",
    "{count} items": "{count} 件物品",
    " rare": " 稀有",
    " 路 Showing first 24": " 路 仅显示前 24 项",
    " 路 25 per page": " 路 每页 25 项",
    "Cases that open into weapon skins, knives, gloves, and related drops.": "可开出武器皮肤、刀具、手套及相关掉落的箱子。",
    "Tournament souvenir packages grouped from the collection database.": "从收藏数据库整理出的赛事纪念品包。",
    "Sticker capsules, autograph capsules, patch capsules, and similar drops.": "贴纸胶囊、签名胶囊、印花胶囊及类似掉落。",
    "Everything that does not cleanly fit the main collection groups.": "所有不适合归入主要分组的其他物品。",
    "Choose a Category": "选择分类",
    "3 options": "3 个选项",
    "Choose a collection": "选择一个系列",
    "No matching collections": "没有匹配的系列",
    "Loading item": "正在加载物品",
    "Loading catalog entries...": "正在加载目录条目...",
    "Text first, images and prices next.": "先显示文本，随后加载图片和价格。",
    "Catalog failed to render. Please refresh once.": "目录渲染失败，请刷新一次。",
    "Loading collection sections...": "正在加载系列分区...",
    "Checking the latest platform price.": "正在检查最新平台价格。",
    "Public market reference": "公开市场参考价",
    "More Containers": "更多容器",
    "Same Category": "同类物品",
    "Checking the selected wear tier price.": "正在检查所选磨损等级价格。",
    "Sticker DIY": "贴纸 DIY",
    "Inventory item details": "库存物品详情",
    "Stickers on this inventory item": "这件库存物品上的贴纸",
    "Related Items": "相关物品",
    "Current": "当前",
    "More": "更多",
    "Machine Guns": "机枪",
    "Analyzing your inventory style...": "正在分析你的库存风格...",
    "Sign in and sync inventory, or save a few favorites to unlock style recommendations.": "登录并同步库存，或先收藏几件物品来解锁风格推荐。",
    "Inventory Upgrade": "库存升级",
    "More Expensive Same-Style Swaps": "更贵的同风格替换",
    "Only recommends a pricier skin in the same category and color family as an item you already own. If no matching upgrade exists, it is skipped.": "只推荐与你已拥有物品同类别、同色系的更高价皮肤；如果没有匹配升级项，就会跳过。",
    "Price data is loading": "价格数据加载中",
    "Recommended knife and glove direction": "推荐的刀具与手套方向",
    "No matching items found in the current price snapshot.": "当前价格快照中没有找到匹配物品。",
    "Describe Your Ideal Setup": "描述你理想的搭配",
    "AI Loadout Chat": "AI 搭配对话",
    "Ask AI": "让 AI 推荐",
    "Clear Chat": "清除对话",
    "AI Recommendation": "AI 搭配推荐",
    "Updating the recommendation...": "正在更新搭配推荐...",
    "Recommended": "相关推荐",
    "Upgrade": "升级",
    "Price data": "价格数据",
    "Another set": "换一组",
    "Refreshing...": "刷新中...",
    "Refresh data": "刷新数据",
    "Premium option": "进阶方案",
    "Low budget requests stay on gun skins first, and vague requests trigger follow-up questions before recommendations.": "低预算需求会优先推荐枪皮，描述过于模糊时会先追问再给建议。",
    "What do you want?": "你想要什么样的搭配？",
    "Example: blue-white, clean, mostly AK + USP, no flashy knives": "示例：蓝白配色、干净风、主要是 AK + USP、不想要花哨刀具",
    "Start with a color, mood, weapon preference, or pro player name.": "可以从颜色、风格、武器偏好或职业选手名字开始描述。",
    "Load More Teams": "加载更多队伍",
    "Reading current market data...": "正在读取当前市场数据...",
    "Most active wear": "最活跃磨损",
    "7d trend": "7 天趋势",
    "AI Case Read": "AI 开箱解读",
    "Calculating expected value and drop profile...": "正在计算期望价值和掉落画像...",
    "AI case read is temporarily unavailable.": "AI 开箱解读暂时不可用。",
    "Expected Value": "期望价值",
    "Synced BUFF reference": "已同步 BUFF 参考价",
    "Local market snapshot": "本地市场快照",
    "Price data is loading.": "价格数据加载中。",
    "Price data was refreshed.": "价格数据已刷新。",
    "BUFF price lookup failed.": "BUFF 价格查询失败。",
    "Open Steam Profile": "打开 Steam 主页",
    "Community Visibility": "社区可见性",
    "Steam binding is saved. Public profile details will appear as soon as they are fetched successfully.": "Steam 绑定已保存，公开资料获取成功后会显示在这里。",
    "Bind a public SteamID64 to show the Steam name, avatar, and synced inventory here.": "绑定公开的 SteamID64 后，这里会显示 Steam 名称、头像和同步库存。",
    "Use the helper browser only for the initial YouPin login. After validation, live prices keep working without leaving that browser open.": "仅首次连接悠悠有品时使用辅助浏览器。验证成功后，无需保持浏览器开启也能继续获取实时价格。",
    "No sticker layout to save yet.": "还没有可保存的贴纸布局。",
    "Saved to Favorites.": "已保存到收藏夹。",
    "This account already exists. Please change the username or sign in.": "该账号已存在，请更换用户名或直接登录。",
    "Username must be at least 3 characters and password at least 6 characters.": "用户名至少 3 个字符，密码至少 6 个字符。",
    "This account does not exist. Please register first.": "该账号不存在，请先注册。",
    "Account service is unavailable. Please try again after starting the local server.": "账号服务不可用，请启动本地服务后重试。",
    "Account created and signed in.": "账号已创建并完成登录。",
    "Signed out.": "已退出登录。",
    "Saving...": "保存中...",
    "Steam binding saved. Use Sync Steam Inventory when you want to refresh inventory.": "Steam 绑定已保存，需要刷新库存时请使用“同步 Steam 库存”。",
    "Steam inventory synced.": "Steam 库存已同步。",
    "BUFF login verified and saved. Item pages will now prefer live BUFF prices without keeping the helper browser open.": "BUFF 登录已验证并保存，饰品页现在会优先显示实时 BUFF 价格，无需保持辅助浏览器开启。",
    "BUFF login is not ready yet.": "BUFF 登录尚未准备好。",
    "BUFF session disconnected.": "BUFF 会话已解绑。",
    "Checking the selected version price.": "正在检查所选版本价格。",
    "Checking the selected special template price.": "正在检查所选特殊模板价格。",
    "Souvenir": "\u7eaa\u5ff5\u54c1",
    "Map collections and standard collections.": "\u5730\u56fe\u6536\u85cf\u54c1\u548c\u5e38\u89c4\u6536\u85cf\u7cfb\u5217\u3002",
    "Map collections and standard item collections.": "\u5730\u56fe\u6536\u85cf\u54c1\u548c\u5e38\u89c4\u9970\u54c1\u6536\u85cf\u7cfb\u5217\u3002",
    "Catalog Toolbar": "\u76ee\u5f55\u5de5\u5177\u680f",
    "Inside": "\u5305\u542b\u5185\u5bb9",
    "Purple": "\u7d2b\u8272",
    "Clean White": "\u7eaf\u51c0\u767d",
    "The password is incorrect. Please fix it and try again.": "\u5bc6\u7801\u4e0d\u6b63\u786e\uff0c\u8bf7\u4fee\u6539\u540e\u91cd\u8bd5\u3002"
  };
  const LOCAL_API_CANDIDATES = detectLocalApiOrigins();
  const LOCAL_API_ORIGIN = LOCAL_API_CANDIDATES[0] || "http://127.0.0.1:4173";
  const CATALOG_DATA_SCRIPT = "catalog-data.js?v=20260630g";
  const ITEM_DATA_VERSION = "20260707a";
  const RELATED_DATA_VERSION = "20260707a";
  const OPENING_DATA_SCRIPT = "catalog-data.js?v=20260707b";
  const OPENING_DATA_JSON = "opening-data.json?v=20260707a";
  const MARKET_PRICES_SCRIPT = ".data/market-prices.js";
  const MARKET_PRICES_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
  const AUTH_SESSION_TOKEN_KEY = "cs2-relic-hall:session-token";
  const AUTH_SESSION_COOKIE_KEY = "cs2_relic_hall_session_token";
  const AUTH_OVERVIEW_SNAPSHOT_KEY = "cs2-relic-hall:auth-overview";
  const LIVE_PRICE_CACHE_KEY = "cs2-relic-hall:live-prices";
  const PRICE_OVERRIDE_CACHE_KEY = "cs2-relic-hall:price-overrides";
  const LOADOUT_CACHE_MAX_TEAMS = 18;
  const PRO_LOADOUT_TEAM_FALLBACKS = [
    {
      team: "The MongolZ",
      sourceUrl: "https://www.hltv.org/team/6248/the-mongolz",
      players: ["bLitz", "Techno", "mzinho", "910", "cobrazera"]
    },
    {
      team: "BIG",
      sourceUrl: "https://www.hltv.org/team/7532/big",
      players: ["tabseN", "JDC", "faveN", "blameF", "gr1ks"]
    },
    {
      team: "Liquid",
      sourceUrl: "https://www.hltv.org/team/5973/liquid",
      players: ["NAF", "EliGE", "malbsMd", "siuhy", "ultimate"]
    },
    {
      team: "G2",
      sourceUrl: "https://www.hltv.org/team/5995/g2",
      players: ["huNter-", "NertZ", "SunPayus", "HeavyGod", "MATYS"]
    }
  ];
  const OPENING_SFX = {
    spin: localPageUrl("assets/opening-spin.wav"),
    land: localPageUrl("assets/opening-land.wav")
  };
  const LAZY_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23131a27'/%3E%3C/svg%3E";

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

  function shouldRetryApiRequest(error) {
    if (!error) return false;
    if (error.status === 404 || error.status === 0) return true;
    return /fetch|network|failed|load failed/i.test(String(error.message || ""));
  }

  function apiRequestCandidates(url) {
    const normalized = String(url || "");
    if (!normalized.startsWith("/api/")) return [normalized];
    const candidates = globalThis.CS2_ENABLE_SAME_ORIGIN_API === true && location.protocol !== "file:" ? [normalized] : [];
    for (const origin of LOCAL_API_CANDIDATES) candidates.push(`${origin}${normalized}`);
    return [...new Set(candidates.filter(Boolean))];
  }

  function localServiceHelpText() {
    return uiText(
      "\u004c\u006f\u0063\u0061\u006c\u0020\u0073\u0065\u0072\u0076\u0069\u0063\u0065\u0020\u0063\u006f\u006e\u006e\u0065\u0063\u0074\u0069\u006f\u006e\u0020\u0066\u0061\u0069\u006c\u0065\u0064\u002e\u0020\u004f\u0070\u0065\u006e\u0020\u0074\u0068\u0069\u0073\u0020\u0073\u0069\u0074\u0065\u0020\u0074\u0068\u0072\u006f\u0075\u0067\u0068\u0020\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0031\u0032\u0037\u002e\u0030\u002e\u0030\u002e\u0031\u003a\u0034\u0031\u0037\u0033\u0020\u0061\u0066\u0074\u0065\u0072\u0020\u0073\u0074\u0061\u0072\u0074\u0069\u006e\u0067\u0020\u006e\u006f\u0064\u0065\u0020\u0073\u0063\u0072\u0069\u0070\u0074\u0073\u002f\u0073\u0065\u0072\u0076\u0065\u002e\u006d\u006a\u0073\u002e",
      "\u672c\u5730\u670d\u52a1\u8fde\u63a5\u5931\u8d25\u3002\u8bf7\u5148\u542f\u52a8\u0020\u006e\u006f\u0064\u0065\u0020\u0073\u0063\u0072\u0069\u0070\u0074\u0073\u002f\u0073\u0065\u0072\u0076\u0065\u002e\u006d\u006a\u0073\u0020\u540e\uff0c\u518d\u901a\u8fc7\u0020\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0031\u0032\u0037\u002e\u0030\u002e\u0030\u002e\u0031\u003a\u0034\u0031\u0037\u0033\u0020\u6253\u5f00\u9875\u9762\u3002"
    );
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

  function proVisualFallbackUrl(label = "", kind = "player") {
    const trimmed = String(label || "").trim();
    const background = kind === "team" ? "101826" : "1d2638";
    const color = kind === "team" ? "f6d48f" : "f5f7fb";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed || (kind === "team" ? "Team" : "Player"))}&size=160&rounded=true&bold=true&background=${background}&color=${color}`;
  }

  function normalizeProIdentity(value = "") {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function fallbackProLoadoutPayload() {
    return {
      ok: true,
      teams: PRO_LOADOUT_TEAM_FALLBACKS.map((team) => ({
        team: team.team,
        logo: proVisualFallbackUrl(team.team, "team"),
        sourceUrl: team.sourceUrl,
        players: (team.players || []).map((name) => ({
          name,
          avatar: proVisualFallbackUrl(name, "player"),
          knife: [],
          gloves: [],
          guns: []
        }))
      }))
    };
  }

  function mergeAiProLoadoutsWithFallback(payload) {
    const fallback = fallbackProLoadoutPayload();
    const primary = sanitizeAiProLoadoutsCache(payload) || { ok: false, teams: [] };
    const fallbackTeams = new Map(fallback.teams.map((team) => [normalizeProIdentity(team.team), team]));
    const teams = (primary.teams || []).map((team) => {
      const fallbackTeam = fallbackTeams.get(normalizeProIdentity(team.team));
      if (!fallbackTeam) return team;
      const shouldPreferFallbackRoster = normalizeProIdentity(team.team) === "g2" || !team.players.length || team.players.every((player) => !String(player?.avatar || "").trim());
      const playerSource = shouldPreferFallbackRoster ? fallbackTeam.players : team.players;
      const mergedPlayers = playerSource.map((player) => {
        const currentPlayer = (team.players || []).find((entry) => normalizeProIdentity(entry?.name) === normalizeProIdentity(player?.name));
        return {
          name: String(currentPlayer?.name || player?.name || ""),
          avatar: String(currentPlayer?.avatar || player?.avatar || "").trim() || proVisualFallbackUrl(currentPlayer?.name || player?.name || "", "player"),
          knife: Array.isArray(currentPlayer?.knife) && currentPlayer.knife.length ? currentPlayer.knife : (Array.isArray(player?.knife) ? player.knife : []),
          gloves: Array.isArray(currentPlayer?.gloves) && currentPlayer.gloves.length ? currentPlayer.gloves : (Array.isArray(player?.gloves) ? player.gloves : []),
          guns: Array.isArray(currentPlayer?.guns) && currentPlayer.guns.length ? currentPlayer.guns : (Array.isArray(player?.guns) ? player.guns : [])
        };
      });
      return {
        ...team,
        logo: String(team.logo || "").trim() || fallbackTeam.logo,
        sourceUrl: String(team.sourceUrl || "").trim() || fallbackTeam.sourceUrl,
        players: mergedPlayers
      };
    });
    fallback.teams.forEach((fallbackTeam) => {
      if (teams.some((team) => normalizeProIdentity(team.team) === normalizeProIdentity(fallbackTeam.team))) return;
      teams.push(fallbackTeam);
    });
    return {
      ok: primary.ok !== false,
      teams: teams.slice(0, LOADOUT_CACHE_MAX_TEAMS)
    };
  }

  function proImageMarkup({ url = "", label = "", className = "", fallbackText = "", kind = "player" } = {}) {
    const safeUrl = String(url || "").trim() || proVisualFallbackUrl(label, kind);
    const safeFallbackText = String(fallbackText || "").trim() || "?";
    return `
      <span class="${escapeHtml(className)} has-image" aria-hidden="true">
        ${lazyImageMarkup({ src: safeUrl, alt: "", loading: "lazy", onerror: "this.parentElement.classList.remove('has-image');this.remove()" })}
        <span>${escapeHtml(safeFallbackText)}</span>
      </span>
    `;
  }

  function lazyImageMarkup({ className = "", src = "", alt = "", loading = "lazy", decoding = "async", fetchpriority = "low", sizes = "", onerror = "" } = {}) {
    const normalizedSrc = String(src || "").trim();
    if (!normalizedSrc) return "";
    const normalizedLoading = String(loading || "lazy").trim() || "lazy";
    const normalizedDecoding = String(decoding || "async").trim();
    const normalizedFetchPriority = String(fetchpriority || "").trim();
    const normalizedSizes = String(sizes || "").trim();
    const normalizedOnError = String(onerror || "").trim();
    const shouldDefer = normalizedLoading !== "eager" && /^https?:\/\//i.test(normalizedSrc);
    const attributes = [
      className ? `class="${escapeHtml(className)}"` : "",
      `alt="${escapeHtml(alt)}"`,
      `loading="${escapeHtml(normalizedLoading)}"`,
      normalizedDecoding ? `decoding="${escapeHtml(normalizedDecoding)}"` : "",
      normalizedFetchPriority ? `fetchpriority="${escapeHtml(normalizedFetchPriority)}"` : "",
      normalizedSizes ? `sizes="${escapeHtml(normalizedSizes)}"` : "",
      normalizedOnError ? `onerror="${escapeHtml(normalizedOnError)}"` : ""
    ].filter(Boolean);
    if (shouldDefer) {
      attributes.push(`src="${LAZY_IMAGE_PLACEHOLDER}"`, `data-src="${escapeHtml(normalizedSrc)}"`, 'data-lazy-image="pending"');
    } else {
      attributes.push(`src="${escapeHtml(normalizedSrc)}"`);
    }
    return `<img ${attributes.join(" ")} />`;
  }

  function loadLazyImage(node) {
    if (!(node instanceof HTMLImageElement)) return;
    const nextSrc = String(node.dataset.src || "").trim();
    if (!nextSrc) return;
    node.src = nextSrc;
    node.removeAttribute("data-src");
    node.dataset.lazyImage = "loaded";
  }

  function observeLazyImagesIn(root = document) {
    const images = root instanceof Element || root instanceof Document ? root.querySelectorAll('img[data-lazy-image="pending"]') : [];
    images.forEach((node) => {
      if (!(node instanceof HTMLImageElement)) return;
      if (!appState.lazyImageObserver) {
        loadLazyImage(node);
        return;
      }
      appState.lazyImageObserver.observe(node);
    });
  }

  function initLazyImageLoading() {
    if (appState.lazyImageObserverInitialized) return;
    appState.lazyImageObserverInitialized = true;
    if ("IntersectionObserver" in window) {
      appState.lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadLazyImage(entry.target);
          appState.lazyImageObserver?.unobserve(entry.target);
        });
      }, { rootMargin: "300px 0px" });
    }
    if ("MutationObserver" in window) {
      appState.lazyImageMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches?.('img[data-lazy-image="pending"]')) {
              observeLazyImagesIn(node.parentElement || document);
              return;
            }
            observeLazyImagesIn(node);
          });
        });
      });
      appState.lazyImageMutationObserver.observe(document.body, { childList: true, subtree: true });
    }
    observeLazyImagesIn(document);
  }

  function saveAuthSessionToken(token) {
    if (!token) return;
    localStorage.setItem(AUTH_SESSION_TOKEN_KEY, token);
    document.cookie = `${AUTH_SESSION_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=1209600`; 
  }

  function clearAuthSessionToken() {
    localStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
    document.cookie = `${AUTH_SESSION_COOKIE_KEY}=; Path=/; SameSite=Lax; Max-Age=0`; 
  }

  function readAuthSessionTokenFromCookie() {
    const entry = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${AUTH_SESSION_COOKIE_KEY}=`));
    return entry ? decodeURIComponent(entry.slice(AUTH_SESSION_COOKIE_KEY.length + 1)) : "";
  }

  function readAuthSessionToken() {
    const sessionToken = localStorage.getItem(AUTH_SESSION_TOKEN_KEY) || readAuthSessionTokenFromCookie();
    if (sessionToken && !localStorage.getItem(AUTH_SESSION_TOKEN_KEY)) {
      localStorage.setItem(AUTH_SESSION_TOKEN_KEY, sessionToken);
    }
    return sessionToken;
  }
  function saveAuthOverviewSnapshot(user, overview = {}) {
    if (!user) return;
    const snapshot = {
      authenticated: true,
      user,
      inventory: overview.inventory || emptyInventoryPreview(),
      steamKeyStatus: overview.steamKeyStatus || { configured: false },
      steamProfile: overview.steamProfile || (user.steamProfile ? { ok: true, profile: user.steamProfile } : null),
      syncStatus: overview.syncStatus || null,
      buffStatus: overview.buffStatus || null,
      youpinStatus: overview.youpinStatus || null
    };
    localStorage.setItem(AUTH_OVERVIEW_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }
  function clearAuthOverviewSnapshot() {
    localStorage.removeItem(AUTH_OVERVIEW_SNAPSHOT_KEY);
  }
  function restoreAuthOverviewSnapshot() {
    const sessionToken = readAuthSessionToken();
    if (!sessionToken) return false;
    const raw = localStorage.getItem(AUTH_OVERVIEW_SNAPSHOT_KEY);
    if (!raw) return false;
    try {
      const snapshot = JSON.parse(raw);
      if (!snapshot?.authenticated || !snapshot.user) return false;
      applyAccountOverview(snapshot, { clearToken: false, keepFeedback: true });
      appState.authLoaded = true;
      appState.authStatus = "authenticated";
      return true;
    } catch {
      clearAuthOverviewSnapshot();
      return false;
    }
  }

  function emptyInventoryPreview() {
    return { ok: true, count: 0, syncedAt: null, items: [] };
  }

  function resetInventorySortCache() {
    appState.inventorySortCache = { source: null, language: "", sorted: [] };
  }

  function resetInventoryRenderCount() {
    appState.inventoryRenderedCount = INVENTORY_PAGE_SIZE;
  }

  function clearLivePriceCache() {
    appState.livePrices = {};
    appState.livePriceRequests = {};
    persistPriceCaches();
  }

  function platformStatusCacheKey(status) {
    if (!status) return "";
    return JSON.stringify({
      status: String(status.status || ""),
      connected: Boolean(status.connected),
      lastValidatedAt: String(status.lastValidatedAt || "")
    });
  }

  function resetProLoadoutTeamRenderCount() {
    appState.aiProTeamsRenderedCount = PRO_LOADOUT_TEAM_PAGE_SIZE;
  }

  function resetAccountCaches() {
    appState.inventoryPreview = null;
    appState.steamKeyStatus = null;
    appState.steamProfile = null;
    appState.steamProfileMeta = null;
    appState.buffStatus = null;
    appState.youpinStatus = null;
    clearLivePriceCache();
    resetInventorySortCache();
    resetInventoryRenderCount();
  }

  function profileMatchesSteam(profile, steamId) {
    const expected = String(steamId || "").trim();
    if (!profile || !expected) return false;
    return String(profile.steamId || "").trim() === expected;
  }

  function steamProfileFallback(steamId) {
    const id = String(steamId || "").trim();
    return id ? { steamId: id, personaName: "", profileUrl: `https://steamcommunity.com/profiles/${id}`, avatar: "", visibility: "" } : null;
  }

  function pickSteamProfileForUser(user, ...profiles) {
    const steamId = String(user?.steamId || "").trim();
    if (!steamId) return null;
    return profiles.find((profile) => profileMatchesSteam(profile, steamId)) || steamProfileFallback(steamId);
  }

  function steamAvatarUrl(profile, steamId) {
    const avatar = String(profile?.avatar || "").trim();
    const id = String(steamId || profile?.steamId || "").trim();
    if (!avatar) return "";
    try {
      const url = new URL(avatar, location.href);
      if (id) url.searchParams.set("steam", id);
      return url.toString();
    } catch {
      const separator = avatar.includes("?") ? "&" : "?";
      return id ? `${avatar}${separator}steam=${encodeURIComponent(id)}` : avatar;
    }
  }

  function applyAccountOverview(overview, options = {}) {
    const keepFeedback = Boolean(options.keepFeedback);
    const user = overview?.authenticated ? (overview.user || null) : null;
    const previousBuffStatusKey = platformStatusCacheKey(appState.buffStatus);
    const previousYoupinStatusKey = platformStatusCacheKey(appState.youpinStatus);
    appState.session = user;
    appState.syncStatus = overview?.syncStatus || null;
    appState.buffStatus = overview?.buffStatus || null;
    appState.youpinStatus = overview?.youpinStatus || null;
    const nextBuffStatusKey = platformStatusCacheKey(appState.buffStatus);
    const nextYoupinStatusKey = platformStatusCacheKey(appState.youpinStatus);
    if (previousBuffStatusKey !== nextBuffStatusKey || previousYoupinStatusKey !== nextYoupinStatusKey) clearLivePriceCache();
    if (user) {
      appState.inventoryPreview = overview?.inventory || emptyInventoryPreview();
      appState.steamKeyStatus = overview?.steamKeyStatus || { configured: false };
      appState.steamProfileMeta = overview?.steamProfile || null;
      appState.steamProfile = pickSteamProfileForUser(user, overview?.steamProfile?.profile, user.steamProfile, appState.steamProfile);
      saveAuthOverviewSnapshot(user, overview);
      appState.authStatus = "authenticated";
    } else {
      resetAccountCaches();
      if (options.clearToken) clearAuthSessionToken();
      clearAuthOverviewSnapshot();
      appState.authStatus = "anonymous";
      appState.suppressAuthAutofillUntil = Date.now() + 2500;
      if (!keepFeedback) appState.accountMessage = "";
    }
    if (!keepFeedback) appState.accountError = "";
    resetInventorySortCache();
    resetInventoryRenderCount();
  }

  function applyAuthenticatedUser(user, options = {}) {
    const keepFeedback = Boolean(options.keepFeedback);
    if (!user) return;
    appState.session = user;
    appState.authLoaded = true;
    appState.authStatus = "authenticated";
    appState.inventoryPreview = appState.inventoryPreview || emptyInventoryPreview();
    appState.steamProfile = pickSteamProfileForUser(user, user.steamProfile, appState.steamProfile);
    saveAuthOverviewSnapshot(user, {
      inventory: appState.inventoryPreview,
      steamKeyStatus: appState.steamKeyStatus,
      steamProfile: appState.steamProfileMeta || (user.steamProfile ? { ok: true, profile: user.steamProfile } : null),
      syncStatus: appState.syncStatus,
      buffStatus: appState.buffStatus,
      youpinStatus: appState.youpinStatus
    });
    if (!keepFeedback) appState.accountError = "";
  }

  function applyLoggedOutState(options = {}) {
    const keepFeedback = Boolean(options.keepFeedback);
    const clearToken = options.clearToken !== false;
    if (clearToken) clearAuthSessionToken();
    clearAuthOverviewSnapshot();
    appState.session = null;
    appState.authLoaded = true;
    appState.authStatus = "anonymous";
    appState.suppressAuthAutofillUntil = Date.now() + 2500;
    appState.syncStatus = appState.syncStatus || null;
    resetAccountCaches();
    if (!keepFeedback) {
      appState.accountError = "";
      appState.accountMessage = "";
    }
  }

  async function refreshAccountSurfaces(options = {}) {
    await ensureAccountData(true, options);
    renderAccount();
    renderInventory();
  }

  function scheduleAccountRefresh(options = {}) {
    return refreshAccountSurfaces(options).catch(() => {
      renderAccount();
      renderInventory();
    });
  }

  function consumeAccountRedirectFeedback() {
    if (pageName() !== "account.html") return;
    const params = new URLSearchParams(location.search);
    const reason = String(params.get("reason") || "").trim();
    if (!reason || appState.session) return;
    if (reason === "favorite-login") {
      appState.accountMessage = uiText("Please sign in first.", "请先登录。");
      appState.accountError = "";
    }
  }

  function setAccountBusyAction(action = "") {
    appState.accountBusyAction = action;
  }

  function pageName() {
    return location.pathname.split(/[\\/]/).pop() || "index.html";
  }

  function localizedTerm(entry, fallbackEn, fallbackZh) {
    const lang = currentLanguage();
    if (lang === "en") return fallbackEn;
    if (entry?.[lang]) return entry[lang];
    const short = lang.split("-")[0];
    const matched = Object.entries(entry || {}).find(([key]) => key.split("-")[0] === short);
    if (matched) return matched[1];
    if (lang === "zh-CN") return fallbackZh;
    return fallbackEn;
  }

  function currentLanguage() {
    return globalThis.getCurrentLanguage?.() || "zh-CN";
  }

  function isEnglish() {
    return currentLanguage() === "en";
  }

  function uiText(en, zh) {
    if (currentLanguage() === "zh-CN") {
      if (ZH_CN_UI_OVERRIDES[en]) return ZH_CN_UI_OVERRIDES[en];
      const translated = runtimeUiText?.(en, zh);
      if (translated && translated !== en && !looksLikeMojibake(translated)) return translated;
      const fallback = String(zh || "");
      return looksLikeMojibake(fallback) ? en : (fallback || en);
    }
    const translated = runtimeUiText?.(en, zh);
    if (translated && translated !== en && !looksLikeMojibake(translated)) return translated;
    return translated || en;
  }

  function looksLikeMojibake(value) {
    const mojibakeCodePoints = new Set([0x20ac, 0xfffd, 0xe749, 0xe100, 0xe1c0, 0xe21a, 0xe21b, 0xe21c, 0xfe40]);
    return Array.from(String(value || "")).some((char) => mojibakeCodePoints.has(char.codePointAt(0)));
  }

  function uiTemplate(en, values) {
    if (runtimeUiTemplate) return runtimeUiTemplate(en, values);
    return uiText(en, en).replace(/\{(\w+)\}/g, (_, key) => values?.[key] ?? "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeEnglishName(value) {
    return String(value || "")
      .replace(/^\u2605\s*/u, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(value) {
    return normalizeEnglishName(value)
      .toLowerCase()
      .replace(/[()\\[\\]'".,!?:]/g, "")
      .replace(/\s*\|\s*/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function firstNonEmpty(...values) {
    return values.find((value) => String(value || "").trim()) || "";
  }

  function steamInventoryIconUrl(entry) {
    const direct = String(entry?.icon_url || entry?.iconUrl || "").trim();
    if (!direct) return "";
    const normalized = /^https?:\/\//i.test(direct)
      ? direct
      : `https://community.akamai.steamstatic.com/economy/image/${direct}`;
    return normalized.includes("steamstatic.com/economy/image/") && !/[?&]imw=/.test(normalized)
      ? `${normalized}${normalized.includes("?") ? "&" : "?"}imw=256&imh=256&ima=fit`
      : normalized;
  }

  const INVENTORY_VALUE_I18N = {
    "手枪": { en: "Pistol", zh: "手枪" },
    "步枪": { en: "Rifle", zh: "步枪" },
    "鍐查攱鏋?": { en: "SMG", zh: "鍐查攱鏋?" },
    "闇板脊鏋?": { en: "Shotgun", zh: "闇板脊鏋?" },
    "机枪": { en: "Machine Gun", zh: "机枪" },
    "狙击步枪": { en: "Sniper Rifle", zh: "狙击步枪" },
    "?": { en: "Knife", zh: "?" },
    "手套": { en: "Glove", zh: "手套" },
    "探员": { en: "Agent", zh: "探员" },
    "闊充箰鐩?": { en: "Music Kit", zh: "闊充箰鐩?" },
    "贴纸": { en: "Sticker", zh: "贴纸" },
    "鑳跺泭": { en: "Capsule", zh: "鑳跺泭" },
    "姝﹀櫒绠?": { en: "Weapon Case", zh: "姝﹀櫒绠?" },
    "鏀惰棌鍝?": { en: "Collectible", zh: "鏀惰棌鍝?" },
    "工具": { en: "Tool", zh: "工具" },
    "涂鸦": { en: "Graffiti", zh: "涂鸦" },
    "\u666e\u901a\u7ea7": { en: "Base Grade", zh: "\u666e\u901a\u7ea7" },
    "宸ヤ笟绾?": { en: "Industrial Grade", zh: "宸ヤ笟绾?" },
    "\u519b\u89c4\u7ea7": { en: "Mil-Spec Grade", zh: "\u519b\u89c4\u7ea7" },
    "受限": { en: "Restricted", zh: "受限" },
    "保密": { en: "Classified", zh: "保密" },
    "隐秘": { en: "Covert", zh: "隐秘" },
    "非凡": { en: "Extraordinary", zh: "非凡" },
    "违禁": { en: "Contraband", zh: "违禁" }
  };
  const INVENTORY_LOWER_LOOKUP = Object.fromEntries(
    Object.entries(INVENTORY_VALUE_I18N).flatMap(([key, value]) => [
      [key.toLowerCase(), value],
      [String(value.en || "").toLowerCase(), value],
      [String(value.zh || "").toLowerCase(), value]
    ])
  );
  const INVENTORY_BOTTOM_KEYWORDS = ["capsule", "鑳跺泭", "collectible", "鏀惰棌鍝?", "weapon case", "姝﹀櫒绠?", "tool", "工具", "graffiti", "涂鸦"];
  function inventoryDisplayName(entry) {
    return currentLanguage() === "en"
      ? firstNonEmpty(entry?.market_hash_name, entry?.marketHashName, entry?.item_name, entry?.itemName, uiText("Steam Item", "Steam 物品"))
      : firstNonEmpty(entry?.item_name, entry?.itemName, entry?.market_hash_name, entry?.marketHashName, uiText("Steam Item", "Steam 物品"));
  }

  function marketPriceNameKey(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function snapshotPriceFromRecord(record) {
    const values = Object.values(record?.prices || {})
      .map((entry) => Number(entry?.price))
      .filter((price) => Number.isFinite(price) && price > 0);
    return values.length ? Math.min(...values) : 0;
  }

  function marketPriceSnapshotIndex() {
    if (marketPriceSnapshotIndex.source === globalThis.CS2_MARKET_PRICES && marketPriceSnapshotIndex.index instanceof Map) {
      return marketPriceSnapshotIndex.index;
    }
    const index = new Map();
    Object.values(globalThis.CS2_MARKET_PRICES?.items || {}).forEach((record) => {
      const recordPrice = snapshotPriceFromRecord(record);
      if (!recordPrice) return;
      [record?.name, record?.nameEn, record?.nameZh].forEach((name) => {
        const key = marketPriceNameKey(name);
        if (key && !index.has(key)) index.set(key, recordPrice);
      });
      Object.values(record?.prices || {}).forEach((priceRecord) => {
        const key = marketPriceNameKey(priceRecord?.marketHashName);
        const price = Number(priceRecord?.price);
        if (key && Number.isFinite(price) && price > 0 && !index.has(key)) index.set(key, price);
      });
    });
    marketPriceSnapshotIndex.source = globalThis.CS2_MARKET_PRICES;
    marketPriceSnapshotIndex.index = index;
    return index;
  }

  function snapshotPriceByMarketNames(...names) {
    const index = marketPriceSnapshotIndex();
    for (const name of names.flat().filter(Boolean)) {
      const price = index.get(marketPriceNameKey(name));
      if (Number.isFinite(Number(price)) && Number(price) > 0) return Number(price);
    }
    return 0;
  }

  function inventoryDirectMarketPrice(entry) {
    return snapshotPriceByMarketNames(
      entry?.market_hash_name,
      entry?.marketHashName,
      entry?.item_name,
      entry?.itemName
    );
  }

  function queueInventoryMarketPricesLoad() {
    if (appState.inventoryMarketPricesRequested || globalThis.CS2_MARKET_PRICES?.items) return;
    appState.inventoryMarketPricesRequested = true;
    void loadMarketPricesSnapshot().then(() => {
      if (pageName() === "inventory.html" || pageName() === "account.html") {
        renderInventory();
        renderAccount();
      }
    }).catch(() => {}).finally(() => {
      appState.inventoryMarketPricesRequested = false;
    });
  }

  function inventoryAllowsCatalogPriceFallback(entry, inspectItem) {
    if (!inspectItem) return false;
    const text = inventoryEntryText(entry);
    if (/collectible|coin|badge|medal|pass|pin|graffiti|spray|tool|capsule|case|package|container/i.test(text)) return false;
    return inventoryLooksLikeWeapon(entry, inspectItem, text) || ["knife", "glove", "sticker", "agent", "music-box"].includes(inspectItem.type);
  }

  function inventoryReferencePrice(entry) {
    const directPrice = inventoryDirectMarketPrice(entry);
    if (directPrice) return directPrice;
    return 0;
  }

  function translateInventoryValue(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const mapped = INVENTORY_LOWER_LOOKUP[text.toLowerCase()];
    if (mapped) return currentLanguage() === "en" ? mapped.en : mapped.zh;
    return text;
  }

  function inventoryTypeLabel(entry) {
    return translateInventoryValue(entry?.item_type || entry?.itemType);
  }

  function inventoryRarityLabel(entry) {
    return translateInventoryValue(entry?.rarity);
  }

  function inventoryExteriorLabel(entry) {
    return translateInventoryValue(entry?.exterior);
  }

  function inventorySecondaryMeta(entry) {
    return firstNonEmpty(
      currentLanguage() === "en" ? firstNonEmpty(entry?.collection_name, entry?.collectionName) : translateInventoryValue(entry?.collection_name || entry?.collectionName),
      inventoryTypeLabel(entry),
      inventoryExteriorLabel(entry),
      uiText("Steam Inventory", "Steam 库存")
    );
  }

  function inventoryBadges(entry) {
    return [
      inventoryRarityLabel(entry),
      inventoryTypeLabel(entry),
      inventoryExteriorLabel(entry)
    ].filter(Boolean);
  }

  function inventoryRarityRank(entry) {
    const text = [entry?.rarity, inventoryRarityLabel(entry), entry?.market_hash_name, entry?.marketHashName, entry?.item_name, entry?.itemName].filter(Boolean).join(" ");
    if (/Contraband|违禁/i.test(text)) return 110;
    if (/Covert|\u9690\u79d8/i.test(text)) return 100;
    if (/Covert|\u9690\u79d8/i.test(text)) return 100;
    if (/Extraordinary|闈炲嚒/i.test(text)) return 95;
    if (/Classified|淇濆瘑/i.test(text)) return 90;
    if (/Mil-Spec|\u519b\u89c4/i.test(text)) return 70;
    if (/Mil-Spec|\u519b\u89c4/i.test(text)) return 70;
    if (/Industrial|宸ヤ笟/i.test(text)) return 60;
    if (/Consumer|娑堣垂/i.test(text)) return 50;
    if (/Remarkable|鍗撹秺/i.test(text)) return 40;
    if (/Base Grade|\u666e\u901a\u7ea7|Standard/i.test(text)) return 20;
    if (/Base Grade|\u666e\u901a\u7ea7|Standard/i.test(text)) return 20;
    return 0;
  }

  function inventoryEntryText(entry) {
    return [entry?.item_type, entry?.itemType, entry?.market_hash_name, entry?.item_name, entry?.marketHashName, entry?.itemName].filter(Boolean).join(" ").toLowerCase();
  }

  function inventoryLooksLikeWeapon(entry, resolved, text = inventoryEntryText(entry)) {
    if (resolved && ["pistol", "rifle", "smg", "shotgun", "machinegun"].includes(resolved.type)) return true;
    return /ak-47|m4a1|m4a4|awp|usp-s|glock-18|desert eagle|deagle|p250|five-seven|tec-9|cz75|dual berettas|r8 revolver|galil ar|famas|sg 553|aug|ssg 08|scar-20|g3sg1|mac-10|mp9|mp7|mp5-sd|ump-45|p90|pp-bizon|nova|xm1014|mag-7|sawed-off|negev|m249|pistol|rifle|smg|shotgun|machine gun|machinegun|gun|weapon|\u624b\u67aa|\u6b65\u67aa|\u51b2\u950b\u67aa|\u9730\u5f39\u67aa|\u673a\u67aa|\u72d9\u51fb\u6b65\u67aa|\u6b66\u5668/i.test(text);
  }

  function inventoryStickers(entry) {
    return (Array.isArray(entry?.stickers) ? entry.stickers : [])
      .map((sticker) => ({
        name: String(sticker?.name || "").trim(),
        image: String(sticker?.image || "").trim()
      }))
      .filter((sticker) => sticker.name)
      .slice(0, 5);
  }

  function inventoryVariantFromEntry(entry) {
    const text = [entry?.market_hash_name, entry?.marketHashName, entry?.item_name, entry?.itemName].filter(Boolean).join(" ");
    if (/souvenir/i.test(text)) return "souvenir";
    if (/souvenir/i.test(text)) return "souvenir";
    return "standard";
  }

  function inventoryWearIdFromValue(value, item = null) {
    const text = String(value || "").trim().toLowerCase();
    if (/factory new|\u5d2d\u65b0\u51fa\u5382/.test(text)) return "factory-new";
    if (/factory new|\u5d2d\u65b0\u51fa\u5382/.test(text)) return "factory-new";
    if (/minimal wear|鐣ユ湁纾ㄦ崯/.test(text)) return "minimal-wear";
    if (/field-tested|field tested|涔呯粡娌欏満/.test(text)) return "field-tested";
    if (/battle-scarred|battle scarred|\u6218\u75d5\u7d2f\u7d2f/.test(text)) return "battle-scarred";
    if (/battle-scarred|battle scarred|\u6218\u75d5\u7d2f\u7d2f/.test(text)) return "battle-scarred";
    const wearId = text.replace(/\s+/g, "-");
    return wearOptions(item).includes(wearId) ? wearId : "";
  }

  function inventoryWearFromEntry(entry, item = null) {
    return (
      inventoryWearIdFromValue(entry?.exterior, item) ||
      inventoryWearIdFromValue(entry?.market_hash_name, item) ||
      inventoryWearIdFromValue(entry?.marketHashName, item) ||
      ""
    );
  }

  function inventoryInstanceQuality(entry) {
    return firstNonEmpty(inventoryRarityLabel(entry), translateInventoryValue(entry?.rarity));
  }

  function parseInventoryStickerParam(value) {
    if (!String(value || "").trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return (Array.isArray(parsed) ? parsed : [])
        .map((entry) => ({ name: String(entry?.name || "").trim(), image: String(entry?.image || "").trim() }))
        .filter((entry) => entry.name)
        .slice(0, 8);
    } catch {
      return [];
    }
  }

  function inventoryInspectHref(entry, item) {
    const params = new URLSearchParams();
    const assetId = String(entry?.asset_id || entry?.assetId || "").trim();
    const wearId = inventoryWearFromEntry(entry, item);
    const variantId = inventoryVariantFromEntry(entry);
    const qualityText = inventoryInstanceQuality(entry);
    const exteriorText = inventoryExteriorLabel(entry);
    const stickers = inventoryStickers(entry);
    if (assetId) params.set("asset", assetId);
    if (wearId) params.set("wear", wearId);
    if (!item || variantId !== "standard" || globalThis.CS2_CATALOG?.length) {
      if (variantOptions(item).includes(variantId)) params.set("variant", variantId);
    }
    if (qualityText) params.set("quality", qualityText);
    if (exteriorText) params.set("exterior", exteriorText);
    if (stickers.length) params.set("stickers", JSON.stringify(stickers));
    const href = itemHref(item);
    const query = params.toString();
    if (!query) return href;
    return `${href}${href.includes("?") ? "&" : "?"}${query}`;
  }

  function inventorySortGroup(entry) {
    const resolved = inventoryInspectorTarget(entry);
    const resolvedType = resolved?.type || "";
    const text = inventoryEntryText(entry);
    if (resolvedType === "knife" || /knife|bayonet|daggers|karambit|shadow daggers|huntsman|falchion|bowie|butterfly|navaja|ursus|talon|stiletto|skeleton|nomad|paracord|survival|kukri/i.test(text)) return 0;
    if (resolvedType === "glove" || /glove|hand wraps|moto gloves|driver gloves|specialist gloves|sport gloves|bloodhound gloves|hydra gloves|broken fang gloves|\u624b\u5957/i.test(text)) return 1;
    if (resolvedType === "glove" || /glove|hand wraps|moto gloves|driver gloves|specialist gloves|sport gloves|bloodhound gloves|hydra gloves|broken fang gloves|\u624b\u5957/i.test(text)) return 1;
    if (resolvedType === "music-box" || /music kit/i.test(text)) return 3;
    if (resolvedType === "agent" || /agent/i.test(text)) return 4;
    if (resolvedType === "sticker" || /sticker|patch/i.test(text)) return 5;
    if (/collectible|capsule/i.test(text)) return 6;
    if (/weapon case|case/i.test(text)) return 7;
    if (resolvedType === "equipment" || /equipment|tool|graffiti|spray|\u88c5\u5907|\u5de5\u5177|\u6d82\u9e26|\u55b7\u6f06/i.test(text)) return 8;
    if (resolvedType === "equipment" || /equipment|tool|graffiti|spray|\u88c5\u5907|\u5de5\u5177|\u6d82\u9e26|\u55b7\u6f06/i.test(text)) return 8;
    return 8;
  }

  function sortInventoryEntries(entries) {
    return [...(Array.isArray(entries) ? entries : [])].sort((left, right) => {
      const groupDelta = inventorySortGroup(left) - inventorySortGroup(right);
      if (groupDelta) return groupDelta;
      const rarityDelta = inventoryRarityRank(right) - inventoryRarityRank(left);
      if (rarityDelta) return rarityDelta;
      return inventoryDisplayName(left).localeCompare(inventoryDisplayName(right), currentLanguage());
    });
  }

  function getSortedInventoryEntries() {
    const entries = Array.isArray(appState.inventoryPreview?.items) ? appState.inventoryPreview.items : [];
    const language = currentLanguage();
    if (appState.inventorySortCache.source === entries && appState.inventorySortCache.language === language) {
      return appState.inventorySortCache.sorted;
    }
    const sorted = sortInventoryEntries(entries);
    appState.inventorySortCache = { source: entries, language, sorted };
    return sorted;
  }

  function getAccountPreviewInventoryEntries(limit = 8) {
    const entries = Array.isArray(appState.inventoryPreview?.items) ? appState.inventoryPreview.items : [];
    const safeLimit = Math.max(0, Number(limit) || 0);
    if (!entries.length || !safeLimit) return [];
    const language = currentLanguage();
    if (appState.inventorySortCache.source === entries && appState.inventorySortCache.language === language) {
      return appState.inventorySortCache.sorted.slice(0, safeLimit);
    }
    return entries.slice(0, safeLimit);
  }

  function getVisibleInventoryEntries() {
    const entries = getSortedInventoryEntries();
    const visibleCount = Math.max(INVENTORY_PAGE_SIZE, Number(appState.inventoryRenderedCount) || INVENTORY_PAGE_SIZE);
    return entries.slice(0, visibleCount);
  }

  function inventoryCardMarkup(entry) {
    const name = inventoryDisplayName(entry);
    const badges = inventoryBadges(entry);
    const inspectItem = inventoryInspectorTarget(entry);
    const inspectHref = inspectItem ? inventoryInspectHref(entry, inspectItem) : "";
    const stickers = inventoryStickers(entry);
    const value = inventoryReferencePrice(entry);
    const valueMarkup = Number.isFinite(Number(value)) && Number(value) > 0
      ? `<div class="inventory-value">${escapeHtml(uiText("Reference", "参考价"))} 路 ${escapeHtml(formatPrice(value))}</div>`
      : `<div class="inventory-value inventory-value-pending">${escapeHtml(uiText("Pricing loading...", "价格加载中..."))}</div>`;
    const cardBody = `
        ${steamInventoryIconUrl(entry) ? lazyImageMarkup({ src: steamInventoryIconUrl(entry), alt: name, loading: "lazy", decoding: "async", fetchpriority: "low" }) : ""}
        <div class="inventory-copy">
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(inventorySecondaryMeta(entry))}</small>
          ${valueMarkup}
          ${badges.length ? `<div class="inventory-tags">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>` : ""}
          ${stickers.length ? `<div class="inventory-stickers"><span>${escapeHtml(uiText("Stickers", "贴纸"))}</span>${stickers.map((sticker) => `<em>${escapeHtml(sticker.name)}</em>`).join("")}</div>` : ""}
          ${inspectHref ? `<div class="inventory-actions"><span>${escapeHtml(uiText("Click anywhere on the card to inspect", "点击卡片任意位置即可检视"))}</span><a href="${escapeHtml(inspectHref)}" data-inventory-inspect="${escapeHtml(inspectHref)}">${escapeHtml(uiText("Open Inspector", "打开检视器"))}</a></div>` : ""}
        </div>`;
    if (inspectHref) {
      return `<article class="inventory-item inventory-item-clickable" data-href="${escapeHtml(inspectHref)}" tabindex="0" role="link" aria-label="${escapeHtml(uiTemplate("Inspect {name}", { name }))}">${cardBody}</article>`;
    }
    return `<article class="inventory-item">${cardBody}</article>`;
  }

  function fallbackInventoryCardMarkup(entry) {
    const name = inventoryDisplayName(entry);
    const iconUrl = steamInventoryIconUrl(entry);
    return `
      <article class="inventory-item">
        ${iconUrl ? lazyImageMarkup({ src: iconUrl, alt: name, loading: "lazy", decoding: "async", fetchpriority: "low" }) : ""}
        <div class="inventory-copy">
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(inventorySecondaryMeta(entry) || uiText("Steam Inventory", "Steam 库存"))}</small>
        </div>
      </article>
    `;
  }

  function safeInventoryCardMarkup(entry) {
    try {
      return inventoryCardMarkup(entry);
    } catch (error) {
      console.error("Inventory card render failed", error, entry);
      return fallbackInventoryCardMarkup(entry);
    }
  }

  function readLocalJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeLocalJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUserState() {
    const parsed = readLocalJson(STATE_KEY, {});
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      compare: Array.isArray(parsed.compare) ? parsed.compare : []
    };
  }

  function setUserState(next) {
    writeLocalJson(STATE_KEY, next);
  }

  function getDiyDesigns() {
    const parsed = readLocalJson(DIY_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function setDiyDesigns(designs) {
    writeLocalJson(DIY_KEY, designs);
  }

  function getInspectorState() {
    const parsed = readLocalJson(INSPECTOR_STATE_KEY, {});
    return {
      itemId: String(parsed.itemId || ""),
      wearByItem: parsed.wearByItem && typeof parsed.wearByItem === "object" ? parsed.wearByItem : {},
      variantByItem: parsed.variantByItem && typeof parsed.variantByItem === "object" ? parsed.variantByItem : {},
      templateByItem: parsed.templateByItem && typeof parsed.templateByItem === "object" ? parsed.templateByItem : {}
    };
  }

  function setInspectorState(next) {
    writeLocalJson(INSPECTOR_STATE_KEY, {
      itemId: String(next?.itemId || ""),
      wearByItem: next?.wearByItem && typeof next.wearByItem === "object" ? next.wearByItem : {},
      variantByItem: next?.variantByItem && typeof next.variantByItem === "object" ? next.variantByItem : {},
      templateByItem: next?.templateByItem && typeof next.templateByItem === "object" ? next.templateByItem : {}
    });
  }

  function sanitizeOpeningResult(entry) {
    if (!entry || typeof entry !== "object") return null;
    return {
      id: String(entry.id || ""),
      name: String(entry.name || ""),
      nameEn: String(entry.nameEn || ""),
      nameZh: String(entry.nameZh || ""),
      rarity: String(entry.rarity || ""),
      rarityEn: String(entry.rarityEn || ""),
      rarityZh: String(entry.rarityZh || ""),
      rarityColor: String(entry.rarityColor || ""),
      image: String(entry.image || ""),
      isRareSpecial: Boolean(entry.isRareSpecial),
      variantId: String(entry.variantId || ""),
      displayName: String(entry.displayName || entry.nameZh || entry.nameEn || entry.name || entry.id || ""),
      displayRarity: String(entry.displayRarity || entry.rarityZh || entry.rarityEn || entry.rarity || ""),
      displayPrice: Number.isFinite(Number(entry.displayPrice)) ? Number(entry.displayPrice) : null,
      wearId: String(entry.wearId || ""),
      floatValue: Number.isFinite(Number(entry.floatValue)) ? Number(entry.floatValue) : null,
      href: String(entry.href || ""),
      catalogItem: entry.catalogItem && typeof entry.catalogItem === "object" ? entry.catalogItem : null
    };
  }

  function sanitizeOpeningHistoryEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    const result = sanitizeOpeningResult(entry.result);
    if (!result) return null;
    return {
      openingId: String(entry.openingId || ""),
      openingName: String(entry.openingName || ""),
      openedAt: String(entry.openedAt || ""),
      result
    };
  }

  function restoreOpeningState() {
    const parsed = readLocalJson(OPENING_STATE_KEY, {});
    appState.activeOpeningId = String(parsed.activeOpeningId || "");
    appState.openingBatchCount = Math.min(50, Math.max(1, Number(parsed.openingBatchCount) || appState.openingBatchCount));
    appState.openingResultOpeningId = String(parsed.openingResultOpeningId || "");
    appState.openingResult = sanitizeOpeningResult(parsed.openingResult);
    appState.openingBatchResults = Array.isArray(parsed.openingBatchResults)
      ? parsed.openingBatchResults.map(sanitizeOpeningResult).filter(Boolean)
      : [];
    appState.openingHistory = Array.isArray(parsed.openingHistory)
      ? parsed.openingHistory.map(sanitizeOpeningHistoryEntry).filter(Boolean).slice(-500)
      : [];
    appState.openingPickerKind = String(parsed.openingPickerKind || "");
    appState.openingHistoryPage = Math.max(0, Number(parsed.openingHistoryPage) || 0);
  }

  function persistOpeningState() {
    writeLocalJson(OPENING_STATE_KEY, {
      activeOpeningId: appState.activeOpeningId,
      openingBatchCount: Math.min(50, Math.max(1, Number(appState.openingBatchCount) || 10)),
      openingResultOpeningId: appState.openingResultOpeningId,
      openingResult: sanitizeOpeningResult(appState.openingResult),
      openingBatchResults: appState.openingBatchResults.map(sanitizeOpeningResult).filter(Boolean),
      openingHistory: appState.openingHistory.map(sanitizeOpeningHistoryEntry).filter(Boolean).slice(-500),
      openingPickerKind: appState.openingPickerKind,
      openingHistoryPage: appState.openingHistoryPage
    });
  }

  function sanitizeAiInventoryRecommendationsCache(payload) {
    if (!payload || typeof payload !== "object") return null;
    const suggestions = Array.isArray(payload.suggestions)
      ? payload.suggestions
        .filter((entry) => entry && typeof entry === "object")
        .slice(0, 48)
        .map((entry) => {
          const catalogItem = (entry.id && typeof resolveDisplayItemById === "function" && resolveDisplayItemById(entry.id))
            || (typeof resolveDisplayItemByName === "function" && resolveDisplayItemByName(entry.name || ""))
            || null;
          return {
            id: String(entry.id || catalogItem?.id || ""),
            name: String(entry.name || (catalogItem && typeof itemTitle === "function" ? itemTitle(catalogItem) : "")),
            weapon: String(entry.weapon || (catalogItem && typeof itemWeapon === "function" ? itemWeapon(catalogItem) : "")),
            type: String(entry.type || catalogItem?.type || ""),
            group: String(entry.group || ""),
            wearId: String(entry.wearId || ""),
            image: String(entry.image || catalogItem?.image || ""),
            family: String(entry.family || ""),
            familyLabel: String(entry.familyLabel || ""),
            sourceName: String(entry.sourceName || ""),
            sourcePrice: Number(entry.sourcePrice) || 0,
            price: Number(entry.price) || 0,
            upgradeDelta: Number(entry.upgradeDelta) || 0,
            reason: String(entry.reason || ""),
            upgradeSlot: String(entry.upgradeSlot || "")
          };
        })
      : [];
    const comboGuide = payload.comboGuide && typeof payload.comboGuide === "object"
      ? {
          budget: Array.isArray(payload.comboGuide.budget) ? payload.comboGuide.budget.slice(0, 6).map((entry) => String(entry || "")) : [],
          premium: Array.isArray(payload.comboGuide.premium) ? payload.comboGuide.premium.slice(0, 6).map((entry) => String(entry || "")) : []
        }
      : null;
    return {
      ok: payload.ok !== false,
      dominantFamily: String(payload.dominantFamily || ""),
      suggestions,
      comboGuide,
      summary: payload.summary && typeof payload.summary === "object"
        ? { totalSuggestedCost: Number(payload.summary.totalSuggestedCost) || 0 }
        : null
    };
  }

  function sanitizeAiProLoadoutsCache(payload) {
    if (!payload || typeof payload !== "object") return null;
    const teams = Array.isArray(payload.teams)
      ? payload.teams
        .filter((team) => team && typeof team === "object")
        .slice(0, LOADOUT_CACHE_MAX_TEAMS)
        .map((team) => ({
          team: String(team.team || ""),
          logo: String(team.logo || ""),
          sourceUrl: String(team.sourceUrl || ""),
          players: Array.isArray(team.players)
            ? team.players.slice(0, 12).map((player) => ({
                name: String(player?.name || ""),
                avatar: String(player?.avatar || ""),
                knife: Array.isArray(player?.knife) ? player.knife.slice(0, 4).map((entry) => ({
                  itemId: String(entry?.itemId || ""),
                  name: String(entry?.name || ""),
                  image: String(entry?.image || "")
                })) : [],
                gloves: Array.isArray(player?.gloves) ? player.gloves.slice(0, 4).map((entry) => ({
                  itemId: String(entry?.itemId || ""),
                  name: String(entry?.name || ""),
                  image: String(entry?.image || "")
                })) : [],
                guns: Array.isArray(player?.guns) ? player.guns.slice(0, 8).map((entry) => ({
                  itemId: String(entry?.itemId || ""),
                  name: String(entry?.name || ""),
                  image: String(entry?.image || "")
                })) : []
              }))
            : []
        }))
      : [];
    return {
      ok: payload.ok !== false,
      teams
    };
  }

  function restoreAiLoadoutState() {
    const parsed = readLocalJson(AI_LOADOUT_STATE_KEY, {});
    appState.aiLoadoutChatMessages = Array.isArray(parsed.aiLoadoutChatMessages)
      ? parsed.aiLoadoutChatMessages
        .map((entry) => ({
          role: entry?.role === "assistant" ? "assistant" : "user",
          content: String(entry?.content || "").trim(),
          payload: entry?.payload && typeof entry.payload === "object" ? entry.payload : null
        }))
        .filter((entry) => entry.content)
        .slice(-24)
      : [];
    appState.aiLoadoutChatDraft = String(parsed.aiLoadoutChatDraft || "");
    appState.aiLoadoutBudgetDraft = String(parsed.aiLoadoutBudgetDraft || "");
    appState.aiLoadoutPreset = String(parsed.aiLoadoutPreset || "auto") || "auto";
    appState.aiLoadoutColorFilter = String(parsed.aiLoadoutColorFilter || "");
    appState.aiLoadoutStyleFilter = String(parsed.aiLoadoutStyleFilter || "");
    appState.aiInventoryCategory = String(parsed.aiInventoryCategory || "all") || "all";
    appState.aiLoadoutCategory = String(parsed.aiLoadoutCategory || "all") || "all";
    const schemaVersion = Number(parsed.aiProLoadoutsSchemaVersion) || 0;
    const sameSchema = schemaVersion === AI_LOADOUT_SCHEMA_VERSION;
    appState.aiInventoryRecommendations = sameSchema ? sanitizeAiInventoryRecommendationsCache(parsed.aiInventoryRecommendations) : null;
    appState.aiProLoadouts = sameSchema ? mergeAiProLoadoutsWithFallback(parsed.aiProLoadouts) : null;
    appState.aiProLoadoutsFetchedAt = sameSchema ? (Number(parsed.aiProLoadoutsFetchedAt) || 0) : 0;
    appState.aiProLoadoutsSchemaVersion = AI_LOADOUT_SCHEMA_VERSION;
    appState.aiProTeamsRenderedCount = Math.max(
      PRO_LOADOUT_TEAM_PAGE_SIZE,
      Number(parsed.aiProTeamsRenderedCount) || PRO_LOADOUT_TEAM_PAGE_SIZE
    );
    appState.activeProPlayerKey = String(parsed.activeProPlayerKey || "");
    appState.loadoutFrameReady = Boolean(
      appState.aiLoadoutChatMessages.length
      || appState.aiInventoryRecommendations?.suggestions?.length
      || appState.aiProLoadouts?.teams?.length
    );
  }

  function persistAiLoadoutState() {
    writeLocalJson(AI_LOADOUT_STATE_KEY, {
      aiLoadoutChatMessages: (appState.aiLoadoutChatMessages || []).map((entry) => ({
        role: entry?.role === "assistant" ? "assistant" : "user",
        content: String(entry?.content || "").trim(),
        payload: entry?.payload && typeof entry.payload === "object" ? entry.payload : null
      })).filter((entry) => entry.content).slice(-24),
      aiLoadoutChatDraft: String(appState.aiLoadoutChatDraft || ""),
      aiLoadoutBudgetDraft: String(appState.aiLoadoutBudgetDraft || ""),
      aiLoadoutPreset: String(appState.aiLoadoutPreset || "auto") || "auto",
      aiLoadoutColorFilter: String(appState.aiLoadoutColorFilter || ""),
      aiLoadoutStyleFilter: String(appState.aiLoadoutStyleFilter || ""),
      aiInventoryCategory: String(appState.aiInventoryCategory || "all") || "all",
      aiLoadoutCategory: String(appState.aiLoadoutCategory || "all") || "all",
      aiInventoryRecommendations: sanitizeAiInventoryRecommendationsCache(appState.aiInventoryRecommendations),
      aiProLoadouts: sanitizeAiProLoadoutsCache(appState.aiProLoadouts),
      aiProLoadoutsFetchedAt: Number(appState.aiProLoadoutsFetchedAt) || 0,
      aiProLoadoutsSchemaVersion: AI_LOADOUT_SCHEMA_VERSION,
      aiProTeamsRenderedCount: Math.max(PRO_LOADOUT_TEAM_PAGE_SIZE, Number(appState.aiProTeamsRenderedCount) || PRO_LOADOUT_TEAM_PAGE_SIZE),
      activeProPlayerKey: String(appState.activeProPlayerKey || "")
    });
  }

  function pushOpeningHistory(opening, results) {
    const entries = results
      .map((result) => sanitizeOpeningHistoryEntry({
        openingId: opening?.id || "",
        openingName: opening ? openingTitle(opening) : "",
        openedAt: new Date().toISOString(),
        result
      }))
      .filter(Boolean);
    if (!entries.length) return;
    appState.openingHistory = appState.openingHistory.concat(entries).slice(-500);
    appState.openingHistoryPage = 0;
  }

  function clearOpeningHistory() {
    appState.openingHistory = [];
    appState.openingBatchResults = [];
    appState.openingResult = null;
    appState.openingResultOpeningId = "";
    appState.openingHistoryPage = 0;
    persistOpeningState();
  }

  function rememberRecentId(id) {
    const value = String(id || "").trim();
    if (!value) return;
    const current = getUserState();
    if (current.recent[0] === value) return;
    current.recent = [value, ...current.recent.filter((entry) => entry !== value)].slice(0, 24);
    setUserState(current);
  }

  function supportsInventoryInspectItem(item) {
    return ["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove", "sticker", "agent"].includes(String(item?.type || ""));
  }

  function categoryLabel(type) {
    if (currentLanguage() === "zh-CN" && CLEAN_CATEGORY_LABELS_ZH[type]) return CLEAN_CATEGORY_LABELS_ZH[type];
    const record = CATEGORY_I18N[type];
    return record ? localizedTerm(record, record.en, record["zh-CN"] || record.zh || type) : type;
  }

  function wearLabel(wearId) {
    if (currentLanguage() === "zh-CN" && CLEAN_WEAR_LABELS_ZH[wearId]) return CLEAN_WEAR_LABELS_ZH[wearId];
    const record = WEAR_TEXT[wearId];
    return record ? localizedTerm(record, record.en, record.zh) : wearId;
  }

  function clampFloat(value, min = 0, max = 1) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(max, Math.max(min, numeric));
  }

  function formatFloatValue(value) {
    return Number.isFinite(Number(value)) ? Number(value).toFixed(4) : "";
  }

  function resolveWearIdByFloat(item, floatValue) {
    if (!supportsWear(item)) return "";
    const available = wearOptions(item);
    const normalized = clampFloat(floatValue, Number(item?.minFloat ?? 0), Number(item?.maxFloat ?? 1));
    const matched = WEAR_FLOAT_RANGES.find((range) => {
      if (range.id === "battle-scarred") return normalized >= range.min && normalized <= range.max;
      return normalized >= range.min && normalized < range.max;
    })?.id || "";
    if (matched && available.includes(matched)) return matched;
    return available.find((wearId) => {
      const range = WEAR_FLOAT_RANGES.find((entry) => entry.id === wearId);
      if (!range) return false;
      if (wearId === "battle-scarred") return normalized >= range.min && normalized <= range.max;
      return normalized >= range.min && normalized < range.max;
    }) || available[0] || "";
  }

  function openingWearRangeForItem(item, wearId) {
    const wearRange = WEAR_FLOAT_RANGES.find((entry) => entry.id === wearId);
    if (!wearRange) return null;
    const minFloat = clampFloat(item?.minFloat ?? 0, 0, 1);
    const maxFloat = clampFloat(item?.maxFloat ?? 1, minFloat, 1);
    const min = Math.max(minFloat, wearRange.min);
    const max = Math.min(maxFloat, wearRange.max);
    if (max < min) return null;
    if (max === min && !wearOptions(item).includes(wearId)) return null;
    return { min, max };
  }

  function openingWearOptionsWithProbabilities(item) {
    return wearOptions(item)
      .map((wearId) => {
        const range = openingWearRangeForItem(item, wearId);
        return range ? { wearId, weight: Number(OPENING_WEAR_PROBABILITIES[wearId] || 0), range } : null;
      })
      .filter(Boolean);
  }

  function pickWeightedRecord(records = []) {
    const weighted = records.filter((record) => Number(record?.weight || 0) > 0);
    if (!weighted.length) return null;
    const total = weighted.reduce((sum, record) => sum + Number(record.weight || 0), 0);
    let cursor = Math.random() * total;
    for (const record of weighted) {
      cursor -= Number(record.weight || 0);
      if (cursor <= 0) return record;
    }
    return weighted[weighted.length - 1] || null;
  }

  function simulateOpeningWear(item) {
    if (!item || !supportsWear(item)) return { wearId: "", floatValue: null };
    const weightedWears = openingWearOptionsWithProbabilities(item);
    const selectedWear = pickWeightedRecord(weightedWears) || weightedWears[0] || null;
    if (!selectedWear) return { wearId: "", floatValue: null };
    const { wearId, range } = selectedWear;
    const floatValue = range.min + Math.random() * (range.max - range.min);
    return {
      wearId,
      floatValue: clampFloat(floatValue, range.min, range.max)
    };
  }

  function supportsWear(item) {
    return ["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove"].includes(item?.type || "");
  }

  function wearOptions(item) {
    if (!supportsWear(item)) return [];
    return item?.wears?.length ? item.wears : Object.keys(WEAR_TEXT);
  }

  function defaultWearForItem(item) {
    const options = wearOptions(item);
    return options[0] || "";
  }

  function activeWearForItem(item) {
    const options = wearOptions(item);
    if (!options.length) return "";
    const inspectorState = getInspectorState();
    const savedWear = inspectorState.wearByItem?.[item.id];
    if (options.includes(savedWear)) return savedWear;
    return options.includes(appState.pendingWear) ? appState.pendingWear : options[0];
  }

  function localeText(item, field) {
    const lang = currentLanguage();
    const entry = item.translations?.[lang];
    if (entry?.[field]) return entry[field];
    const lazyEntry = globalThis.CS2_CATALOG_LOCALES?.[lang]?.[item.id];
    if (lazyEntry?.[field]) return lazyEntry[field];
    if (lang === "zh-CN" && item[`${field}Zh`]) return item[`${field}Zh`];
    if (lang === "en" && item[`${field}En`]) return item[`${field}En`];
    return firstNonEmpty(
      item.translations?.en?.[field],
      item.translations?.["zh-CN"]?.[field],
      item[`${field}En`],
      item[`${field}Zh`],
      item[field]
    );
  }

  function rarityLabel(item) {
    const localized = localeText(item, "rarity");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    const cleanRarity = CLEAN_RARITY_LABELS_ZH[firstNonEmpty(item.rarityEn, item.rarity, item.rarityZh)];
    if (currentLanguage() === "zh-CN" && cleanRarity) return cleanRarity;
    const fallback = RARITY_FALLBACK[firstNonEmpty(item.rarityEn, item.rarityZh, item.rarity)];
    return fallback ? uiText(fallback.en, fallback.zh) : uiText("Unknown", "未知");
  }

  function collectionLabel(item) {
    const localized = localeText(item, "collection");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    if (currentLanguage() === "zh-CN") {
      return firstNonEmpty(item.collectionZh, item.collection, item.collectionEn, uiText("Unknown Collection", "未知收藏系列"));
    }
    return firstNonEmpty(item.collectionEn, item.collection, item.collectionZh, uiText("Unknown Collection", "未知收藏系列"));
  }

  function itemTitle(item) {
    const localized = localeText(item, "name");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    if (currentLanguage() === "zh-CN") return firstNonEmpty(item.nameZh, item.name, item.nameEn, item.id);
    return firstNonEmpty(item.nameEn, item.name, item.nameZh, item.id);
  }

  function itemDescription(item) {
    return firstNonEmpty(localeText(item, "description"), uiText("No description available.", "暂无说明。"));
  }

  function itemWeapon(item) {
    const localized = localeText(item, "weapon");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    if (currentLanguage() === "zh-CN") return firstNonEmpty(item.weaponZh, item.weapon, categoryLabel(item.type), item.weaponEn);
    return firstNonEmpty(item.weaponEn, item.weapon, categoryLabel(item.type), item.weaponZh);
  }

  function itemSkinLabel(item) {
    const title = itemTitle(item);
    const parts = title.split("|");
    return parts.length > 1 ? parts.slice(1).join("|").trim() : title;
  }

  function resolveDisplayItemByWeaponName(name = "") {
    const normalized = normalizeLoadoutName(name);
    if (!normalized) return null;
    for (const item of items) {
      const candidates = [
        item?.weaponEn,
        item?.weaponZh,
        item?.weapon,
        item?.nameEn?.split("|")[0],
        item?.nameZh?.split("|")[0],
        item?.name?.split("|")[0]
      ]
        .map((entry) => normalizeLoadoutName(entry))
        .filter(Boolean);
      if (candidates.some((entry) => entry === normalized)) return item;
    }
    for (const item of items) {
      const candidates = [
        item?.weaponEn,
        item?.weaponZh,
        item?.weapon,
        item?.nameEn?.split("|")[0],
        item?.nameZh?.split("|")[0],
        item?.name?.split("|")[0]
      ]
        .map((entry) => normalizeLoadoutName(entry))
        .filter(Boolean);
      if (candidates.some((entry) => entry.includes(normalized) || normalized.includes(entry))) return item;
    }
    return null;
  }

  function localizedItemName(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const matched = resolveDisplayItemByName(raw);
    return matched ? itemTitle(matched) : raw;
  }

  function localizedWeaponName(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const matched = resolveDisplayItemByWeaponName(raw) || resolveDisplayItemByName(raw);
    return matched ? itemWeapon(matched) : raw;
  }

  function localizedCatalogDisplayName(name = "", weapon = "") {
    const rawName = String(name || "").trim();
    if (!rawName) return "";
    const matched = resolveDisplayItemByName(rawName);
    if (matched) return itemTitle(matched);
    const parts = rawName.split("|").map((entry) => String(entry || "").trim()).filter(Boolean);
    if (parts.length >= 2) {
      const weaponLabel = localizedWeaponName(parts[0] || weapon);
      const skinRaw = parts.slice(1).join("|").trim();
      const skinMatch = items.find((item) => normalizeLoadoutName(item?.nameEn?.split("|").slice(1).join("|").trim()) === normalizeLoadoutName(skinRaw));
      if (weaponLabel && skinMatch) return `${weaponLabel} | ${itemSkinLabel(skinMatch)}`;
    }
    return rawName;
  }

  function localizeOpeningEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    const catalogItem = itemMap.get(entry.id) || entry.catalogItem || null;
    const wearId = String(entry.wearId || (catalogItem ? resolveWearIdByFloat(catalogItem, entry.floatValue) : "") || "");
    const floatValue = Number.isFinite(Number(entry.floatValue)) ? Number(entry.floatValue) : null;
    const detailQuality = openingResultQualityLabel(entry);
    const variantId = String(entry.variantId || "standard");
    const catalogPriceRecord = catalogItem ? effectiveCatalogPriceRecordForSelection(catalogItem, wearId, variantId) : null;
    const localizedName = catalogItem
      ? itemTitle(catalogItem)
      : firstNonEmpty(currentLanguage() === "en" ? entry.nameEn : entry.nameZh, entry.nameZh, entry.nameEn, entry.name, entry.id);
    const localizedRarity = catalogItem
      ? rarityLabel(catalogItem)
      : firstNonEmpty(currentLanguage() === "en" ? entry.rarityEn : entry.rarityZh, entry.rarityZh, entry.rarityEn, entry.rarity, uiText("Base Grade", "基础级"));
    return {
      ...entry,
      catalogItem,
      displayName: localizedName,
      displayRarity: localizedRarity,
      displayPrice: Number.isFinite(Number(catalogPriceRecord?.price)) ? Number(catalogPriceRecord.price) : (Number.isFinite(Number(entry.displayPrice)) ? Number(entry.displayPrice) : null),
      wearId,
      floatValue,
      href: catalogItem ? `${itemHref(catalogItem)}${wearId ? `&wear=${encodeURIComponent(wearId)}` : ""}` : String(entry.href || ""),
      image: String(catalogItem?.image || entry.image || ""),
      detailWeapon: catalogItem ? itemWeapon(catalogItem) : "",
      detailCollection: catalogItem ? collectionLabel(catalogItem) : "",
      detailQuality,
      detailDescription: catalogItem ? itemDescription(catalogItem) : "",
      detailWearRange: catalogItem ? `${catalogItem.minFloat ?? 0} - ${catalogItem.maxFloat ?? 1}` : "",
      detailWear: wearId ? wearLabel(wearId) : "",
      detailFloat: formatFloatValue(floatValue)
    };
  }

  function openingKindLabel(kind) {
    if (kind === "weapon-case") return uiText("Weapon Case", "武器箱");
    if (kind === "souvenir-package") return uiText("Souvenir Package", "纪念品包");
    if (kind === "capsule") return uiText("Capsule", "胶囊");
    if (kind === "music-kit-box") return uiText("Music Kit Box", "音乐盒");
    if (kind === "package") return uiText("Package", "礼包");
    return uiText("Container", "容器");
  }

  function openingGroupMeta(kind) {
    if (kind === "weapon-case") return {
      eyebrow: uiText("Drop Theatre", "掉落剧场"),
      title: uiText("Weapon Cases", "武器箱"),
      description: uiText("Classic CS weapon cases with skin pools and rare specials.", "经典 CS 武器箱，包含饰品池和稀有特殊物品。")
    };
    if (kind === "souvenir-package") return {
      eyebrow: uiText("Souvenir", "\u7eaa\u5ff5\u54c1"),
      title: uiText("Souvenir Packages", "纪念品包"),
      description: uiText("Tournament souvenir drops grouped by event and map.", "按赛事和地图分组的锦标赛纪念品掉落。")
    };
    if (kind === "capsule") return {
      eyebrow: uiText("Capsules", "鑳跺泭"),
      title: uiText("Sticker and Autograph Capsules", "贴纸与签名胶囊"),
      description: uiText("Sticker capsules, autograph capsules, and related sealed drops.", "贴纸胶囊、签名胶囊及相关密封掉落。")
    };
    if (kind === "music-kit-box") return {
      eyebrow: uiText("Music", "音乐"),
      title: uiText("Music Kit Boxes", "音乐盒"),
      description: uiText("Music kit boxes, with standard and StatTrak sold as separate box variants.", "音乐盒箱子，普通版和 StatTrak 版分开出售。")
    };
    if (kind === "package") return {
      eyebrow: uiText("Packages", "绀煎寘"),
      title: uiText("Other Packages", "其他礼包"),
      description: uiText("Gift packages and other sealed drops that are not standard cases.", "礼包及其他非标准武器箱的密封掉落。")
    };
    return {
      eyebrow: uiText("Containers", "容器"),
      title: uiText("Other Containers", "其他容器"),
      description: uiText("Everything else that can be opened or unpacked.", "其他所有可以开启或拆封的物品。")
    };
  }

  function openingTitle(item) {
    const localized = localeText(item, "name");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    if (currentLanguage() === "zh-CN") return firstNonEmpty(item.nameZh, item.name, item.nameEn, item.id);
    return firstNonEmpty(item.nameEn, item.name, item.nameZh, item.id);
  }

  function openingDescription(item) {
    const localized = localeText(item, "description");
    if (localized && !(currentLanguage() === "zh-CN" && looksLikeMojibake(localized))) return localized;
    if (currentLanguage() === "zh-CN") return firstNonEmpty(item.descriptionZh, item.description, item.descriptionEn, "");
    return firstNonEmpty(item.descriptionEn, item.description, item.descriptionZh, "");
  }

  function collectionBucketOrder() {
    return ["weapon-case", "souvenir-package", "collection", "capsule", "other"];
  }

  function collectionSuperGroupMeta(superGroup) {
    if (superGroup === "unbox") {
      return {
        title: uiText("Openable Drops", "可开启掉落"),
        description: uiText("Weapon cases, souvenir packages, and capsules.", "武器箱、纪念品包和胶囊。")
      };
    }
    if (superGroup === "collection") {
      return {
        title: uiText("Collections", "收藏品系列"),
        description: uiText("Map collections and standard collections.", "\u5730\u56fe\u6536\u85cf\u54c1\u548c\u5e38\u89c4\u6536\u85cf\u7cfb\u5217\u3002")
      };
    }
    return {
      title: uiText("Other", "其他"),
      description: uiText("Miscellaneous collections that do not fit the main groups.", "涓嶅睘浜庝富瑕佸垎缁勭殑鍏朵粬鏀惰棌銆?")
    };
  }

  function collectionSuperGroupForBucket(bucket) {
    if (["weapon-case", "souvenir-package", "capsule"].includes(bucket)) return "unbox";
    if (bucket === "collection") return "collection";
    return "other";
  }

  function openingKindLookup() {
    const lookup = new Map();
    openingItems.forEach((item) => {
      const kind = item?.kind || "container";
      const names = [openingTitle(item), item?.nameZh, item?.nameEn, item?.name]
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      names.forEach((name) => lookup.set(name, kind));
    });
    return lookup;
  }
  function openingDropsSummary(baseCount, rareCount, mode = "listed") {
    const base = String(baseCount || 0);
    const rare = String(rareCount || 0);
    const lang = currentLanguage();
    const listedLabel = lang === "zh-CN" ? "件列出掉落" : "listed drops";
    const standardLabel = lang === "zh-CN" ? "件普通掉落" : "standard drops";
    const rareLabel = lang === "zh-CN" ? "件稀有特殊物品" : "rare specials";
    if (Number(rareCount || 0) > 0) {
      return mode === "listed"
        ? `${base} ${listedLabel} + ${rare} ${rareLabel}`
        : `${base} ${standardLabel} + ${rare} ${rareLabel}`;
    }
    return `${base} ${listedLabel}`;
  }

  function firstSaleLabel(dateText) {
    if (currentLanguage() === "zh-CN") return `首次发售：${dateText}`;
    if (currentLanguage() === "ja") return `初次発売: ${dateText}`;
    return `First sale: ${dateText}`;
  }

  function openingContainerPrice(item) {
    const snapshotRecord = globalThis.CS2_MARKET_PRICES?.items?.[item?.id];
    const idPrice = snapshotPriceFromRecord(snapshotRecord);
    if (idPrice) return idPrice;
    return snapshotPriceByMarketNames(
      item?.marketHashName,
      item?.market_hash_name,
      item?.nameEn,
      item?.nameZh,
      item?.name,
      openingTitle(item)
    );
  }

  function openingIsTerminal(item) {
    return /terminal/i.test(`${item?.nameEn || ""} ${item?.nameZh || ""} ${item?.name || ""} ${item?.marketHashName || ""}`);
  }


  function openingRequiresKey(item) {
    if (!item || openingIsTerminal(item)) return false;
    return ["weapon-case", "capsule", "music-kit-box", "container"].includes(String(item.kind || ""));
  }

  function openingKeyPrice(item) {
    return openingRequiresKey(item) ? OPENING_KEY_PRICE_CNY : 0;
  }

  function openingCostLabel(item) {
    return openingRequiresKey(item) ? uiText("Opening cost", "开箱成本") : uiText("Container price", "箱子价格");
  }

  function openingTotalCost(item, containerPrice = openingContainerPrice(item)) {
    const base = Number.isFinite(Number(containerPrice)) && Number(containerPrice) > 0 ? Number(containerPrice) : 0;
    return base + openingKeyPrice(item);
  }

  function openingPriceTagMarkup(item, containerPrice = openingContainerPrice(item)) {
    const keyPrice = openingKeyPrice(item);
    const totalCost = openingTotalCost(item, containerPrice);
    if (!keyPrice) return `<span class="container-price-tag">${escapeHtml(openingCostLabel(item))}${UI_META_SEPARATOR}${escapeHtml(formatPrice(containerPrice))}</span>`;
    return `<span class="container-price-tag">${escapeHtml(openingCostLabel(item))}${UI_META_SEPARATOR}${escapeHtml(formatFinancePrice(totalCost))} (${escapeHtml(formatPrice(containerPrice))} + ${escapeHtml(uiText("Key", "钥匙"))} ${escapeHtml(formatFinancePrice(keyPrice))})</span>`;
  }

  function openingCardMarkup(item) {
    const containsSummary = openingDropsSummary(item.containsCount || 0, item.containsRareCount || 0, "listed");
    const canSimulate = openingHasLoot(item);
    const isActive = appState.activeOpeningId === item.id;
    const containerPrice = openingContainerPrice(item);
    return `
      <article class="collection-card opening-card${isActive ? " is-active" : ""}">
        ${item.image ? lazyImageMarkup({ className: "collection-cover opening-cover", src: item.image, alt: openingTitle(item), loading: "lazy" }) : ""}
        <div class="collection-copy">
          <p class="eyebrow">${escapeHtml(openingKindLabel(item.kind))}</p>
          <h3>${escapeHtml(openingTitle(item))}</h3>
          <p>${escapeHtml(openingDescription(item) || uiText("No description available.", "暂无说明。"))}</p>
          <div class="collection-tags">
            ${openingPriceTagMarkup(item, containerPrice)}
            <span>${escapeHtml(containsSummary)}</span>
            ${item.firstSaleDate ? `<span>${escapeHtml(firstSaleLabel(item.firstSaleDate))}</span>` : ""}
          </div>
          <div class="opening-card-actions">
            <a class="secondary-link opening-card-detail" href="${escapeHtml(openingHref(item))}">${escapeHtml(uiText("View Details", "查看详情"))}</a>
            <button class="secondary-action compact-action" type="button" data-opening-select="${escapeHtml(item.id)}">${escapeHtml(uiText("Select", "选择"))}</button>
            ${canSimulate ? `<button class="primary-link opening-card-trigger" type="button" data-opening-open="${escapeHtml(item.id)}">${escapeHtml(uiText("Simulate Unbox", "模拟开箱"))}</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function qualityLabel(item) {
    return firstNonEmpty(localeText(item, "quality"), uiText("Standard", "普通"));
  }

  const ITEM_VARIANTS = {
    standard: { en: "Standard", zh: "标准" },
    stattrak: { en: "StatTrak", zh: "StatTrak" },
    souvenir: { en: "Souvenir", zh: "纪念品" }
  };

  const SPECIAL_TEMPLATE_LABELS = {
    "phase-1": { en: "P1", zh: "P1" },
    "phase-2": { en: "P2", zh: "P2" },
    "phase-3": { en: "P3", zh: "P3" },
    "phase-4": { en: "P4", zh: "P4" },
    ruby: { en: "Ruby", zh: "绾㈠疂鐭?" },
    sapphire: { en: "Sapphire", zh: "钃濆疂鐭?" },
    "black-pearl": { en: "Black Pearl", zh: "榛戠弽鐝?" },
    emerald: { en: "Emerald", zh: "缁垮疂鐭?" }
  };

  const SPECIAL_TEMPLATE_GROUP_LABELS = {
    phase: { en: "P Series", zh: "P 绯诲垪" },
    gem: { en: "Gem", zh: "瀹濈煶" }
  };

  function itemVariantLabel(variantId) {
    const record = ITEM_VARIANTS[variantId];
    if (!record) return variantId;
    if (currentLanguage() === "zh-CN") {
      const cleanLabels = {
        standard: "标准",
        stattrak: "StatTrak",
        souvenir: "纪念品"
      };
      if (cleanLabels[variantId]) return cleanLabels[variantId];
    }
    return localizedTerm(record, record.en, record.zh);
  }

  function openingResultQualityLabel(entry) {
    const variantId = String(entry?.variantId || "").trim();
    if (variantId && ITEM_VARIANTS[variantId]) return itemVariantLabel(variantId);
    const qualityText = `${entry?.qualityEn || ""} ${entry?.qualityZh || ""} ${entry?.quality || ""}`.toLowerCase();
    const hasStatTrak = /stattrak/i.test(qualityText);
    const hasSouvenir = /souvenir/i.test(qualityText);
    if (hasSouvenir && !hasStatTrak) return itemVariantLabel("souvenir");
    if (hasStatTrak && !hasSouvenir) return itemVariantLabel("stattrak");
    return "";
  }

  function openingQualityToneClass(entry) {
    const variantId = String(entry?.variantId || "").trim();
    if (variantId === "stattrak" || variantId === "souvenir") return "is-gold";
    return "";
  }

  function openingQualityMarkup(entry, label = openingResultQualityLabel(entry)) {
    const toneClass = openingQualityToneClass(entry);
    if (!label) return "";
    return `<span class="opening-quality${toneClass ? ` ${toneClass}` : ""}">${escapeHtml(label)}</span>`;
  }

  function isDopplerFamilyItem(item) {
    const englishName = String(item?.nameEn || item?.displayName || item?.name || "");
    return Boolean(item?.phase) && /(gamma\s+)?doppler/i.test(englishName);
  }

  function dopplerGroupKey(item) {
    if (!isDopplerFamilyItem(item)) return "";
    const englishName = String(item?.nameEn || item?.displayName || item?.name || "").replace(/\s+/g, " ").trim();
    return slugify(englishName);
  }

  function templateCodeFromPhase(phase) {
    const normalized = String(phase || "").trim().toLowerCase();
    if (!normalized) return "";
    if (normalized === "phase 1") return "phase-1";
    if (normalized === "phase 2") return "phase-2";
    if (normalized === "phase 3") return "phase-3";
    if (normalized === "phase 4") return "phase-4";
    if (normalized === "ruby") return "ruby";
    if (normalized === "sapphire") return "sapphire";
    if (normalized === "black pearl") return "black-pearl";
    if (normalized === "emerald") return "emerald";
    return slugify(normalized);
  }

  function specialTemplateLabel(template) {
    const record = SPECIAL_TEMPLATE_LABELS[template?.code];
    if (!record) return firstNonEmpty(template?.phase, template?.code, "");
    if (currentLanguage() === "zh-CN") {
      const cleanLabels = {
        "phase-1": "P1",
        "phase-2": "P2",
        "phase-3": "P3",
        "phase-4": "P4",
        ruby: "红宝石",
        sapphire: "蓝宝石",
        "black-pearl": "黑珍珠",
        emerald: "绿宝石"
      };
      if (cleanLabels[template?.code]) return cleanLabels[template.code];
    }
    return localizedTerm(record, record.en, record.zh);
  }

  function specialTemplateGroupLabel(groupKey) {
    const record = SPECIAL_TEMPLATE_GROUP_LABELS[groupKey];
    if (!record) return groupKey;
    if (currentLanguage() === "zh-CN") {
      const cleanLabels = {
        phase: "P 系列",
        gem: "宝石"
      };
      if (cleanLabels[groupKey]) return cleanLabels[groupKey];
    }
    return localizedTerm(record, record.en, record.zh);
  }

  function specialTemplateSortRank(template) {
    const order = ["phase-1", "phase-2", "phase-3", "phase-4", "ruby", "sapphire", "black-pearl", "emerald"];
    const index = order.indexOf(template?.code);
    return index >= 0 ? index : order.length + 1;
  }

  function supportsVariantSelection(item) {
    return ["pistol", "rifle", "smg", "shotgun", "machinegun", "sniper", "equipment", "knife"].includes(item?.type || "") || ["pistol", "rifle", "smg", "shotgun", "machinegun", "knife"].includes(item?.model || "");
  }

  function detectItemVariantTraits(item) {
    const qualityText = `${item?.qualityEn || ""} ${item?.qualityZh || ""} ${item?.quality || ""}`.toLowerCase();
    return {
      hasStatTrak: /stattrak/i.test(qualityText),
      hasSouvenir: /souvenir/i.test(qualityText)
    };
  }

  function inferCollectionVariantProfiles(entries) {
    const profiles = new Map();
    entries.forEach((entry) => {
      if (!supportsVariantSelection(entry)) return;
      const collectionKey = firstNonEmpty(entry.collectionEn, entry.collectionZh, entry.collection);
      if (!collectionKey) return;
      const traits = detectItemVariantTraits(entry);
      const profile = profiles.get(collectionKey) || { hasStatTrak: false, hasSouvenir: false };
      if (traits.hasStatTrak) profile.hasStatTrak = true;
      if (traits.hasSouvenir && !traits.hasStatTrak) profile.hasSouvenir = true;
      profiles.set(collectionKey, profile);
    });
    return profiles;
  }

  function variantOptions(item) {
    if (!supportsVariantSelection(item)) return ["standard"];
    const collectionKey = firstNonEmpty(item?.collectionEn, item?.collectionZh, item?.collection);
    const profile = collectionKey ? collectionVariantProfiles.get(collectionKey) : null;
    const { hasStatTrak, hasSouvenir } = detectItemVariantTraits(item);
    const options = [];
    options.push("standard");
    if (profile?.hasStatTrak) options.push("stattrak");
    else if (profile?.hasSouvenir) options.push("souvenir");
    else if (hasStatTrak && !hasSouvenir) options.push("stattrak");
    else if (hasSouvenir && !hasStatTrak) options.push("souvenir");
    else if (hasStatTrak) options.push("stattrak");
    return [...new Set(options)];
  }

  function activeVariantForItem(item) {
    const options = variantOptions(item);
    if (!options.length) return "standard";
    const inspectorState = getInspectorState();
    const savedVariant = inspectorState.variantByItem?.[item.id];
    if (options.includes(savedVariant)) return savedVariant;
    return options.includes(appState.pendingVariant) ? appState.pendingVariant : options[0];
  }

  function defaultVariantForItem(item) {
    return variantOptions(item).includes("standard") ? "standard" : (variantOptions(item)[0] || "standard");
  }

  function catalogOverrideTarget(item) {
    const templateItem = selectedSpecialTemplateItem(item);
    return {
      wearId: wearOptions(templateItem).includes("factory-new") ? "factory-new" : "",
      variantId: activeVariantForItem(templateItem),
      templateItem
    };
  }

  function formatPrice(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return uiText("No price", "暂无报价");
    const formatted = amount.toLocaleString(currentLanguage() === "zh-CN" ? "zh-CN" : "en-US", { maximumFractionDigits: 0 });
    if (currentLanguage() === "zh-CN") return `¥${formatted}`;
    return currentLanguage() === "zh-CN" ? `楼${formatted}` : `CNY ${formatted}`;
  }

  function normalizeItem(raw) {
    const meta = globalThis.CS2_ITEM_META?.[raw.id] || {};
    const nameEn = normalizeEnglishName(firstNonEmpty(raw.nameEn, meta.englishName, raw.displayName, raw.name));
    const nameZh = firstNonEmpty(raw.nameZh, raw.name, nameEn);
    return {
      ...raw,
      displayName: nameEn || nameZh || raw.id,
      nameEn: nameEn || nameZh || raw.id,
      nameZh: nameZh || nameEn || raw.id,
      weaponEn: firstNonEmpty(raw.weaponEn, raw.weapon, raw.type),
      weaponZh: firstNonEmpty(raw.weaponZh, raw.weapon, raw.type),
      collectionEn: firstNonEmpty(raw.collectionEn, raw.collection),
      collectionZh: firstNonEmpty(raw.collectionZh, raw.collection),
      rarityEn: firstNonEmpty(raw.rarityEn, raw.rarity),
      rarityZh: firstNonEmpty(raw.rarityZh, raw.rarity),
      qualityEn: firstNonEmpty(raw.qualityEn, raw.quality),
      qualityZh: firstNonEmpty(raw.qualityZh, raw.quality),
      descriptionEn: firstNonEmpty(raw.descriptionEn, raw.description),
      descriptionZh: firstNonEmpty(raw.descriptionZh, raw.description),
      wears: Array.isArray(raw.wears) ? raw.wears : [],
      price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : null,
      aliases: []
    };
  }

  function buildCatalogItems(sourceItems) {
    const groupedMemberIds = new Set();
    const dopplerGroups = new Map();
    sourceItems.forEach((item) => {
      const groupKey = dopplerGroupKey(item);
      if (!groupKey) return;
      groupedMemberIds.add(item.id);
      if (!dopplerGroups.has(groupKey)) dopplerGroups.set(groupKey, []);
      dopplerGroups.get(groupKey).push(item);
    });
    const catalogItems = sourceItems.filter((item) => !groupedMemberIds.has(item.id));
    dopplerGroups.forEach((groupItems, groupKey) => {
      const sortedGroupItems = [...groupItems].sort((left, right) => {
        const rankDelta = specialTemplateSortRank({ code: templateCodeFromPhase(left.phase) }) - specialTemplateSortRank({ code: templateCodeFromPhase(right.phase) });
        if (rankDelta) return rankDelta;
        return String(left.phase || "").localeCompare(String(right.phase || ""), "en");
      });
      const sample = sortedGroupItems[0];
      const specialTemplates = sortedGroupItems.map((entry) => {
        const code = templateCodeFromPhase(entry.phase);
        return {
          id: entry.id,
          code,
          group: code.startsWith("phase-") ? "phase" : "gem",
          phase: entry.phase
        };
      });
      catalogItems.push({
        ...sample,
        id: `special-group:${groupKey}`,
        aliases: [`doppler-group-${groupKey}`, slugify(sample.nameEn), slugify(sample.nameZh)].filter(Boolean),
        isSpecialTemplateGroup: true,
        specialGroupKind: /gamma doppler/i.test(sample.nameEn || "") ? "gamma-doppler" : "doppler",
        specialTemplates,
        groupMemberIds: sortedGroupItems.map((entry) => entry.id)
      });
    });
    return catalogItems;
  }

  let rawItems = [];
  let normalizedSourceItems = [];
  let collectionVariantProfiles = new Map();
  let items = [];
  let itemMap = new Map();
  let aliasMap = new Map();

  function rebuildCatalogState() {
    rawItems = Array.isArray(globalThis.CS2_CATALOG) ? globalThis.CS2_CATALOG : [];
    normalizedSourceItems = rawItems.map(normalizeItem);
    collectionVariantProfiles = inferCollectionVariantProfiles(normalizedSourceItems);
    items = buildCatalogItems(normalizedSourceItems);
    itemMap = new Map([
      ...items.map((item) => [item.id, item]),
      ...normalizedSourceItems.map((item) => [item.id, item])
    ]);
    aliasMap = new Map();
    normalizedSourceItems.forEach((item) => {
      const aliases = new Set([item.id, slugify(item.nameEn), slugify(item.nameZh)]);
      Object.entries(globalThis.CS2_FEATURED_ASSETS || {}).forEach(([alias, entry]) => {
        if (entry?.sourceName && [item.nameEn, item.nameZh].includes(entry.sourceName)) aliases.add(alias);
      });
      item.aliases = [...aliases].filter(Boolean);
      item.aliases.forEach((alias) => aliasMap.set(alias, item.id));
    });
    items.filter((item) => item.isSpecialTemplateGroup).forEach((item) => {
      item.aliases.forEach((alias) => aliasMap.set(alias, item.id));
    });
    openingItems = Array.isArray(globalThis.CS2_UNBOXING) ? globalThis.CS2_UNBOXING : [];
    inventoryInspectorTarget.nameMap = null;
    catalogOptionsCache.clear();
    globalThis.items = items;
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      document.body.appendChild(script);
    });
  }

  function marketPricesScriptUrl({ fresh = false } = {}) {
    const version = fresh ? Date.now() : Math.floor(Date.now() / MARKET_PRICES_REFRESH_INTERVAL_MS);
    return `${MARKET_PRICES_SCRIPT}?v=${version}`;
  }

  async function loadMarketPricesSnapshot({ fresh = false } = {}) {
    if (fresh) {
      document.querySelectorAll(`script[src^="${MARKET_PRICES_SCRIPT}"]`).forEach((script) => script.remove());
      globalThis.CS2_MARKET_PRICES = null;
      marketPriceSnapshotIndex.source = null;
      marketPriceSnapshotIndex.index = null;
    }
    if (!fresh && globalThis.CS2_MARKET_PRICES?.items) return;
    await loadScriptOnce(marketPricesScriptUrl({ fresh }));
    appState.aiInventoryPriceSnapshotLoadedAt = Date.now();
  }

  function shouldDeferHeavyCatalogAssets() {
    return ["account.html", "inventory.html", "loadout.html"].includes(pageName());
  }

  async function ensureCatalogDataLoaded() {
    if (Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length) {
      if (!items.length) rebuildCatalogState();
      return;
    }
    if (catalogDataPromise) return catalogDataPromise;
    catalogDataPromise = (async () => {
      await loadScriptOnce(CATALOG_DATA_SCRIPT);
      rebuildCatalogState();
    })().finally(() => {
      catalogDataPromise = null;
    });
    return catalogDataPromise;
  }

  function itemDataFileName(id) {
    return encodeURIComponent(String(id || "").trim());
  }

  function mergeCatalogEntries(entries = []) {
    const nextItems = Array.isArray(entries) ? entries : [entries];
    let changed = false;
    nextItems.forEach((entry) => {
      if (!entry?.id || normalizedSourceItems.some((item) => item.id === entry.id)) return;
      normalizedSourceItems.push(normalizeItem(entry));
      changed = true;
    });
    if (!changed) return;
    collectionVariantProfiles = inferCollectionVariantProfiles(normalizedSourceItems);
    items = buildCatalogItems(normalizedSourceItems);
    itemMap = new Map([
      ...items.map((item) => [item.id, item]),
      ...normalizedSourceItems.map((item) => [item.id, item])
    ]);
    aliasMap = new Map();
    normalizedSourceItems.forEach((item) => {
      const aliases = new Set([item.id, slugify(item.nameEn), slugify(item.nameZh)]);
      Object.entries(globalThis.CS2_FEATURED_ASSETS || {}).forEach(([alias, asset]) => {
        if (asset?.sourceName && [item.nameEn, item.nameZh].includes(asset.sourceName)) aliases.add(alias);
      });
      item.aliases = [...aliases].filter(Boolean);
      item.aliases.forEach((alias) => aliasMap.set(alias, item.id));
    });
    items.filter((item) => item.isSpecialTemplateGroup).forEach((item) => {
      item.aliases.forEach((alias) => aliasMap.set(alias, item.id));
    });
    inventoryInspectorTarget.nameMap = null;
    catalogOptionsCache.clear();
    globalThis.items = items;
  }

  async function ensureItemDetailDataLoaded(id) {
    const itemId = String(id || "").trim();
    if (!itemId || resolveDisplayItemById(itemId)) return;
    if (typeof fetch !== "function") {
      await ensureCatalogDataLoaded();
      return;
    }
    const response = await fetch(`item-data/${itemDataFileName(itemId)}.json?v=${ITEM_DATA_VERSION}`, { cache: "force-cache" });
    if (!response.ok) {
      await ensureCatalogDataLoaded();
      return;
    }
    mergeCatalogEntries(await response.json());
  }

  async function ensureItemRelatedDataLoaded(item) {
    const type = String(item?.type || "").trim();
    if (!type) return;
    const relatedCount = items.filter((entry) => entry.id !== item.id && entry.type === type).length;
    if (relatedCount >= 4) return;
    if (typeof fetch !== "function") return;
    if (!relatedDataPromises.has(type)) {
      relatedDataPromises.set(type, fetch(`related-data/${encodeURIComponent(type)}.json?v=${RELATED_DATA_VERSION}`, { cache: "force-cache" })
        .then((response) => response.ok ? response.json() : [])
        .then((entries) => mergeCatalogEntries(entries))
        .catch(() => {}));
    }
    await relatedDataPromises.get(type);
  }

  function openingDataAvailable() {
    return Array.isArray(globalThis.CS2_UNBOXING) && globalThis.CS2_UNBOXING.length > 0;
  }

  async function ensureOpeningDataLoaded() {
    if (openingDataAvailable()) {
      openingItems = globalThis.CS2_UNBOXING;
      return;
    }
    if (openingDataPromise) return openingDataPromise;
    openingDataPromise = (async () => {
      globalThis.__setOpeningData = (payload) => {
        openingItems = Array.isArray(payload) ? payload : [];
        globalThis.CS2_UNBOXING = openingItems;
      };
      await loadScriptOnce(OPENING_DATA_SCRIPT);
      openingItems = Array.isArray(globalThis.CS2_UNBOXING) ? globalThis.CS2_UNBOXING : [];
    })().finally(() => {
      openingDataPromise = null;
    });
    return openingDataPromise;
  }

  function loadOpeningDataJson() {
    if (typeof fetch === "function") {
      return fetch(OPENING_DATA_JSON, { cache: "force-cache" }).then((response) => {
        if (!response.ok) throw new Error("Opening data unavailable");
        return response.json();
      });
    }
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("GET", OPENING_DATA_JSON, true);
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;
        if (request.status < 200 || request.status >= 300) {
          reject(new Error("Opening data unavailable"));
          return;
        }
        try {
          resolve(JSON.parse(request.responseText));
        } catch (error) {
          reject(error);
        }
      };
      request.onerror = () => reject(new Error("Opening data unavailable"));
      request.send();
    });
  }

  async function ensureCatalogAssetsLoaded({ includePrices = true } = {}) {
    if (!includePrices) return ensureCatalogDataLoaded();
    if (catalogAssetsPromise) return catalogAssetsPromise;
    catalogAssetsPromise = (async () => {
      await ensureCatalogDataLoaded();
      await loadMarketPricesSnapshot();
    })().finally(() => {
      catalogAssetsPromise = null;
    });
    return catalogAssetsPromise;
  }

  function catalogDataAvailable() {
    return Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length > 0;
  }

  function pageNeedsCatalogData(targetPage = pageName()) {
    return ["index.html", "catalog.html", "collections.html", "favorites.html", "recent.html", "item.html", "openings.html", "loadout.html"].includes(targetPage);
  }

  rebuildCatalogState();

  function specialTemplatesForItem(item) {
    return Array.isArray(item?.specialTemplates) ? item.specialTemplates : [];
  }

  function itemAliases(item) {
    return Array.isArray(item?.aliases) ? item.aliases.filter((entry) => typeof entry === "string" && entry.trim()) : [];
  }

  function activeSpecialTemplateId(item) {
    const templates = specialTemplatesForItem(item);
    if (!templates.length) return "";
    const requestedTemplate = String(new URLSearchParams(location.search).get("template") || "").trim();
    if (templates.some((template) => template.id === requestedTemplate)) return requestedTemplate;
    const savedTemplate = getInspectorState().templateByItem?.[item.id];
    if (templates.some((template) => template.id === savedTemplate)) return savedTemplate;
    if (templates.some((template) => template.id === appState.pendingTemplate)) return appState.pendingTemplate;
    return templates[0].id;
  }

  function selectedSpecialTemplateItem(item, preferredTemplateId = "") {
    const templates = specialTemplatesForItem(item);
    if (!templates.length) return item;
    const templateId = templates.some((template) => template.id === preferredTemplateId) ? preferredTemplateId : activeSpecialTemplateId(item);
    return itemMap.get(templateId) || item;
  }

  function resolveDisplayItemById(value) {
    const id = String(value || "").trim();
    if (!id) return items[0] || null;
    if (itemMap.has(id)) {
      const directItem = itemMap.get(id) || null;
      if (isDopplerFamilyItem(directItem)) {
        const groupedItem = items.find((entry) => entry.isSpecialTemplateGroup && Array.isArray(entry.groupMemberIds) && entry.groupMemberIds.includes(directItem.id));
        if (groupedItem) return groupedItem;
      }
      return directItem;
    }
    const mapped = aliasMap.get(id);
    if (mapped && itemMap.has(mapped)) return resolveDisplayItemById(mapped);
    return items.find((item) => itemAliases(item).includes(id)) || null;
  }
  globalThis.resolveDisplayItemById = resolveDisplayItemById;
  function inventoryMarketNameKey(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/\s+\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i, "")
      .replace(/^\s*(StatTrak(?:TM|\(TM\))?|Souvenir)\s+/i, "")
      .replace(/\s*TM\s*/g, "")
      .replace(/[()[\]{}'".,!?_ -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function inventoryInspectorTarget(entry) {
    const candidates = [
      entry?.market_hash_name,
      entry?.marketHashName,
      entry?.item_name,
      entry?.itemName
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);
    if (!candidates.length) return null;

    if (!inventoryInspectorTarget.nameMap) {
      const builtNameMap = new Map();
      items.forEach((item) => {
        const keys = new Set([
          inventoryMarketNameKey(item.name),
          inventoryMarketNameKey(item.nameEn),
          inventoryMarketNameKey(item.nameZh),
          inventoryMarketNameKey(localeText(item, "name"))
        ]);
        itemAliases(item).forEach((alias) => keys.add(inventoryMarketNameKey(alias)));
        keys.forEach((key) => {
          if (key && !builtNameMap.has(key)) builtNameMap.set(key, item.id);
        });
      });
      inventoryInspectorTarget.nameMap = builtNameMap;
    }
    const inventoryNameMap = inventoryInspectorTarget.nameMap;

    for (const candidate of candidates) {
      const normalized = inventoryMarketNameKey(candidate);
      const mappedId = inventoryNameMap.get(normalized);
      const resolved = (mappedId && resolveDisplayItemById(mappedId)) || resolveDisplayItemById(slugify(candidate));
      if (resolved && supportsInventoryInspectItem(resolved)) return resolved;
    }

    for (const candidate of candidates) {
      const normalized = inventoryMarketNameKey(candidate);
      if (!normalized) continue;
      const fuzzyMatch = items.find((item) => {
        const namePool = [item.name, item.nameEn, item.nameZh, localeText(item, "name"), ...itemAliases(item)]
          .map(inventoryMarketNameKey)
          .filter(Boolean);
        return namePool.some((name) => normalized.includes(name) || name.includes(normalized));
      });
      if (fuzzyMatch && supportsInventoryInspectItem(fuzzyMatch)) return fuzzyMatch;
    }
    return null;
  }

  function itemHref(item) {
    const actualItem = selectedSpecialTemplateItem(item);
    const aliases = itemAliases(item);
    const alias = aliases.find((entry) => entry !== item.id && entry.length > 2);
    const params = new URLSearchParams();
    params.set("id", alias || item.id);
    if (item.isSpecialTemplateGroup && actualItem?.id && actualItem.id !== item.id) params.set("template", actualItem.id);
    return `item.html?${params.toString()}`;
  }

  function openingHref(item) {
    const params = new URLSearchParams();
    params.set("id", String(item?.id || "").trim());
    return `item.html?${params.toString()}`;
  }

  function openingById(id) {
    return openingItems.find((item) => item.id === id) || null;
  }

  function openingHasLoot(item) {
    return Number(item?.containsCount || 0) + Number(item?.containsRareCount || 0) > 0;
  }

  function ensureActiveOpening() {
    const existing = openingById(appState.activeOpeningId);
    if (existing) return existing;
    const firstWithLoot = openingItems.find((item) => openingHasLoot(item));
    appState.activeOpeningId = firstWithLoot?.id || openingItems[0]?.id || "";
    return openingById(appState.activeOpeningId);
  }

  function openingLootEntries(item) {
    const cacheKey = `${currentLanguage()}::${String(item?.id || "")}`;
    if (openingLootCache.has(cacheKey)) return openingLootCache.get(cacheKey);
    const regular = Array.isArray(item?.contains) ? item.contains.map((entry) => ({ ...entry, isRareSpecial: false })) : [];
    const rare = Array.isArray(item?.containsRare) ? item.containsRare.map((entry) => ({ ...entry, isRareSpecial: true })) : [];
    const localized = [...regular, ...rare].map((entry) => localizeOpeningEntry(entry)).filter(Boolean);
    openingLootCache.set(cacheKey, localized);
    return localized;
  }

  function openingLootPreview(item, limit = 12) {
    return openingLootEntries(item)
      .sort((left, right) => {
        const leftRank = left.isRareSpecial ? 0 : 1;
        const rightRank = right.isRareSpecial ? 0 : 1;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return (Number(right.displayPrice) || 0) - (Number(left.displayPrice) || 0);
      })
      .slice(0, limit);
  }

  function openingDropWeight(entry) {
    const rarity = String(entry.rarityEn || entry.displayRarity || "").toLowerCase();
    if (entry.isRareSpecial) return rarity.includes("covert") ? 1 : 2;
    if (rarity.includes("consumer")) return 28;
    if (rarity.includes("industrial")) return 24;
    if (rarity.includes("mil-spec")) return 20;
    if (rarity.includes("restricted")) return 9;
    if (rarity.includes("classified")) return 4;
    if (rarity.includes("covert")) return 1;
    if (rarity.includes("remarkable")) return 5;
    if (rarity.includes("exotic")) return 3;
    if (rarity.includes("extraordinary")) return 1;
    return 8;
  }

  function openingProbabilityTier(entry, kind = "") {
    const rarity = String(entry?.rarityEn || entry?.displayRarity || entry?.rarity || "").toLowerCase();
    if (entry?.isRareSpecial) return "rare-special";
    if (kind === "capsule") {
      if (rarity.includes("contraband")) return "contraband";
      if (rarity.includes("extraordinary")) return "extraordinary";
      if (rarity.includes("exotic")) return "exotic";
      if (rarity.includes("remarkable")) return "remarkable";
      if (rarity.includes("high grade")) return "high-grade";
    }
    if (rarity.includes("consumer")) return "consumer";
    if (rarity.includes("industrial")) return "industrial";
    if (rarity.includes("mil-spec")) return "mil-spec";
    if (rarity.includes("restricted")) return "restricted";
    if (rarity.includes("classified")) return "classified";
    if (rarity.includes("covert")) return "covert";
    return "other";
  }

  function openingTierSetKey(entries = [], kind = "") {
    const tiers = [...new Set(entries.map((entry) => openingProbabilityTier(entry, kind)).filter((tier) => tier && tier !== "other" && tier !== "rare-special"))].sort();
    return tiers.join("|");
  }

  function openingEntriesGroupedByTier(entries = [], kind = "") {
    const grouped = new Map();
    entries.forEach((entry) => {
      const tier = openingProbabilityTier(entry, kind);
      if (!tier || tier === "other") return;
      if (!grouped.has(tier)) grouped.set(tier, []);
      grouped.get(tier).push(entry);
    });
    return grouped;
  }

  function openingEntriesAreStickerLike(entries = []) {
    return entries.length > 0 && entries.every((entry) => {
      const catalogItem = itemMap.get(entry?.id) || entry?.catalogItem || null;
      return catalogItem?.type === "sticker" || String(entry?.id || "").startsWith("sticker-");
    });
  }

  function pickEntryWithinTier(entries = []) {
    if (!Array.isArray(entries) || !entries.length) return null;
    return entries[Math.floor(Math.random() * entries.length)] || null;
  }

  function openingProbabilityRecordsFromMap(groupedEntries, probabilityMap = {}) {
    return Object.entries(probabilityMap)
      .map(([tier, weight]) => ({ tier, entries: groupedEntries.get(tier) || [], weight: Number(weight || 0) }))
      .filter((record) => record.entries.length && record.weight > 0);
  }

  function pickOpeningEntryByProbabilityMap(entries, kind, probabilityMap = {}) {
    const groupedEntries = openingEntriesGroupedByTier(entries, kind);
    const records = openingProbabilityRecordsFromMap(groupedEntries, probabilityMap);
    const selectedRecord = pickWeightedRecord(records);
    return selectedRecord ? pickEntryWithinTier(selectedRecord.entries) : pickWeightedOpeningEntry(entries);
  }

  function pickWeaponCaseEntry(entries) {
    const groupedEntries = openingEntriesGroupedByTier(entries, "weapon-case");
    const records = openingProbabilityRecordsFromMap(groupedEntries, WEAPON_CASE_RARITY_PROBABILITIES);
    const selectedRecord = pickWeightedRecord(records);
    return selectedRecord ? pickEntryWithinTier(selectedRecord.entries) : pickWeightedOpeningEntry(entries);
  }

  function pickSouvenirPackageEntry(entries) {
    const key = openingTierSetKey(entries, "souvenir-package");
    const probabilityMap = SOUVENIR_PACKAGE_PROBABILITY_MAP[key];
    return probabilityMap ? pickOpeningEntryByProbabilityMap(entries, "souvenir-package", probabilityMap) : pickWeightedOpeningEntry(entries);
  }

  function pickCapsuleEntry(entries) {
    const key = openingTierSetKey(entries, "capsule");
    if (key === "high-grade" || key === "remarkable" || key === "exotic" || key === "extraordinary" || key === "contraband") {
      return pickEntryWithinTier(entries);
    }
    const probabilityMap = CAPSULE_PROBABILITY_MAP[key];
    return probabilityMap ? pickOpeningEntryByProbabilityMap(entries, "capsule", probabilityMap) : pickWeightedOpeningEntry(entries);
  }

  function pickOpeningEntryByOfficialOdds(entries, kind = "", opening = null) {
    if (!Array.isArray(entries) || !entries.length) return null;
    if (kind === "weapon-case") return pickWeaponCaseEntry(entries);
    if (kind === "souvenir-package") return pickSouvenirPackageEntry(entries);
    if (kind === "capsule") return pickCapsuleEntry(entries);
    if (kind === "music-kit-box") return pickEntryWithinTier(entries);
    if (kind === "package" || kind === "container") {
      const openingName = `${opening?.nameEn || ""} ${opening?.nameZh || ""} ${opening?.name || ""}`.toLowerCase();
      if (openingEntriesAreStickerLike(entries)) {
        return pickCapsuleEntry(entries);
      }
      if (/autograph capsule|sticker capsule|patch pack|pin capsule|鑳跺泭|鍗拌姳|绛惧悕/u.test(openingName)) {
        return pickCapsuleEntry(entries);
      }
      if (/souvenir/i.test(openingName)) {
        return pickSouvenirPackageEntry(entries);
      }
    }
    return pickWeightedOpeningEntry(entries);
  }

  function pickWeightedOpeningEntry(entries) {
    const total = entries.reduce((sum, entry) => sum + openingDropWeight(entry), 0);
    let cursor = Math.random() * (total || 1);
    for (const entry of entries) {
      cursor -= openingDropWeight(entry);
      if (cursor <= 0) return entry;
    }
    return entries[entries.length - 1] || null;
  }

  function openingEntrySupportsStatTrak(entry) {
    const catalogItem = itemMap.get(entry?.id) || entry?.catalogItem || null;
    if (!catalogItem) return false;
    if (entry?.isRareSpecial) return catalogItem.type === "knife";
    return supportsVariantSelection(catalogItem) && catalogItem.type !== "glove";
  }

  function inferOpeningVariantMode(opening) {
    const kind = String(opening?.kind || "").trim();
    const openingName = `${opening?.nameEn || ""} ${opening?.nameZh || ""} ${opening?.name || ""}`.toLowerCase();
    if (kind === "souvenir-package") return "souvenir";
    if (kind === "weapon-case") return "mixed-stattrak";
    if (kind === "music-kit-box") return /stattrak/i.test(openingName) ? "stattrak-only" : "standard";
    const entries = openingLootEntries(opening);
    if (!entries.length) return "standard";
    const hasSouvenirOnly = entries.every((entry) => {
      const text = `${entry?.qualityEn || ""} ${entry?.qualityZh || ""} ${entry?.quality || ""}`.toLowerCase();
      return /souvenir/i.test(text) && !/stattrak/i.test(text);
    });
    if (hasSouvenirOnly) return "souvenir";
    const hasStatTrakPool = entries.some((entry) => openingEntrySupportsStatTrak(entry));
    return hasStatTrakPool ? "mixed-stattrak" : "standard";
  }

  function resolveOpeningResultVariant(opening, pickedEntry) {
    const mode = inferOpeningVariantMode(opening);
    if (mode === "souvenir") return "souvenir";
    if (mode === "stattrak-only") return "stattrak";
    if (mode === "mixed-stattrak" && openingEntrySupportsStatTrak(pickedEntry) && Math.random() < 0.1) return "stattrak";
    return "standard";
  }

  function pickOpeningReward(item) {
    const all = openingLootEntries(item);
    if (!all.length) return null;
    const pickedEntry = pickOpeningEntryByOfficialOdds(all, item?.kind || "", item);
    if (!pickedEntry) return null;
    const catalogItem = itemMap.get(pickedEntry.id) || pickedEntry.catalogItem || null;
    return {
      ...pickedEntry,
      variantId: resolveOpeningResultVariant(item, pickedEntry),
      ...(catalogItem ? simulateOpeningWear(catalogItem) : { wearId: "", floatValue: null })
    };
  }

  function openingResultQuality(entry) {
    if (!entry) return -1;
    const rarity = String(entry.rarityEn || entry.displayRarity || entry.rarity || "").toLowerCase();
    let rank = 0;
    if (entry.isRareSpecial) rank += 100;
    if (rarity.includes("contraband")) rank += 80;
    else if (rarity.includes("covert")) rank += 70;
    else if (rarity.includes("extraordinary")) rank += 60;
    else if (rarity.includes("exotic")) rank += 55;
    else if (rarity.includes("classified")) rank += 50;
    else if (rarity.includes("remarkable")) rank += 45;
    else if (rarity.includes("restricted")) rank += 40;
    else if (rarity.includes("mil-spec")) rank += 30;
    else if (rarity.includes("industrial")) rank += 20;
    else if (rarity.includes("consumer")) rank += 10;
    return rank * 1000000 + (Number(entry.displayPrice) || 0);
  }

  function highestQualityOpeningResult(results) {
    return results.reduce((best, entry) => {
      if (!best) return entry;
      return openingResultQuality(entry) > openingResultQuality(best) ? entry : best;
    }, null);
  }

  function randomOpeningEntry(item) {
    const pool = openingLootEntries(item);
    const pickedEntry = pool[Math.floor(Math.random() * pool.length)] || null;
    if (!pickedEntry) return null;
    const catalogItem = itemMap.get(pickedEntry.id) || pickedEntry.catalogItem || null;
    return {
      ...pickedEntry,
      variantId: resolveOpeningResultVariant(item, pickedEntry),
      ...(catalogItem ? simulateOpeningWear(catalogItem) : { wearId: "", floatValue: null })
    };
  }

  function buildOpeningSpinSequence(item, winner, total = 42, winnerIndex = 34) {
    const sequence = [];
    for (let index = 0; index < total; index += 1) {
      if (index === winnerIndex) {
        sequence.push({ ...winner, __spinWinner: true });
      } else {
        const filler = randomOpeningEntry(item) || winner;
        sequence.push({ ...filler, __spinWinner: false });
      }
    }
    return sequence;
  }

  function openingInspectLinkMarkup(href, compact = false) {
    if (!href) return "";
    return `<div class="unbox-loot-actions"><a class="secondary-link unbox-loot-inspect${compact ? " is-compact" : ""}" data-opening-inspect-link href="${escapeHtml(href)}">${escapeHtml(uiText("Inspect Item", "检视物品"))}</a></div>`;
  }

  function openingLootCardMarkup(entry, { compact = false, landed = false, attributes = "", inspectable = false } = {}) {
    const localizedEntry = localizeOpeningEntry(entry) || entry;
    const qualityMarkup = localizedEntry.detailQuality ? openingQualityMarkup(localizedEntry, localizedEntry.detailQuality) : "";
    const wearMeta = [
      localizedEntry.wearId ? wearLabel(localizedEntry.wearId) : "",
      localizedEntry.floatValue != null ? `${uiText("Float", "磨损值")} ${formatFloatValue(localizedEntry.floatValue)}` : ""
    ].filter(Boolean).join(UI_META_SEPARATOR);
    return `
      <article class="unbox-loot-card${compact ? " is-compact" : ""}${localizedEntry.isRareSpecial ? " is-rare-special" : ""}${landed ? " is-landed" : ""}"${localizedEntry.rarityColor ? ` style="--drop-accent:${escapeHtml(localizedEntry.rarityColor)}"` : ""}${attributes ? ` ${attributes}` : ""}>
        ${localizedEntry.image ? `<img src="${escapeHtml(localizedEntry.image)}" alt="${escapeHtml(localizedEntry.displayName)}" loading="lazy" />` : `<div class="empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
        <div class="unbox-loot-copy">
          <strong>${escapeHtml(localizedEntry.displayName)}</strong>
          <span>${escapeHtml(localizedEntry.displayRarity)}</span>
          <small>${qualityMarkup}${qualityMarkup && wearMeta ? UI_META_SEPARATOR : ""}${escapeHtml([wearMeta, formatPrice(localizedEntry.displayPrice)].filter(Boolean).join(UI_META_SEPARATOR))}</small>
        </div>
        ${inspectable ? openingInspectLinkMarkup(localizedEntry.href, compact) : ""}
      </article>
    `;
  }

  function openingReelPreviewMarkup(item) {
    const preview = openingLootPreview(item, 10);
    return preview.length
      ? preview.concat(preview.slice(0, 4)).map((entry) => openingLootCardMarkup(entry, { compact: true })).join("")
      : `<div class="empty-state">${escapeHtml(uiText("No loot data yet.", "暂无掉落数据。"))}</div>`;
  }

  function openingLootPoolMarkup(item, options = {}) {
    const compact = Boolean(options.compact);
    const detailLink = String(options.detailLink || "");
    const all = openingLootEntries(item);
    const regular = all.filter((entry) => !entry.isRareSpecial);
    const rare = all.filter((entry) => entry.isRareSpecial);
    const sections = [
      {
        key: "regular",
        title: uiText("Standard Drops", "普通掉落"),
        description: uiText("These are the listed core drops in this container.", "这些是该容器列出的主要掉落。"),
        entries: regular
      },
      {
        key: "rare",
        title: uiText("Rare Specials", "稀有特殊物品"),
        description: uiText("These are the extra rare pulls that can appear in place of a standard drop.", "这些是可能替代普通掉落出现的稀有特殊物品。"),
        entries: rare
      }
    ].filter((section) => section.entries.length);
    if (!sections.length) {
      return `<div class="empty-state">${escapeHtml(uiText("No loot data yet.", "暂无掉落数据。"))}</div>`;
    }
    return sections.map((section) => {
      const previewEntries = compact ? section.entries.slice(0, 8) : section.entries;
      return `
      <section class="unbox-pool-section">
        <div class="unbox-pool-head">
          <div>
            <p class="eyebrow">${escapeHtml(section.title)}</p>
            <h3>${escapeHtml(uiTemplate("{count} items", { count: String(section.entries.length) }))}</h3>
          </div>
          <span>${escapeHtml(section.description)}</span>
        </div>
        <div class="unbox-loot-preview-grid is-full-pool">
          ${previewEntries.map((entry) => openingLootCardMarkup(entry, {
            compact: true,
            inspectable: true,
            attributes: `role="button" tabindex="0" data-opening-pool-index="${all.indexOf(entry)}" aria-label="${escapeHtml(uiText("View this drop", "查看该掉落"))}"`
          })).join("")}
        </div>
        ${compact && section.entries.length > previewEntries.length && detailLink ? `<div class="opening-index-actions"><a class="secondary-link" href="${escapeHtml(detailLink)}">${escapeHtml(uiText("View Details", "查看详情"))}</a></div>` : ""}
      </section>
    `;
    }).join("");
  }

  function openingPickerGroups() {
    return OPENING_KIND_ORDER.map((kind) => {
      const entries = openingItems.filter((item) => (item.kind || "container") === kind && openingHasLoot(item));
      return { kind, meta: openingGroupMeta(kind), entries };
    }).filter((group) => group.entries.length);
  }

  function openOpeningPicker() {
    const groups = openingPickerGroups();
    appState.openingPickerOpen = true;
    document.body.classList.add("picker-open");
    if (!groups.some((group) => group.kind === appState.openingPickerKind)) {
      appState.openingPickerKind = groups[0]?.kind || "";
    }
    renderOpeningPickerPortal();
  }

  function closeOpeningPicker() {
    appState.openingPickerOpen = false;
    if (![...document.querySelectorAll(".collection-picker")].some((entry) => !entry.hidden)) {
      document.body.classList.remove("picker-open");
    }
    renderOpeningPickerPortal();
  }

  function openingPickerMarkup() {
    if (!appState.openingPickerOpen) return "";
    const groups = openingPickerGroups();
    const activeKind = groups.some((group) => group.kind === appState.openingPickerKind) ? appState.openingPickerKind : (groups[0]?.kind || "");
    const activeGroup = groups.find((group) => group.kind === activeKind) || groups[0] || null;
    if (!activeGroup) return "";
    return `
      <div class="opening-picker" id="openingPicker">
        <button class="opening-picker-backdrop" type="button" data-opening-picker-close aria-label="${escapeHtml(uiText("Close picker", "关闭选择器"))}"></button>
        <div class="opening-picker-dialog">
          <div class="opening-picker-head">
            <div>
              <p class="eyebrow">${escapeHtml(uiText("Choose Case", "选择箱子"))}</p>
              <h3>${escapeHtml(uiText("Pick a category first, then a case", "先选择类型，再选择箱子"))}</h3>
            </div>
            <button class="picker-close" type="button" data-opening-picker-close>${escapeHtml(uiText("Close", "关闭"))}</button>
          </div>
          <div class="opening-picker-body">
            <aside class="opening-picker-kinds">
              ${groups.map((group) => `
                <button class="opening-kind-chip${group.kind === activeKind ? " is-active" : ""}" type="button" data-opening-kind="${escapeHtml(group.kind)}">
                  <strong>${escapeHtml(group.meta.title)}</strong>
                  <span>${escapeHtml(uiTemplate("{count} cases", { count: String(group.entries.length) }))}</span>
                </button>
              `).join("")}
            </aside>
            <div class="opening-picker-list">
              <div class="opening-picker-list-head">
                <p class="eyebrow">${escapeHtml(activeGroup.meta.eyebrow)}</p>
                <strong>${escapeHtml(activeGroup.meta.title)}</strong>
                <span>${escapeHtml(activeGroup.meta.description)}</span>
              </div>
              <div class="opening-picker-grid">
                ${activeGroup.entries.sort((a, b) => openingTitle(a).localeCompare(openingTitle(b), currentLanguage())).map((entry) => `
                  <button class="opening-picker-card${entry.id === appState.activeOpeningId ? " is-active" : ""}" type="button" data-opening-pick="${escapeHtml(entry.id)}">
                    ${entry.image ? `<img src="${escapeHtml(entry.image)}" alt="${escapeHtml(openingTitle(entry))}" loading="lazy" />` : ""}
                    <div>
                      <strong>${escapeHtml(openingTitle(entry))}</strong>
                      <span>${escapeHtml(openingKindLabel(entry.kind))}</span>
                      <small>${escapeHtml(openingDropsSummary((entry.containsCount || 0) + (entry.containsRareCount || 0), 0, "listed"))}</small>
                    </div>
                  </button>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderOpeningPickerPortal() {
    let portal = document.getElementById("openingPickerPortal");
    if (!appState.openingPickerOpen) {
      if (portal) portal.remove();
      return;
    }
    if (!portal) {
      portal = document.createElement("div");
      portal.id = "openingPickerPortal";
      document.body.appendChild(portal);
    }
    portal.innerHTML = openingPickerMarkup();
  }

  function openingResultMarkup(item, result) {
    const localizedResult = localizeOpeningEntry(result);
    const allBatchResults = appState.openingResultOpeningId === item?.id ? appState.openingBatchResults : [];
    const batchResults = allBatchResults.slice(0, 24);
    const batchRareCount = allBatchResults.filter((entry) => entry.isRareSpecial).length;
    if (!localizedResult) {
      return `
        <div class="unbox-result-empty">
          <strong>${escapeHtml(uiText("Ready to open", "准备开箱"))}</strong>
          <span>${escapeHtml(uiText("Hit the button to let the reel decide your drop.", "点击按钮，让转盘决定本次掉落。"))}</span>
        </div>
      `;
    }
    return `
      <div class="unbox-result-card${localizedResult.isRareSpecial ? " is-rare-special" : ""}"${localizedResult.rarityColor ? ` style="--drop-accent:${escapeHtml(localizedResult.rarityColor)}"` : ""}>
        <div class="unbox-result-head">
          <p class="eyebrow">${escapeHtml(localizedResult.isRareSpecial ? uiText("Rare Special", "稀有特殊物品") : uiText("Drop Result", "掉落结果"))}</p>
          <strong>${escapeHtml(openingTitle(item))}</strong>
        </div>
        <div class="unbox-result-body">
          ${openingLootCardMarkup(localizedResult, { landed: true, inspectable: true })}
          <div class="unbox-result-meta">
            <span>${escapeHtml(localizedResult.displayRarity)}</span>
            <span>${escapeHtml(formatPrice(localizedResult.displayPrice))}</span>
            ${localizedResult.detailWear ? `<span>${escapeHtml(uiText("Wear", "磨损"))}: ${escapeHtml(localizedResult.detailWear)}</span>` : ""}
            ${localizedResult.detailFloat ? `<span>${escapeHtml(uiText("Float", "磨损值"))}: ${escapeHtml(localizedResult.detailFloat)}</span>` : ""}
            ${localizedResult.detailWeapon ? `<span>${escapeHtml(uiText("Weapon", "武器"))}: ${escapeHtml(localizedResult.detailWeapon)}</span>` : ""}
            ${localizedResult.detailCollection ? `<span>${escapeHtml(uiText("Collection", "\u6536\u85cf\u54c1"))}: ${escapeHtml(localizedResult.detailCollection)}</span>` : ""}
            ${localizedResult.detailQuality ? `<span>${escapeHtml(uiText("Quality", "品质"))}: ${openingQualityMarkup(localizedResult, localizedResult.detailQuality)}</span>` : ""}
            ${localizedResult.detailWearRange ? `<span>${escapeHtml(uiText("Wear Range", "磨损范围"))}: ${escapeHtml(localizedResult.detailWearRange)}</span>` : ""}
            ${localizedResult.href ? `<a class="secondary-link" href="${escapeHtml(localizedResult.href)}">${escapeHtml(uiText("Inspect Item", "检视物品"))}</a>` : ""}
          </div>
        </div>
        ${batchResults.length ? `
          <div class="unbox-result-merged">
            <div class="unbox-pool-head">
              <h3>${escapeHtml(uiText("This Multi-open", "本次连开"))}</h3>
              <span>${escapeHtml(uiTemplate("{count} items", { count: allBatchResults.length }))}${batchRareCount ? escapeHtml(` 路 ${batchRareCount} rare`) : ""}${allBatchResults.length > batchResults.length ? escapeHtml(uiText(" 路 Showing first 24", " 路 仅显示前 24 项")) : ""}</span>
            </div>
            <div class="unbox-loot-preview-grid is-full-pool">
              ${batchResults.map((entry, index) => openingLootCardMarkup(entry, {
                compact: true,
                inspectable: true,
                landed: appState.openingResult === entry,
                attributes: `role="button" tabindex="0" data-opening-batch-index="${index}" aria-label="${escapeHtml(uiText("View this result", "查看该结果"))}"`
              })).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function openingHistoryEntryCost(entry, fallbackOpening = null) {
    const opening = openingById(entry?.openingId) || fallbackOpening || null;
    const liveKey = opening?.id ? livePriceKey(opening.id, "", "standard") : "";
    const livePrice = liveKey ? appState.livePrices[liveKey]?.referencePrice : null;
    if (Number.isFinite(Number(livePrice)) && Number(livePrice) > 0) return openingTotalCost(opening, livePrice);
    const price = opening ? openingContainerPrice(opening) : null;
    return opening ? openingTotalCost(opening, price) : 0;
  }

  function openingHistoryEntryReturn(entry) {
    const localizedEntry = localizeOpeningEntry(entry?.result) || entry?.result || null;
    const price = localizedEntry?.displayPrice;
    return Number.isFinite(Number(price)) && Number(price) > 0 ? Number(price) : 0;
  }

  function openingFinanceAnalytics(item) {
    const activeId = String(item?.id || "");
    const scopedHistory = appState.openingHistory.filter((entry) => !activeId || entry.openingId === activeId);
    const allHistory = appState.openingHistory;
    const summarize = (history, fallbackOpening = null) => {
      const totalCost = history.reduce((sum, entry) => sum + openingHistoryEntryCost(entry, fallbackOpening), 0);
      const totalReturn = history.reduce((sum, entry) => sum + openingHistoryEntryReturn(entry), 0);
      const bestEntry = history.reduce((best, entry) => {
        const value = openingHistoryEntryReturn(entry);
        if (!best || value > best.value) return { entry, value };
        return best;
      }, null);
      return {
        count: history.length,
        rareCount: history.filter((entry) => entry.result?.isRareSpecial).length,
        totalCost,
        totalReturn,
        profit: totalReturn - totalCost,
        roi: totalCost > 0 ? (totalReturn / totalCost) * 100 : null,
        averageReturn: history.length ? totalReturn / history.length : 0,
        bestEntry
      };
    };
    return {
      active: summarize(scopedHistory, item),
      all: summarize(allHistory, null)
    };
  }

  function formatPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return uiText("No data", "鏆傛棤鏁版嵁");
    return `${number.toLocaleString(currentLanguage() === "zh-CN" ? "zh-CN" : "en-US", { maximumFractionDigits: 1 })}%`;
  }

  function formatSignedPrice(value) {
    const number = Number(value);
    if (Number.isFinite(number) && number === 0) return formatFinancePrice(0);
    if (!Number.isFinite(number)) return formatPrice(null);
    const formatted = formatFinancePrice(Math.abs(number));
    if (number > 0) return `+${formatted}`;
    if (number < 0) return `-${formatted}`;
    return formatted;
  }

  function formatFinancePrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return formatPrice(null);
    if (number <= 0) return currentLanguage() === "zh-CN" ? "¥0" : "CNY 0";
    return formatPrice(number);
  }

  function openingFinanceStatsMarkup(stats) {
    const profitClass = stats.profit > 0 ? " is-positive" : stats.profit < 0 ? " is-negative" : "";
    return `
      <div class="opening-finance-grid">
        <div><span>${escapeHtml(uiText("Openings", "开箱记录"))}</span><strong>${escapeHtml(String(stats.count))}</strong></div>
        <div><span>${escapeHtml(uiText("Spend", "投入"))}</span><strong>${escapeHtml(formatFinancePrice(stats.totalCost))}</strong></div>
        <div><span>${escapeHtml(uiText("Return", "产出"))}</span><strong>${escapeHtml(formatFinancePrice(stats.totalReturn))}</strong></div>
        <div><span>${escapeHtml(uiText("Profit", "盈亏"))}</span><strong class="opening-finance-profit${profitClass}">${escapeHtml(formatSignedPrice(stats.profit))}</strong></div>
        <div><span>${escapeHtml(uiText("ROI", "回报率"))}</span><strong>${escapeHtml(formatPercent(stats.roi))}</strong></div>
        <div><span>${escapeHtml(uiText("Average Drop", "平均产出"))}</span><strong>${escapeHtml(formatFinancePrice(stats.averageReturn))}</strong></div>
      </div>
    `;
  }

  function openingFinanceAnalyticsMarkup(item) {
    const analytics = openingFinanceAnalytics(item);
    const bestEntry = analytics.active.bestEntry?.entry || analytics.all.bestEntry?.entry || null;
    const bestDrop = localizeOpeningEntry(bestEntry?.result) || bestEntry?.result || null;
    const activeTitle = item ? openingTitle(item) : uiText("Current Container", "当前容器");
    return `
      <section class="opening-finance-panel">
        <div class="unbox-pool-head">
          <div>
            <p class="eyebrow">${escapeHtml(uiText("Finance", "收支分析"))}</p>
            <h3>${escapeHtml(uiText("Opening Spend vs Return", "开箱花费与回报"))}</h3>
          <span>${escapeHtml(uiText("Estimated from current opening costs and historical drop prices.", "基于当前开箱成本和历史掉落价格估算。"))}</span>
          </div>
          ${bestDrop ? `<div class="opening-best-drop"><span>${escapeHtml(uiText("Best Drop", "最佳掉落"))}</span><strong>${escapeHtml(bestDrop.displayName || bestDrop.nameZh || bestDrop.nameEn || bestDrop.name || "")}</strong><small>${escapeHtml(formatPrice(bestDrop.displayPrice))}</small></div>` : ""}
        </div>
        <div class="opening-finance-columns">
          <div class="opening-finance-block">
            <h4>${escapeHtml(activeTitle)}</h4>
            ${openingFinanceStatsMarkup(analytics.active)}
          </div>
          <div class="opening-finance-block">
            <h4>${escapeHtml(uiText("All Opening History", "全部开箱历史"))}</h4>
            ${openingFinanceStatsMarkup(analytics.all)}
          </div>
        </div>
      </section>
    `;
  }

  function openingHistoryMarkup(history) {
    const pageSize = 25;
    const visible = history
      .map((entry, index) => ({ entry, index }))
      .reverse();
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    const safePage = Math.min(Math.max(0, Number(appState.openingHistoryPage) || 0), totalPages - 1);
    if (safePage !== appState.openingHistoryPage) appState.openingHistoryPage = safePage;
    const pageEntries = visible.slice(safePage * pageSize, safePage * pageSize + pageSize);
    const rareCount = visible.filter(({ entry }) => entry.result?.isRareSpecial).length;
    return `
      <section class="unbox-batch-results">
        <div class="unbox-pool-head">
          <div>
            <h3>${escapeHtml(uiText("Opening History", "开箱历史"))}</h3>
            <span>${escapeHtml(uiTemplate("{count} items", { count: visible.length }))}${rareCount ? escapeHtml(` 路 ${rareCount} rare`) : ""}${escapeHtml(uiText(" 路 25 per page", " 路 每页 25 项"))}</span>
          </div>
          <div class="opening-index-actions">
            <button class="secondary-action compact-action" id="openingHistoryPrevPage" type="button"${safePage <= 0 ? " disabled" : ""}>${escapeHtml(uiText("Prev", "涓婁竴椤?"))}</button>
            <span>${escapeHtml(uiTemplate("Page {page}", { page: String(safePage + 1) }))} / ${escapeHtml(String(totalPages))}</span>
            <button class="secondary-action compact-action" id="openingHistoryNextPage" type="button"${safePage >= totalPages - 1 ? " disabled" : ""}>${escapeHtml(uiText("Next", "涓嬩竴椤?"))}</button>
            <button class="secondary-action compact-action" id="clearOpeningHistoryButton" type="button">${escapeHtml(uiText("Clear History", "\u6e05\u7a7a\u5386\u53f2"))}</button>
          </div>
        </div>
        <div class="unbox-loot-preview-grid is-full-pool">
          ${pageEntries.map(({ entry, index }) => `
            ${(() => {
              const localizedEntry = localizeOpeningEntry(entry.result) || entry.result;
              return `<article class="unbox-loot-card${localizedEntry?.isRareSpecial ? " is-rare-special" : ""}"${localizedEntry?.rarityColor ? ` style="--drop-accent:${escapeHtml(localizedEntry.rarityColor)}"` : ""} role="button" tabindex="0" data-opening-history-index="${index}" aria-label="${escapeHtml(uiText("View this history result", "查看这条历史结果"))}">
              ${localizedEntry?.image ? `<img src="${escapeHtml(localizedEntry.image)}" alt="${escapeHtml(localizedEntry.displayName || localizedEntry.name || localizedEntry.id)}" loading="lazy" />` : ""}
              <div class="unbox-loot-copy">
                <strong>${escapeHtml(localizedEntry?.displayName || localizedEntry?.nameZh || localizedEntry?.nameEn || localizedEntry?.name || localizedEntry?.id || uiText("Unknown drop", "未知掉落"))}</strong>
                <span>${escapeHtml(openingTitle(openingById(entry.openingId) || { id: entry.openingId, name: entry.openingName, nameZh: entry.openingName, nameEn: entry.openingName }) || entry.openingName || uiText("Unknown case", "未知箱子"))}</span>
                <small>${escapeHtml(localizedEntry?.displayRarity || uiText("Standard", "普通"))}${localizedEntry?.detailQuality ? `${UI_META_SEPARATOR}${openingQualityMarkup(localizedEntry, localizedEntry.detailQuality)}` : ""}${[localizedEntry?.detailWear || "", localizedEntry?.detailFloat ? `${uiText("Float", "磨损值")} ${localizedEntry.detailFloat}` : "", formatPrice(localizedEntry?.displayPrice)].filter(Boolean).length ? `${UI_META_SEPARATOR}${escapeHtml([localizedEntry?.detailWear || "", localizedEntry?.detailFloat ? `${uiText("Float", "磨损值")} ${localizedEntry.detailFloat}` : "", formatPrice(localizedEntry?.displayPrice)].filter(Boolean).join(UI_META_SEPARATOR))}` : ""}</small>
              </div>
              ${openingInspectLinkMarkup(localizedEntry?.href || "", true)}
            </article>`;
            })()}
          `).join("")}
        </div>
      </section>
    `;
  }

  function openingSimulatorMarkup(item) {
    const lootEntries = openingLootEntries(item);
    const result = appState.openingResultOpeningId === item.id ? appState.openingResult : null;
    const lootSummary = openingDropsSummary(item.containsCount || 0, item.containsRareCount || 0, "standard");
    const openingHistory = appState.openingHistory;
    const batchCount = Math.min(50, Math.max(1, Number(appState.openingBatchCount) || 10));
    const cachedPlatformPrices = appState.livePrices[livePriceKey(item.id, "", "standard")] || null;
    const containerPrice = Number.isFinite(Number(cachedPlatformPrices?.referencePrice)) && Number(cachedPlatformPrices.referencePrice) > 0
      ? Number(cachedPlatformPrices.referencePrice)
      : openingContainerPrice(item);
    const buffPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.buff?.price)) && Number(cachedPlatformPrices.platforms.buff.price) > 0
      ? Number(cachedPlatformPrices.platforms.buff.price)
      : null;
    const youpinPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.youpin?.price)) && Number(cachedPlatformPrices.platforms.youpin.price) > 0
      ? Number(cachedPlatformPrices.platforms.youpin.price)
      : null;
    return `
      <section class="unbox-simulator">
        <div class="unbox-simulator-copy">
          <p class="eyebrow">${escapeHtml(uiText("Interactive Unbox", "互动开箱"))}</p>
          <h2>${escapeHtml(openingTitle(item))}</h2>
          <p>${escapeHtml(openingDescription(item) || uiText("Spin through the real loot pool and simulate what this container could reveal.", "滚动真实掉落池，模拟这个容器可能开出的物品。"))}</p>
          <p class="unbox-odds-note">${escapeHtml(uiText("Case rarity odds follow Valve's published case model, and wear is generated as a specific float within each skin's real float range.", "武器箱稀有度概率遵循 Valve 公布的模型，磨损度会在每个皮肤真实的浮点范围内生成具体数值。"))}</p>
          <div class="collection-tags">
            <span>${escapeHtml(openingKindLabel(item.kind))}</span>
            ${openingPriceTagMarkup(item, containerPrice)}
            ${buffPrice ? `<span>${escapeHtml(`BUFF 路 ${formatPrice(buffPrice)}`)}</span>` : ""}
            ${youpinPrice ? `<span>${escapeHtml(`${uiText("YouPin", "悠悠有品")} 路 ${formatPrice(youpinPrice)}`)}</span>` : ""}
            <span>${escapeHtml(lootSummary)}</span>
            ${item.firstSaleDate ? `<span>${escapeHtml(firstSaleLabel(item.firstSaleDate))}</span>` : ""}
          </div>
          <div class="unbox-machine-actions">
            <button class="primary-link unbox-trigger" id="runOpeningButton" type="button"${lootEntries.length ? "" : " disabled"}>${escapeHtml(appState.openingSpinning ? uiText("Opening...", "开箱中...") : uiText("Open This Case", "开启这个箱子"))}</button>
            <label class="unbox-batch-control">
              <span>${escapeHtml(uiText("Multi-open", "连开"))}</span>
              <input id="openingBatchCount" type="number" min="1" max="50" step="1" value="${escapeHtml(String(batchCount))}" />
            </label>
            <button class="secondary-action unbox-batch-trigger" id="runOpeningBatchButton" type="button"${lootEntries.length ? "" : " disabled"}>${escapeHtml(uiText("Run Multi-open", "连开"))}</button>
          </div>
        </div>
        <div class="unbox-machine${appState.openingSpinning ? " is-spinning" : ""}" id="unboxMachine">
          <div class="unbox-machine-top">
            <button class="unbox-case-button" id="openCasePickerButton" type="button" aria-label="${escapeHtml(uiText("Choose another case", "选择其他箱子"))}">
              ${item.image ? `<img class="unbox-case-art" src="${escapeHtml(item.image)}" alt="${escapeHtml(openingTitle(item))}" loading="eager" />` : ""}
              <span>${escapeHtml(uiText("Click to Change Case", "点击更换箱子"))}</span>
            </button>
            <div class="unbox-machine-top-copy">
              <strong>${escapeHtml(uiText("Roll For Drop", "抽取掉落"))}</strong>
              <span>${escapeHtml(uiText("The marker stops on your simulated reward.", "指针会停在本次模拟获得的奖励上。"))}</span>
            </div>
          </div>
          <div class="unbox-reel-shell">
            <div class="unbox-reel-glow"></div>
            <div class="unbox-marker" aria-hidden="true"></div>
            <div class="unbox-reel-window" id="unboxReelWindow">
              <div class="unbox-reel-track" id="unboxReelTrack">${openingReelPreviewMarkup(item)}</div>
            </div>
          </div>
          <div class="unbox-result-panel" id="unboxResultPanel">
            ${openingResultMarkup(item, result)}
          </div>
          <div id="openingAnalyticsPanel">${openingFinanceAnalyticsMarkup(item)}</div>
          <div id="openingHistoryPanel">${openingHistory.length ? openingHistoryMarkup(openingHistory) : ""}</div>
        </div>
        <div class="unbox-pool-shell">
          <div class="unbox-pool-intro">
            <p class="eyebrow">${escapeHtml(uiText("Inside This Case", "箱内掉落"))}</p>
            <h3>${escapeHtml(uiText("Full Loot Pool", "完整掉落池"))}</h3>
            <span>${escapeHtml(uiText("Browse the exact listed contents of this container below.", "在下方查看该容器列出的完整掉落内容。"))}</span>
          </div>
          ${aiOpeningAnalysisMarkup(item.id)}
          ${openingLootPoolMarkup(item, { compact: true, detailLink: `item.html?id=${encodeURIComponent(item.id)}` })}
        </div>
      </section>
    `;
  }

  function setActiveOpening(id) {
    const next = openingById(id);
    if (!next) return;
    appState.activeOpeningId = next.id;
    appState.openingSpinning = false;
    persistOpeningState();
    renderOpenings();
  }

  function updateOpeningResultPanel(opening, result) {
    const panel = document.getElementById("unboxResultPanel");
    if (!panel) return;
    panel.innerHTML = openingResultMarkup(opening, result);
  }

  function updateOpeningHistoryPanel() {
    const panel = document.getElementById("openingHistoryPanel");
    if (!panel) return;
    const analyticsPanel = document.getElementById("openingAnalyticsPanel");
    const opening = ensureActiveOpening();
    if (analyticsPanel && opening) analyticsPanel.innerHTML = openingFinanceAnalyticsMarkup(opening);
    panel.innerHTML = appState.openingHistory.length ? openingHistoryMarkup(appState.openingHistory) : "";
  }

  function finalizeOpeningUi(opening, result, completedText) {
    const singleTrigger = document.getElementById("runOpeningButton");
    const batchTrigger = document.getElementById("runOpeningBatchButton");
    const machine = document.getElementById("unboxMachine");
    if (machine) machine.classList.remove("is-spinning");
    if (singleTrigger) {
      singleTrigger.textContent = uiText("Open Again", "再次开启");
      singleTrigger.removeAttribute("disabled");
    }
    if (batchTrigger) {
      batchTrigger.textContent = completedText;
      batchTrigger.removeAttribute("disabled");
    }
    updateOpeningResultPanel(opening, result);
    updateOpeningHistoryPanel();
    if (appState.openingDeferredRender && pageName() === "openings.html") {
      appState.openingDeferredRender = false;
      requestAnimationFrame(() => renderOpenings());
    }
  }

  function selectOpeningBatchResult(index) {
    const opening = ensureActiveOpening();
    if (!opening || appState.openingResultOpeningId !== opening.id) return;
    const result = appState.openingBatchResults[index];
    if (!result) return;
    appState.openingResult = result;
    persistOpeningState();
    updateOpeningResultPanel(opening, result);
    document.querySelectorAll("[data-opening-batch-index]").forEach((node) => {
      node.classList.toggle("is-landed", Number(node.getAttribute("data-opening-batch-index")) === index);
    });
    document.getElementById("unboxResultPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function selectOpeningHistory(index) {
    const entry = appState.openingHistory[index];
    if (!entry?.result) return;
    const opening = openingById(entry.openingId) || ensureActiveOpening();
    if (!opening) return;
    appState.activeOpeningId = opening.id;
    appState.openingResultOpeningId = opening.id;
    appState.openingResult = entry.result;
    appState.openingBatchResults = [];
    persistOpeningState();
    renderOpenings();
    document.getElementById("unboxResultPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function selectOpeningPoolResult(index) {
    const opening = ensureActiveOpening();
    if (!opening) return;
    const result = openingLootEntries(opening)[index];
    if (!result) return;
    appState.openingResultOpeningId = opening.id;
    appState.openingResult = result;
    appState.openingBatchResults = [];
    persistOpeningState();
    updateOpeningResultPanel(opening, result);
    document.getElementById("unboxResultPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function playOpeningSfx(winner = {}, { simplified = false } = {}) {
    playOpeningSample(OPENING_SFX.spin, 0, 0.5);
    playOpeningSample(OPENING_SFX.land, 5400, winner?.isRareSpecial ? 0.86 : 0.68);
    if (simplified) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    try {
      const context = globalThis.__cs2OpeningAudioContext || new AudioContextCtor();
      globalThis.__cs2OpeningAudioContext = context;
      context.resume?.().catch(() => {});
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
      master.gain.exponentialRampToValueAtTime(0.001, now + 6.05);
      master.connect(context.destination);

      const latchOsc = context.createOscillator();
      const latchGain = context.createGain();
      latchOsc.type = "square";
      latchOsc.frequency.setValueAtTime(180, now);
      latchOsc.frequency.exponentialRampToValueAtTime(90, now + 0.055);
      latchGain.gain.setValueAtTime(0.0001, now);
      latchGain.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
      latchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      latchOsc.connect(latchGain).connect(master);
      latchOsc.start(now);
      latchOsc.stop(now + 0.08);

      for (let index = 0; index < 38; index += 1) {
        const tickAt = now + 0.07 + index * 0.088 + Math.min(index, 24) * 0.01;
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1120 - Math.min(index, 28) * 22, tickAt);
        gain.gain.setValueAtTime(0.0001, tickAt);
        gain.gain.exponentialRampToValueAtTime(0.09, tickAt + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, tickAt + 0.032);
        osc.connect(gain).connect(master);
        osc.start(tickAt);
        osc.stop(tickAt + 0.05);
      }

      const landAt = now + 5.42;
      const lowOsc = context.createOscillator();
      const lowGain = context.createGain();
      lowOsc.type = "triangle";
      lowOsc.frequency.setValueAtTime(winner?.isRareSpecial ? 420 : 320, landAt);
      lowOsc.frequency.exponentialRampToValueAtTime(winner?.isRareSpecial ? 700 : 520, landAt + 0.18);
      lowGain.gain.setValueAtTime(0.0001, landAt);
      lowGain.gain.exponentialRampToValueAtTime(winner?.isRareSpecial ? 0.24 : 0.16, landAt + 0.018);
      lowGain.gain.exponentialRampToValueAtTime(0.0001, landAt + 0.42);
      lowOsc.connect(lowGain).connect(master);
      lowOsc.start(landAt);
      lowOsc.stop(landAt + 0.46);

      const highOsc = context.createOscillator();
      const highGain = context.createGain();
      highOsc.type = winner?.isRareSpecial ? "sawtooth" : "sine";
      highOsc.frequency.setValueAtTime(winner?.isRareSpecial ? 840 : 620, landAt + 0.02);
      highOsc.frequency.exponentialRampToValueAtTime(winner?.isRareSpecial ? 1420 : 860, landAt + 0.22);
      highGain.gain.setValueAtTime(0.0001, landAt + 0.02);
      highGain.gain.exponentialRampToValueAtTime(winner?.isRareSpecial ? 0.18 : 0.11, landAt + 0.04);
      highGain.gain.exponentialRampToValueAtTime(0.0001, landAt + 0.5);
      highOsc.connect(highGain).connect(master);
      highOsc.start(landAt + 0.02);
      highOsc.stop(landAt + 0.54);
    } catch {}
  }

  function playOpeningSample(src, delayMs = 0, volume = 0.5) {
    if (!src) return;
    window.setTimeout(() => {
      try {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.crossOrigin = "anonymous";
        audio.volume = Math.max(0, Math.min(1, Number(volume) || 0.5));
        audio.play().catch(() => {});
      } catch {}
    }, Math.max(0, Number(delayMs) || 0));
  }

  function unlockOpeningAudio() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    try {
      const context = globalThis.__cs2OpeningAudioContext || new AudioContextCtor();
      globalThis.__cs2OpeningAudioContext = context;
      context.resume?.().catch(() => {});
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1, now);
      gain.gain.setValueAtTime(0.00001, now);
      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch {}
  }

  function startOpeningAnimation(opening, winner, { loadingText, completedText, onComplete, simplifiedAudio = false }) {
    const track = document.getElementById("unboxReelTrack");
    const windowNode = document.getElementById("unboxReelWindow");
    const machine = document.getElementById("unboxMachine");
    const shell = windowNode?.closest(".unbox-reel-shell");
    const marker = shell?.querySelector(".unbox-marker");
    const singleTrigger = document.getElementById("runOpeningButton");
    const batchTrigger = document.getElementById("runOpeningBatchButton");
    if (!winner || !track || !windowNode || !machine || !singleTrigger || !batchTrigger) return;

    const sequence = buildOpeningSpinSequence(opening, winner);
    const winnerIndex = sequence.findIndex((entry) => entry.__spinWinner);
    track.getAnimations?.().forEach((animation) => animation.cancel());
    track.innerHTML = sequence.map((entry) => openingLootCardMarkup(entry, { compact: true })).join("");
    track.style.transition = "none";
    track.style.transform = "translate3d(0, 0, 0)";
    machine.classList.add("is-spinning");
    appState.openingSpinning = true;
    const animationToken = appState.openingAnimationToken + 1;
    appState.openingAnimationToken = animationToken;
    singleTrigger.textContent = loadingText;
    batchTrigger.textContent = loadingText;
    singleTrigger.setAttribute("disabled", "disabled");
    batchTrigger.setAttribute("disabled", "disabled");
    updateOpeningResultPanel(opening, null);
    playOpeningSfx(winner, { simplified: simplifiedAudio });

    void track.offsetWidth;
    const firstCard = track.querySelector(".unbox-loot-card");
    const cardsBeforeSpin = [...track.querySelectorAll(".unbox-loot-card")];
    const winnerCardBeforeSpin = cardsBeforeSpin[winnerIndex] || firstCard;
    const cardWidth = winnerCardBeforeSpin?.getBoundingClientRect().width || firstCard?.getBoundingClientRect().width || 152;
    const gap = Number.parseFloat(getComputedStyle(track).gap || "14") || 14;
    const frameWidth = windowNode.getBoundingClientRect().width || 820;
    const winnerCenter = (winnerCardBeforeSpin?.offsetLeft || (winnerIndex * (cardWidth + gap))) + (cardWidth / 2);
    const frameCenter = frameWidth / 2;
    const windowStyle = getComputedStyle(windowNode);
    const paddingLeft = Number.parseFloat(windowStyle.paddingLeft || "0") || 0;
    const target = Math.max(0, winnerCenter - (frameCenter - paddingLeft));
    const shellRect = shell?.getBoundingClientRect();
    const windowRect = windowNode.getBoundingClientRect();
    if (marker && shellRect) {
      const markerCenter = windowRect.left - shellRect.left + frameCenter;
      marker.style.setProperty("--unbox-marker-left", `${markerCenter}px`);
      marker.style.setProperty("--unbox-marker-width", `${Math.round(cardWidth)}px`);
    }

    requestAnimationFrame(() => {
      track.style.transition = "transform 5.4s cubic-bezier(0.08, 0.75, 0.08, 1)";
      track.style.transform = `translate3d(${-target}px, 0, 0)`;
      track.style.filter = "blur(0px)";
    });

    window.setTimeout(() => {
      if (animationToken !== appState.openingAnimationToken || pageName() !== "openings.html") return;
      appState.openingSpinning = false;
      const cards = [...track.querySelectorAll(".unbox-loot-card")];
      const winnerCard = cards[winnerIndex];
      if (winnerCard) winnerCard.classList.add("is-landed");
      onComplete?.();
    }, 5600);
  }

  function runOpeningSimulation() {
    const opening = ensureActiveOpening();
    if (!opening || appState.openingSpinning) return;
    unlockOpeningAudio();
    const winner = pickOpeningReward(opening);
    startOpeningAnimation(opening, winner, {
      loadingText: uiText("Opening...", "开箱中..."),
      completedText: uiText("Run Multi-open", "连开"),
      simplifiedAudio: false,
      onComplete: () => {
        appState.openingSpinning = false;
        appState.openingResult = winner;
        appState.openingResultOpeningId = opening.id;
        appState.openingBatchResults = [];
        pushOpeningHistory(opening, [winner]);
        persistOpeningState();
        finalizeOpeningUi(opening, winner, uiText("Run Multi-open", "连开"));
      }
    });
  }

  function normalizeOpeningBatchCount(value) {
    const count = Math.floor(Number(value) || 1);
    return Math.min(50, Math.max(1, count));
  }

  function runOpeningBatchSimulation() {
    const opening = ensureActiveOpening();
    if (!opening || appState.openingSpinning) return;
    unlockOpeningAudio();
    const count = normalizeOpeningBatchCount(document.getElementById("openingBatchCount")?.value || appState.openingBatchCount);
    appState.openingBatchCount = count;
    const results = [];
    for (let index = 0; index < count; index += 1) {
      const reward = pickOpeningReward(opening);
      if (reward) results.push(reward);
    }
    const featured = highestQualityOpeningResult(results);
    if (!featured) return;
    startOpeningAnimation(opening, featured, {
      loadingText: uiText("Multi-opening...", "连开中..."),
      completedText: uiText("Run Multi-open Again", "再次连开"),
      simplifiedAudio: true,
      onComplete: () => {
        appState.openingBatchResults = results;
        appState.openingResult = featured;
        appState.openingResultOpeningId = opening.id;
        pushOpeningHistory(opening, results);
        persistOpeningState();
        finalizeOpeningUi(opening, featured, uiText("Run Multi-open Again", "再次连开"));
      }
    });
  }

  function isFavorite(id) {
    return getUserState().favorites.includes(id);
  }

  function isCompared(id) {
    return getUserState().compare.includes(id);
  }

  function rarityRank(item) {
    const value = firstNonEmpty(item.rarityEn, item.rarity, rarityLabel(item));
    if (/Contraband/i.test(value)) return 8;
    if (/Covert/i.test(value)) return 7;
    if (/Extraordinary/i.test(value)) return 6;
    if (/Classified/i.test(value)) return 5;
    if (/Restricted/i.test(value)) return 4;
    if (/Mil-Spec/i.test(value)) return 3;
    if (/Industrial/i.test(value)) return 2;
    if (/Consumer/i.test(value)) return 1;
    return 0;
  }

  function formatDateTime(value) {
    if (!value) return uiText("Not yet", "尚未执行");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return uiText("Unknown", "未知");
    return date.toLocaleString(currentLanguage() === "zh-CN" ? "zh-CN" : undefined);
  }

  function shouldShowHomeIntro() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return false;
    try {
      if (new URLSearchParams(location.search).get("intro") === "1") return true;
      if (location.pathname === "/" || /\/index\.html$/i.test(location.pathname)) return true;
      if (sessionStorage.getItem("cs-exhibition:intro-seen") === "true") return false;
      sessionStorage.setItem("cs-exhibition:intro-seen", "true");
      return true;
    } catch {
      return true;
    }
  }

  function buildHomeMarkup() {
    const heroAsset = "assets/home-awp-exhibit-render.webp";
    const heroItem = items.find((entry) => /asiimov/i.test(entry?.nameEn || entry?.name || "") && entry.image) || items.find((entry) => entry.image) || items[0] || null;
    const inspectHref = heroItem ? itemHref(heroItem) : "item.html?id=ak-inheritance";
    const featured = (typeof featuredHomeItems === "function" ? featuredHomeItems() : items.filter((entry) => entry.image)).slice(0, 4);
    const marketRows = featured.slice(0, 4);
    const commandCards = [
      ["archive", "Archive", uiText("Search every exhibit", "??????"), "catalog.html"],
      ["halls", "Halls", uiText("Browse collection wings", "??????"), "collections.html"],
      ["inspect", "Inspect", uiText("Open one object in the ledger", "????????"), inspectHref],
      ["saved", "Saved", uiText("Return to your private case", "??????"), "favorites.html"],
      ["trail", "Trail", uiText("Pick up recent inspection trails", "????????"), "recent.html"],
      ["drop", "Drop Theatre", uiText("Simulate openings and ROI", "???????"), "openings.html"],
      ["pass", "Pass", uiText("Manage access and sync", "???????"), "account.html"],
      ["vault", "Vault", uiText("Review synced inventory", "??????"), "inventory.html"],
      ["curator", "Curator", uiText("Generate AI loadouts", "?? AI ??"), "loadout.html"]
    ];

    return `
      <section class="hero home-hero" aria-label="${escapeHtml(uiText("CS Exhibition home", "CS Exhibition ??"))}">
        <div class="home-hero-copy">
          <p class="eyebrow home-console-kicker">${escapeHtml(uiText("Counter-Strike Digital Exhibition", "Counter-Strike ????"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("CS Exhibition", "CS Exhibition"))}</h1>
          <p class="home-subtitle">${escapeHtml(uiText("Preserve. Inspect. Understand.", "?????????"))}</p>
          <p data-motion-part="copy">${escapeHtml(uiText("A black-box exhibition shell for skins, prices, collections, inventory sync, and curator-grade recommendations.", "????????????????????????????????"))}</p>
          <div class="hero-actions">
            <a class="primary-link" href="catalog.html">${escapeHtml(uiText("Enter Archive", "????"))}</a>
            <a class="secondary-link" href="openings.html">${escapeHtml(uiText("Open Drop Theatre", "??????"))}</a>
            <a class="secondary-link" href="loadout.html">${escapeHtml(uiText("Ask Curator", "????"))}</a>
          </div>
        </div>
        <div class="home-hero-stage" aria-hidden="true">
          <div class="home-stage-frame">
            <div class="home-stage-noise"></div>
            <div class="home-museum-backdrop"></div>
            <div class="home-display-case"></div>
            <img class="home-rendered-exhibit" src="${heroAsset}" alt="AWP | Asiimov" loading="eager" decoding="async" />
            <img class="home-hero-object" src="${heroAsset}" alt="" loading="eager" decoding="async" />
            <span class="home-stage-line"></span>
            <div class="home-stage-caption"><strong>AWP | Asiimov</strong><span>Featured Exhibit Render</span></div>
            <div class="home-exhibit-plaque"><strong>AWP | Asiimov</strong><span>Archive Render</span><small>North Wing Object Plate</small></div>
          </div>
        </div>
        <div class="home-live-rail">
          <article class="home-live-cell"><span>${escapeHtml(uiText("Status", "??"))}</span><strong>Archive Online</strong><small>${escapeHtml(uiText("Full exhibit graph ready", "???????"))}</small></article>
          <article class="home-live-cell"><span>${escapeHtml(uiText("Price Plates", "????"))}</span><strong>BUFF + YouPin</strong><small>${escapeHtml(uiText("Reference sync active", "??????"))}</small></article>
          <article class="home-live-cell home-live-latest"><img src="${heroAsset}" alt="AWP | Asiimov" loading="lazy" decoding="async" /><span>${escapeHtml(uiText("Latest Focus", "????"))}</span><strong>AWP | Asiimov</strong><small>${escapeHtml(uiText("Immersive exhibit render", "???????"))}</small></article>
          <article class="home-live-cell"><span>${escapeHtml(uiText("Curator", "??"))}</span><strong>${escapeHtml(uiText("Loadout Studio", "?????"))}</strong><small>${escapeHtml(uiText("AI routes standing by", "AI ?????"))}</small></article>
        </div>
      </section>
      <section class="home-command-section">
        <div class="home-command-grid" aria-label="${escapeHtml(uiText("Primary entrances", "????"))}">
          ${commandCards.map(([tone, title, copy, href]) => `
            <a class="home-command-card is-${tone}" href="${href}">
              <i aria-hidden="true"></i>
              <span>${escapeHtml(title)}</span>
              <strong>${escapeHtml(copy)}</strong>
              <em>${escapeHtml(uiText("Enter", "??"))}</em>
            </a>
          `).join("")}
        </div>
      </section>
      <section class="home-operations-grid">
        <article class="home-market-panel">
          <div class="home-panel-heading"><h2>${escapeHtml(uiText("Market Index", "????"))}</h2><a href="catalog.html">${escapeHtml(uiText("Open Archive", "????"))}</a></div>
          <div class="home-market-tabs"><span>${escapeHtml(uiText("Reference", "???"))}</span><span>BUFF</span><span>YouPin</span></div>
          <div class="home-market-table">
            ${marketRows.map((item, index) => `
              <a href="${itemHref(item)}">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(itemTitle(item))}" loading="lazy" decoding="async" />` : `<div class="home-market-fallback-thumb"></div>`}
                <strong>${escapeHtml(itemTitle(item))}</strong>
                <span>${escapeHtml(collectionLabel(item))}</span>
                <span>${escapeHtml(categoryLabel(item.type))}</span>
                <span>${escapeHtml(formatPrice(effectiveCatalogPriceRecord(item).price))}</span>
                <em>${String(index + 1).padStart(2, "0")}</em>
              </a>
            `).join("")}
          </div>
          <footer><span>${escapeHtml(uiText("Live prices remain linked to the existing price system.", "??????????????"))}</span><span>AWP | Asiimov</span></footer>
        </article>
        <article class="home-ai-panel">
          <div class="home-panel-heading"><h2>${escapeHtml(uiText("Curator Feed", "????"))}</h2><a href="loadout.html">${escapeHtml(uiText("Open Curator", "????"))}</a></div>
          <div class="home-ai-body">
            <div class="home-agent-figure"></div>
            <div class="home-ai-list">
              <h3>${escapeHtml(uiText("Curator Routes", "????"))}</h3>
              <p>${escapeHtml(uiText("Budget-aware pairings, inventory upgrades, and pro reference boards stay on the same rail.", "???????????????????????????"))}</p>
              <span><b>${escapeHtml(uiText("Budget Pairing", "????"))}</b><small>${escapeHtml(uiText("AI-curated loadouts", "AI ????"))}</small></span>
              <span><b>${escapeHtml(uiText("Same-Color Upgrade", "????"))}</b><small>${escapeHtml(uiText("Inventory-aware suggestions", "???????"))}</small></span>
              <span><b>${escapeHtml(uiText("Pro References", "????"))}</b><small>${escapeHtml(uiText("Team and player samples", "???????"))}</small></span>
            </div>
          </div>
          <footer><span>${escapeHtml(uiText("Curator line warm", "???????"))}</span><i aria-hidden="true"></i></footer>
        </article>
      </section>
      <section class="home-subscribe-strip">
        <h2>${escapeHtml(uiText("Keep The Exhibition Rail In Reach", "???????????"))}</h2>
        <p>${escapeHtml(uiText("Jump back into archive review, inspection, and synchronized inventory work without losing context.", "???????????????????????????"))}</p>
        <form>
          <input type="email" value="curator@cs-exhibition.local" aria-label="${escapeHtml(uiText("Subscription email", "????"))}" />
          <button type="button">${escapeHtml(uiText("Pin Access", "????"))}</button>
        </form>
        <a href="account.html">${escapeHtml(uiText("Manage Pass", "????"))}</a>
      </section>
      ${featured.length ? `<section class="featured-section"><div class="section-heading"><p class="eyebrow">${escapeHtml(uiText("Objects in View", "????"))}</p><h2>${escapeHtml(uiText("Selected Exhibits", "????"))}</h2></div><div class="item-grid">${featured.map(cardMarkup).join("")}</div></section>` : ""}
    `;
  }

  function cardMarkup(item) {
    const includeImages = shouldRenderDeferredImages("catalog.html");
    const itemWear = defaultWearForItem(item);
    const priceRecord = effectiveCatalogPriceRecord(item);
    return `
      <article class="item-card">
        <button class="card-favorite-button" type="button" data-favorite-id="${escapeHtml(item.id)}" aria-pressed="${isFavorite(item.id)}">${escapeHtml(isFavorite(item.id) ? uiText("Saved", "已收藏") : uiText("Save", "收藏"))}</button>
        <button class="card-compare-button" type="button" data-compare-id="${escapeHtml(item.id)}" aria-pressed="${isCompared(item.id)}">${escapeHtml(isCompared(item.id) ? uiText("Remove Compare", "移出对比") : uiText("Compare", "对比"))}</button>
        <a class="item-card-link item-card-hit" href="${itemHref(item)}">
          <div class="mini-stage">
            ${item.image
              ? (includeImages
                ? lazyImageMarkup({ className: `skin-image${item.type === "music-box" ? " music-box-image" : ""}`, src: item.image, alt: itemTitle(item), loading: "lazy", decoding: "async", fetchpriority: "low" })
                : deferredImagePlaceholder(uiText("Loading preview", "正在加载预览")))
              : `<div class="empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
          </div>
          <div class="card-meta">
            <span>${escapeHtml(categoryLabel(item.type))}</span>
            <strong>${escapeHtml(itemTitle(item))}</strong>
            <small>${escapeHtml(collectionLabel(item))}</small>
            <div class="card-footer">
              <span>${escapeHtml(rarityLabel(item))}</span>
              ${itemWear ? `<span>${escapeHtml(wearLabel(itemWear))}</span>` : ""}
            </div>
            <div class="card-price">${escapeHtml(formatPrice(priceRecord.price))}</div>
          </div>
        </a>
        <div class="item-card-actions">
        </div>
      </article>
    `;
  }

  function favoriteCardMarkup(item) {
    const includeImages = shouldRenderDeferredImages(pageName());
    const href = itemHref(item);
    const favorited = isFavorite(item.id);
    const priceRecord = effectiveCatalogPriceRecord(item);
    return `
      <article class="favorite-card inventory-item-clickable" data-href="${escapeHtml(href)}" tabindex="0" role="link">
        <div class="favorite-preview">
          ${item.image
            ? (includeImages
              ? lazyImageMarkup({ className: "favorite-base", src: item.image, alt: itemTitle(item), loading: "lazy", decoding: "async", fetchpriority: "low" })
              : deferredImagePlaceholder(uiText("Loading preview", "正在加载预览")))
            : `<div class="empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
        </div>
        <div class="favorite-copy">
          <small>${escapeHtml(collectionLabel(item))}</small>
          <strong>${escapeHtml(itemTitle(item))}</strong>
          <span>${escapeHtml(formatPrice(priceRecord.price))}</span>
          <div class="steam-bind-actions">
            <a href="${href}">${escapeHtml(uiText("Open Inspector", "打开检视器"))}</a>
            <button class="secondary-action compact-action" type="button" data-favorite-id="${escapeHtml(item.id)}" aria-pressed="${favorited}">${escapeHtml(favorited ? uiText("Remove Favorite", "取消收藏") : uiText("Save", "收藏"))}</button>
          </div>
        </div>
      </article>
    `;
  }

  function compareChipMarkup(item) {
    return `
      <article class="compare-chip">
        ${item.image ? lazyImageMarkup({ src: item.image, alt: itemTitle(item), loading: "lazy" }) : `<div></div>`}
        <div>
          <strong>${escapeHtml(itemTitle(item))}</strong>
          <small>${escapeHtml(collectionLabel(item))}</small>
        </div>
        <a href="${itemHref(item)}">${escapeHtml(uiText("View", "查看"))}</a>
      </article>
    `;
  }

  function collectionBucketMeta(bucket) {
    if (bucket === "weapon-case") {
      return {
        eyebrow: uiText("Weapon Cases", "武器箱"),
        title: uiText("Weapon Cases", "武器箱"),
        description: uiText("Cases that open into weapon skins, knives, gloves, and related drops.", "可开出武器皮肤、刀具、手套及相关掉落的箱子。")
      };
    }
    if (bucket === "souvenir-package") {
      return {
        eyebrow: uiText("Souvenir Packages", "纪念品包"),
        title: uiText("Souvenir Packages", "纪念品包"),
        description: uiText("Tournament souvenir packages grouped from the collection database.", "从收藏数据库整理出的赛事纪念品包。")
      };
    }
    if (bucket === "collection") {
      return {
        eyebrow: uiText("Collections", "收藏品系列"),
        title: uiText("Collections", "收藏品系列"),
        description: uiText("Map collections and standard item collections.", "\u5730\u56fe\u6536\u85cf\u54c1\u4e0e\u5e38\u89c4\u9970\u54c1\u6536\u85cf\u7cfb\u5217\u3002")
      };
    }
    if (bucket === "capsule") {
      return {
        eyebrow: uiText("Capsules", "鑳跺泭"),
        title: uiText("Capsules", "鑳跺泭"),
        description: uiText("Sticker capsules, autograph capsules, patch capsules, and similar drops.", "贴纸胶囊、签名胶囊、印花胶囊及类似掉落。")
      };
    }
    return {
      eyebrow: uiText("Other", "其他"),
      title: uiText("Other", "其他"),
      description: uiText("Everything that does not cleanly fit the main collection groups.", "所有不适合归入主要分组的其他物品。")
    };
  }

  function classifyCollectionBucket(entry, kindLookup = openingKindLookup()) {
    const resolvedKind = firstNonEmpty(
      entry?.kind,
      kindLookup.get(String(entry?.name || "").trim()),
      kindLookup.get(String(entry?.collectionEn || "").trim()),
      kindLookup.get(String(entry?.collectionZh || "").trim())
    );
    if (resolvedKind === "weapon-case") return "weapon-case";
    if (resolvedKind === "souvenir-package") return "souvenir-package";
    if (resolvedKind === "capsule") return "capsule";
    if (["music-kit-box", "package", "container"].includes(resolvedKind)) return "other";

    const text = [
      entry?.name,
      entry?.collectionEn,
      entry?.collectionZh,
      ...(Array.isArray(entry?.types) ? entry.types : [])
    ].filter(Boolean).join(" ").toLowerCase();
    if (/souvenir package|\u7eaa\u5ff5\u54c1\u5305/.test(text)) return "souvenir-package";
    if (/souvenir package|\u7eaa\u5ff5\u54c1\u5305/.test(text)) return "souvenir-package";
    if (/capsule|鑳跺泭|autograph|sticker capsule|patch capsule/.test(text)) return "capsule";
    if (/weapon case|姝﹀櫒绠眧\bcase\b/.test(text)) return "weapon-case";

    const types = Array.isArray(entry?.types) ? entry.types.filter(Boolean) : [];
    if (types.length && types.every((type) => type === "sticker")) return "capsule";
    if (types.some((type) => ["agent", "music-box", "equipment"].includes(type))) return "other";
    return "collection";
  }

  function buildCollectionSummaries() {
    const counts = new Map();
    items.forEach((item) => {
      const label = collectionLabel(item);
      const entry = counts.get(label) || { count: 0, collectionEn: "", collectionZh: "", types: new Set(), previewImage: "", previewLabel: "" };
      entry.count += 1;
      entry.collectionEn = firstNonEmpty(entry.collectionEn, item.collectionEn, item.collection, label);
      entry.collectionZh = firstNonEmpty(entry.collectionZh, item.collectionZh, label);
      entry.types.add(item.type || "");
      if (!entry.previewImage && item.image) {
        entry.previewImage = item.image;
        entry.previewLabel = itemTitle(item);
      }
      counts.set(label, entry);
    });
    const kindLookup = openingKindLookup();
    return [...counts.entries()].map(([name, entry]) => ({
      name,
      count: entry.count,
      collectionEn: entry.collectionEn,
      collectionZh: entry.collectionZh,
      types: [...entry.types].filter(Boolean),
      previewImage: entry.previewImage,
      previewLabel: entry.previewLabel,
      bucket: classifyCollectionBucket({
        name,
        collectionEn: entry.collectionEn,
        collectionZh: entry.collectionZh,
        types: [...entry.types].filter(Boolean)
      }, kindLookup)
    }));
  }

  function collectionCardMarkup(name, count, bucket) {
    return `
      <article class="collection-card">
        <p class="eyebrow">${escapeHtml(collectionBucketMeta(bucket).eyebrow)}</p>
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(uiTemplate("{count} items", { count }))}</p>
        <a href="catalog.html?collection=${encodeURIComponent(name)}">${escapeHtml(uiText("View Hall", "查看展区"))}</a>
      </article>
    `;
  }

  function renderHome() {
    if (pageName() !== "index.html") return;
    const main = document.querySelector("main");
    document.body.classList.add("home-exhibition-page");
    document.body.classList.remove("halls-directory-page", "is-inspector-page");
    if (main) main.innerHTML = buildHomeMarkup();
  }

  function scheduleUiTask(callback, { afterFrames = 1, fallbackMs = 24 } = {}) {
    const frameCount = Math.max(1, Number(afterFrames) || 1);
    const delay = Math.max(0, Number(fallbackMs) || 0);
    let settled = false;

    const run = () => {
      if (settled) return;
      settled = true;
      callback();
    };

    const queueFrame = (remaining) => {
      if (remaining <= 0) {
        run();
        return;
      }
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => queueFrame(remaining - 1));
        return;
      }
      window.setTimeout(() => queueFrame(remaining - 1), delay);
    };

    queueFrame(frameCount);
    window.setTimeout(run, delay * Math.max(1, frameCount));
  }

  function shouldDeferPageImages(targetPage = pageName()) {
    return ["catalog.html", "collections.html", "favorites.html", "recent.html"].includes(targetPage);
  }

  function shouldRenderDeferredImages(targetPage = pageName()) {
    if (!shouldDeferPageImages(targetPage)) return true;
    return appState.deferredImagePage !== targetPage || appState.deferredImageReady;
  }

  function deferredImagePlaceholder(label = "") {
    return `<div class="deferred-media-placeholder" aria-hidden="true">${label ? `<span>${escapeHtml(label)}</span>` : ""}</div>`;
  }

  function prepareDeferredImageState(targetPage = pageName()) {
    if (!shouldDeferPageImages(targetPage)) {
      appState.deferredImagePage = "";
      appState.deferredImageReady = true;
      appState.deferredImageHydrationScheduled = false;
      return;
    }
    if (appState.deferredImagePage !== targetPage) {
      appState.deferredImagePage = targetPage;
      appState.deferredImageReady = false;
      appState.deferredImageHydrationScheduled = false;
    }
  }

  function renderPageContent(targetPage = pageName()) {
    updateInspectorNavLink();
    if (targetPage === "index.html") {
      renderHome();
    } else if (targetPage === "catalog.html") {
      renderCatalog();
      renderCompareTray();
    } else if (targetPage === "collections.html") {
      renderCollections();
    } else if (targetPage === "openings.html") {
      renderOpenings();
    } else if (targetPage === "item.html") {
      renderItemDetail();
      renderCompareTray();
    } else if (targetPage === "favorites.html") {
      renderFavorites();
      renderCompareTray();
    } else if (targetPage === "recent.html") {
      renderRecent();
      renderCompareTray();
    } else if (targetPage === "account.html") {
      renderAccount();
    } else if (targetPage === "inventory.html") {
      renderInventory();
    } else if (targetPage === "loadout.html") {
      renderLoadout();
    }
  }

  function hydrateDeferredImagesForPage(targetPage = pageName()) {
    if (targetPage === "catalog.html") {
      updateCatalogResults();
      renderCompareTray();
      return;
    }
    if (targetPage === "collections.html") {
      renderCollections();
      return;
    }
    if (targetPage === "favorites.html") {
      renderFavorites();
      renderCompareTray();
      return;
    }
    if (targetPage === "recent.html") {
      renderRecent();
      renderCompareTray();
    }
  }

  function scheduleDeferredImageHydration(targetPage = pageName()) {
    if (!shouldDeferPageImages(targetPage) || appState.deferredImageReady || appState.deferredImageHydrationScheduled) return;
    appState.deferredImageHydrationScheduled = true;
    scheduleUiTask(() => {
      appState.deferredImageHydrationScheduled = false;
      if (appState.deferredImagePage !== targetPage) return;
      appState.deferredImageReady = true;
      hydrateDeferredImagesForPage(targetPage);
      markActiveNavigation();
    }, { afterFrames: 2 });
  }

  function collectionCardWithPreviewMarkup(entry, bucket) {
    const includeImages = shouldRenderDeferredImages("collections.html");
    const previewImage = entry?.previewImage || "";
    const previewLabel = entry?.previewLabel || entry?.name || "";
    return `
      <article class="collection-card">
        ${previewImage
          ? (includeImages
            ? lazyImageMarkup({ className: "collection-cover", src: previewImage, alt: previewLabel, loading: "lazy", decoding: "async", fetchpriority: "low" })
            : `<div class="collection-cover deferred-media-frame">${deferredImagePlaceholder(uiText("Loading preview", "正在加载预览"))}</div>`)
          : `<div class="collection-cover empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
        <div class="collection-copy">
          <p class="eyebrow">${escapeHtml(collectionBucketMeta(bucket).eyebrow)}</p>
          <h3>${escapeHtml(entry.name)}</h3>
          <p>${escapeHtml(uiTemplate("{count} items", { count: entry.count }))}</p>
          <a href="catalog.html?collection=${encodeURIComponent(entry.name)}">${escapeHtml(uiText("View Hall", "查看展区"))}</a>
        </div>
      </article>
    `;
  }

  function buildCatalogShell() {
    return `
      <section class="page-intro archive-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Archive", "\u9986\u85cf"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Archive", "Archive"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Search the complete CS exhibit archive by weapon type, collection, rarity, and market range.", "\u6309\u6b66\u5668\u7c7b\u578b\u3001\u6536\u85cf\u7cfb\u5217\u3001\u7a00\u6709\u5ea6\u548c\u5e02\u573a\u533a\u95f4\u68c0\u7d22\u5b8c\u6574 CS \u5c55\u54c1\u9986\u85cf\u3002"))}</p>
      </section>
      <section class="catalog-shell exhibition-console">
        <aside class="filter-panel">
          <div class="filter-group">
            <label for="searchInput">${escapeHtml(uiText("Keyword", "关键词"))}</label>
            <input id="searchInput" type="search" placeholder="${escapeHtml(uiText("Search exhibits or weapons", "\u641c\u7d22\u5c55\u54c1\u6216\u6b66\u5668"))}" />
          </div>
          <div class="filter-group">
            <label for="typeFilter">${escapeHtml(uiText("Weapon Type", "武器类型"))}</label>
            <input id="typeFilter" type="hidden" />
            <button class="picker-trigger" id="openTypePicker" type="button">
              <span id="typeFilterLabel">${escapeHtml(uiText("Any", "不限"))}</span>
              <strong>${escapeHtml(uiText("Select", "选择"))}</strong>
            </button>
          </div>
          <div class="filter-group">
            <label for="rarityFilter">${escapeHtml(uiText("Rarity", "稀有度"))}</label>
            <input id="rarityFilter" type="hidden" />
            <button class="picker-trigger" id="openRarityPicker" type="button">
              <span id="rarityFilterLabel">${escapeHtml(uiText("Any", "不限"))}</span>
              <strong>${escapeHtml(uiText("Select", "选择"))}</strong>
            </button>
          </div>
          <div class="filter-group">
            <label for="collectionFilter">${escapeHtml(uiText("Hall / Collection", "\u5c55\u533a / \u7cfb\u5217"))}</label>
            <input id="collectionFilter" type="hidden" />
            <button class="picker-trigger" id="openCollectionPicker" type="button">
              <span id="collectionFilterLabel">${escapeHtml(uiText("Any", "不限"))}</span>
              <strong>${escapeHtml(uiText("Select", "选择"))}</strong>
            </button>
          </div>
          <div class="filter-group">
            <label for="priceFilter">${escapeHtml(uiText("Max Reference Price", "最高参考价"))}</label>
            <input id="priceFilter" type="range" min="0" max="5000" step="50" value="5000" />
            <small id="priceValue">${escapeHtml(uiText("Any", "不限"))}</small>
          </div>
          <div class="filter-actions">
            <button class="secondary-action" id="resetFilters" type="button">${escapeHtml(uiText("Reset Filters", "重置筛选"))}</button>
          </div>
        </aside>
        <section class="catalog-results">
          <div class="catalog-control-bar" aria-label="${escapeHtml(uiText("Catalog Toolbar", "?????"))}">
            <label class="catalog-sort-control" for="sortFilter">
              <span>${escapeHtml(uiText("Sort", "排序"))}</span>
              <select id="sortFilter">
                <option value="featured">${escapeHtml(uiText("Featured", "推荐优先"))}</option>
                <option value="price-asc">${escapeHtml(uiText("Price: Low to High", "价格从低到高"))}</option>
                <option value="price-desc">${escapeHtml(uiText("Price: High to Low", "价格从高到低"))}</option>
                <option value="rarity-desc">${escapeHtml(uiText("Rarity First", "稀有度优先"))}</option>
                <option value="name-asc">${escapeHtml(uiText("Name A-Z", "名称排序"))}</option>
              </select>
            </label>
            <button class="secondary-action catalog-share-button" id="shareCatalogLink" type="button">${escapeHtml(uiText("Copy Link", "复制链接"))}</button>
          </div>
          <div class="item-grid" id="itemGrid"></div>
          <button class="load-more-button" id="loadMore" type="button">${escapeHtml(uiText("Load More", "加载更多"))}</button>
          <section class="compare-tray" id="compareTray" hidden></section>
        </section>
      </section>
    `;
  }

  function buildPickerShell(id, title, searchLabel, closeId, clearId, confirmId, optionsId) {
    return `
      <div class="collection-picker" id="${id}" hidden>
        <button class="picker-backdrop" type="button" aria-label="${escapeHtml(uiText("Close picker", "关闭选择器"))}"></button>
        <div class="picker-dialog">
          <div class="picker-header">
            <h2>${escapeHtml(title)}</h2>
            <button class="picker-close" type="button" id="${closeId}">${escapeHtml(uiText("Close", "关闭"))}</button>
          </div>
          <div class="picker-search">
            <input id="${searchLabel}" type="search" placeholder="${escapeHtml(uiText("Search", "鎼滅储"))}" />
          </div>
          <div class="picker-groups">
            <div class="picker-option-grid" id="${optionsId}"></div>
          </div>
          <div class="picker-actions">
            <button class="secondary-action" id="${clearId}" type="button">${escapeHtml(uiText("Clear", "娓呯┖"))}</button>
            <button class="primary-action" id="${confirmId}" type="button">${escapeHtml(uiText("Confirm", "确认"))}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCollectionPickerOptions(rootId, options, selectedValue, formatter) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = options.map((value) => `
      <button class="collection-option${selectedValue === value ? " selected" : ""}" type="button" data-picker-value="${escapeHtml(value)}">
        <span>${escapeHtml(formatter(value))}</span>
      </button>
    `).join("");
  }

  function normalizedCollectionPickerQuery() {
    return String(appState.collectionPickerQuery || "").trim().toLowerCase();
  }

  function filteredCollectionPickerGroups(groups) {
    const query = normalizedCollectionPickerQuery();
    const visibleGroups = groups.filter((group) => group.superGroup === appState.collectionPickerSuper);
    if (!query) {
      const totalCount = visibleGroups.reduce((sum, group) => sum + group.options.length, 0);
      return { groups: visibleGroups, totalCount };
    }
    const filteredGroups = visibleGroups.map((group) => {
      const options = group.options.filter((option) => String(option.label || option.value || "").toLowerCase().includes(query));
      return options.length ? { ...group, options } : null;
    }).filter(Boolean);
    const totalCount = filteredGroups.reduce((sum, group) => sum + group.options.length, 0);
    return { groups: filteredGroups, totalCount };
  }

  function limitedCollectionPickerGroups(groups) {
    const query = normalizedCollectionPickerQuery();
    const { groups: filteredGroups, totalCount } = filteredCollectionPickerGroups(groups);
    if (query) return { groups: filteredGroups, shownCount: totalCount, totalCount, hasMore: false };
    let remaining = Math.max(0, Number(appState.collectionPickerVisibleLimit) || 0);
    let shownCount = 0;
    const limitedGroups = filteredGroups.map((group) => {
      if (remaining <= 0) return null;
      const options = group.options.slice(0, remaining);
      remaining -= options.length;
      shownCount += options.length;
      return options.length ? { ...group, options, totalOptions: group.options.length } : null;
    }).filter(Boolean);
    return { groups: limitedGroups, shownCount, totalCount, hasMore: shownCount < totalCount };
  }

  function renderGroupedCollectionPickerOptions(rootId, groups, selectedValue) {
    const root = document.getElementById(rootId);
    if (!root) return;
    if (!appState.collectionPickerSuper) {
      const superGroups = ["unbox", "collection", "other"].map((superGroup) => {
        const nestedGroups = groups.filter((group) => group.superGroup === superGroup);
        const count = nestedGroups.reduce((sum, group) => sum + group.options.length, 0);
        return {
          superGroup,
          title: collectionSuperGroupMeta(superGroup).title,
          description: collectionSuperGroupMeta(superGroup).description,
          count
        };
      }).filter((group) => group.count > 0);
      root.innerHTML = `
        <section class="picker-group">
          <div class="picker-group-heading">
            <h3>${escapeHtml(uiText("Choose a Category", "选择分类"))}</h3>
            <span>${escapeHtml(uiText("3 options", "3 个选项"))}</span>
          </div>
          <div class="picker-option-grid">
            ${superGroups.map((group) => `
              <button class="collection-option collection-super-option" type="button" data-collection-super="${escapeHtml(group.superGroup)}">
                <strong>${escapeHtml(group.title)}</strong>
                <small>${escapeHtml(group.description)}</small>
              </button>
            `).join("")}
          </div>
        </section>
      `;
      return;
    }

    const query = normalizedCollectionPickerQuery();
    const { groups: visibleGroups, shownCount, totalCount, hasMore } = limitedCollectionPickerGroups(groups);
    root.innerHTML = `
      <section class="picker-group">
        <div class="picker-group-heading">
          <h3>${escapeHtml(collectionSuperGroupMeta(appState.collectionPickerSuper).title)}</h3>
          <span>${escapeHtml(query ? uiTemplate("{count} matches", { count: totalCount }) : uiText("Choose a collection", "选择一个系列"))}</span>
        </div>
        <button class="secondary-action compact-action" id="collectionPickerBack" type="button">${escapeHtml(uiText("Back to categories", "杩斿洖澶х被"))}</button>
      </section>
      ${query && !visibleGroups.length ? `<section class="picker-group"><p class="empty-state">${escapeHtml(uiText("No matching collections", "没有匹配的系列"))}</p></section>` : ""}
      ${visibleGroups.map((group) => `
      <section class="picker-group">
        <div class="picker-group-heading">
          <h3>${escapeHtml(group.title)}</h3>
          <span>${escapeHtml(uiTemplate("{count} items", { count: group.totalOptions || group.options.length }))}</span>
        </div>
        <div class="picker-option-grid">
          ${group.options.map((option) => `
            <button class="collection-option${selectedValue === option.value ? " selected" : ""}" type="button" data-picker-value="${escapeHtml(option.value)}">
              <span>${escapeHtml(option.label)}</span>
            </button>
          `).join("")}
        </div>
      </section>
      `).join("")}
      ${hasMore ? `<section class="picker-group"><button class="secondary-action" id="collectionPickerShowMore" type="button">${escapeHtml(uiTemplate("Show more ({count} left)", { count: totalCount - shownCount }))}</button></section>` : ""}
    `;
  }

  function refreshCatalogPickerUi(filters = getCatalogFilters()) {
    const { rarityOptions, groupedCollectionOptions } = getCatalogOptionLists();
    renderCollectionPickerOptions("typeOptions", CATEGORY_ORDER, filters.type, categoryLabel);
    renderCollectionPickerOptions("rarityOptions", rarityOptions, filters.rarity, (value) => value);
    renderGroupedCollectionPickerOptions("collectionOptions", groupedCollectionOptions, filters.collection);
    const collectionSearch = document.getElementById("collectionSearch");
    if (collectionSearch && collectionSearch.value !== appState.collectionPickerQuery) collectionSearch.value = appState.collectionPickerQuery;
    const typeLabelNode = document.getElementById("typeFilterLabel");
    const rarityLabelNode = document.getElementById("rarityFilterLabel");
    const collectionLabelNode = document.getElementById("collectionFilterLabel");
    const priceValue = document.getElementById("priceValue");
    if (typeLabelNode) typeLabelNode.textContent = filters.type ? categoryLabel(filters.type) : uiText("Any", "不限");
    if (rarityLabelNode) rarityLabelNode.textContent = filters.rarity || uiText("Any", "不限");
    if (collectionLabelNode) collectionLabelNode.textContent = filters.collection || uiText("Any", "不限");
    if (priceValue) priceValue.textContent = filters.maxPrice >= 5000 ? uiText("Any", "不限") : formatPrice(filters.maxPrice);
  }

  function readCatalogControlValue(controlId, paramKey, params = new URLSearchParams(location.search)) {
    const control = document.getElementById(controlId);
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) {
      return String(control.value || "").trim();
    }
    return String(params.get(paramKey) || "").trim();
  }

  function getCatalogFilters() {
    const params = new URLSearchParams(location.search);
    const query = readCatalogControlValue("searchInput", "q", params);
    const type = readCatalogControlValue("typeFilter", "type", params);
    const rarity = readCatalogControlValue("rarityFilter", "rarity", params);
    const collection = readCatalogControlValue("collectionFilter", "collection", params);
    const priceControl = document.getElementById("priceFilter");
    const sortControl = document.getElementById("sortFilter");
    const maxPrice = Number(priceControl instanceof HTMLInputElement ? priceControl.value : 5000);
    const sort = String(sortControl instanceof HTMLSelectElement ? sortControl.value : "featured");
    return { query, type, rarity, collection, maxPrice, sort };
  }

  function updateQueryString(filters) {
    if (pageName() !== "catalog.html") return;
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.type) params.set("type", filters.type);
    if (filters.rarity) params.set("rarity", filters.rarity);
    if (filters.collection) params.set("collection", filters.collection);
    history.replaceState({}, "", `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function catalogMatches(item, filters) {
    if (filters.query) {
      const haystacks = [item.nameEn, item.nameZh, itemWeapon(item), item.collectionEn, item.collectionZh, collectionLabel(item)]
        .map((value) => String(value || "").toLowerCase());
      if (!haystacks.some((value) => value.includes(filters.query.toLowerCase()))) return false;
    }
    if (filters.type && item.type !== filters.type) return false;
    if (filters.rarity) {
      const rarityValues = [item.rarityEn, item.rarityZh, rarityLabel(item)].filter(Boolean);
      if (!rarityValues.includes(filters.rarity)) return false;
    }
    if (filters.collection) {
      const collectionValues = [item.collectionEn, item.collectionZh, collectionLabel(item)].filter(Boolean);
      if (!collectionValues.includes(filters.collection)) return false;
    }
    if (Number.isFinite(filters.maxPrice) && filters.maxPrice < 5000) {
      const price = Number(effectiveCatalogPrice(item));
      if (Number.isFinite(price) && price > filters.maxPrice) return false;
    }
    return true;
  }

  function sortCatalogItems(entries, sortValue) {
    return [...entries].sort((left, right) => {
      if (sortValue === "price-asc") return (Number(effectiveCatalogPrice(left)) || Number.MAX_SAFE_INTEGER) - (Number(effectiveCatalogPrice(right)) || Number.MAX_SAFE_INTEGER);
      if (sortValue === "price-desc") return (Number(effectiveCatalogPrice(right)) || 0) - (Number(effectiveCatalogPrice(left)) || 0);
      if (sortValue === "rarity-desc") return rarityRank(right) - rarityRank(left);
      if (sortValue === "name-asc") return itemTitle(left).localeCompare(itemTitle(right), currentLanguage());
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    });
  }

  function getCatalogOptionLists() {
    const language = currentLanguage();
    if (catalogOptionsCache.has(language)) return catalogOptionsCache.get(language);
    const rarityOptions = [...new Set(items.map((item) => rarityLabel(item)).filter(Boolean))];
    const collectionSummaries = buildCollectionSummaries()
      .sort((a, b) => a.name.localeCompare(b.name, language));
    const collectionOptions = collectionSummaries.map((entry) => entry.name);
    const groupedCollectionOptions = collectionBucketOrder().map((bucket) => {
      const options = collectionSummaries
        .filter((entry) => entry.bucket === bucket)
        .map((entry) => ({ value: entry.name, label: entry.name }));
      return {
        bucket,
        superGroup: collectionSuperGroupForBucket(bucket),
        title: collectionBucketMeta(bucket).title,
        options
      };
    }).filter((group) => group.options.length);
    const cached = { rarityOptions, collectionOptions, groupedCollectionOptions };
    catalogOptionsCache.set(language, cached);
    return cached;
  }

  function catalogTypeDisplayOrder() {
    return ["rifle", "pistol", "smg", "shotgun", "machinegun", "sticker", "knife", "glove", "agent", "music-box", "equipment"];
  }

  function catalogDiversityKey(item) {
    return firstNonEmpty(itemWeapon(item), item.type, item.id);
  }

  function takeDiversifiedCatalogItems(entries, limit) {
    const typeOrder = catalogTypeDisplayOrder();
    const buckets = new Map();
    entries.forEach((item) => {
      const bucketKey = item.type || "other";
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
      buckets.get(bucketKey).push(item);
    });
    const orderedTypes = [
      ...typeOrder.filter((type) => (buckets.get(type) || []).length > 0),
      ...[...buckets.keys()].filter((type) => !typeOrder.includes(type)).sort((left, right) => left.localeCompare(right, currentLanguage()))
    ];
    const diversified = [];
    let lastDiversityKey = "";
    while (diversified.length < limit && orderedTypes.some((type) => (buckets.get(type) || []).length > 0)) {
      orderedTypes.forEach((type) => {
        if (diversified.length >= limit) return;
        const bucket = buckets.get(type) || [];
        if (!bucket.length) return;
        let nextIndex = bucket.findIndex((item) => catalogDiversityKey(item) !== lastDiversityKey);
        if (nextIndex < 0) nextIndex = 0;
        const [nextItem] = bucket.splice(nextIndex, 1);
        diversified.push(nextItem);
        lastDiversityKey = catalogDiversityKey(nextItem);
      });
    }
    return diversified;
  }

  function catalogVisibleItems(filtered, filters) {
    if (filters.sort !== "featured") {
      return sortCatalogItems(filtered, filters.sort).slice(0, appState.catalogRenderedCount);
    }
    const featuredFirst = [];
    const regular = [];
    filtered.forEach((item) => {
      (item.featured ? featuredFirst : regular).push(item);
    });
    return takeDiversifiedCatalogItems(
      featuredFirst.length ? [...featuredFirst, ...regular] : filtered,
      appState.catalogRenderedCount
    );
  }

  function renderCatalog() {
    if (pageName() !== "catalog.html") return;
    const main = document.querySelector("main.catalog-page");
    if (!main) return;
    main.innerHTML = buildCatalogShell();
    if (!items.length) {
      const grid = document.getElementById("itemGrid");
      if (grid) {
        grid.innerHTML = Array.from({ length: 8 }, () => `
          <article class="item-card item-card-skeleton">
            <div class="deferred-media-placeholder skeleton-block">${escapeHtml(uiText("Loading item", "正在加载物品"))}</div>
            <div class="item-card-copy">
              <p class="eyebrow">${escapeHtml(uiText("Catalog", "目录"))}</p>
              <strong>${escapeHtml(uiText("Loading catalog entries...", "正在加载目录条目..."))}</strong>
              <small>${escapeHtml(uiText("Text first, images and prices next.", "先显示文本，随后加载图片和价格。"))}</small>
            </div>
          </article>
        `).join("");
      }
      return;
    }
    const filters = getCatalogFilters();
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const rarityFilterNode = document.getElementById("rarityFilter");
    const collectionFilter = document.getElementById("collectionFilter");
    const priceFilter = document.getElementById("priceFilter");
    const sortFilter = document.getElementById("sortFilter");
    if (searchInput) searchInput.value = filters.query;
    if (typeFilter) typeFilter.value = filters.type;
    if (rarityFilterNode) rarityFilterNode.value = filters.rarity;
    if (collectionFilter) collectionFilter.value = filters.collection;
    if (priceFilter) priceFilter.value = String(filters.maxPrice || 5000);
    if (sortFilter) sortFilter.value = filters.sort;
    scheduleUiTask(() => updateCatalogResults());
  }

  function updateCatalogResults() {
    const grid = document.getElementById("itemGrid");
    if (!grid) return;
    try {
      const filters = getCatalogFilters();
      updateQueryString(filters);
      const filtered = items.filter((item) => catalogMatches(item, filters));
      const visible = catalogVisibleItems(filtered, filters);
      grid.innerHTML = visible.map(cardMarkup).join("");
      const loadMore = document.getElementById("loadMore");
      if (loadMore) loadMore.hidden = visible.length >= filtered.length;
      renderCompareTray();
      refreshCatalogPickerUi(filters);
    } catch (error) {
      console.error("Catalog render failed", error);
      grid.innerHTML = `<div class="empty-state">${escapeHtml(uiText("Catalog failed to render. Please refresh once.", "目录渲染失败，请刷新一次。"))}</div>`;
    }
  }

  function renderCollections() {
    if (pageName() !== "collections.html") return;
    const main = document.querySelector("main.collections-page");
    if (!main) return;
    if (!items.length) {
      main.innerHTML = `
        <section class="page-intro" data-motion-intro data-motion-title-fast>
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Collections", "收藏品系列"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Collection Index", "收藏索引"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("The structure appears first, then collection covers stream in.", "鍏堟樉绀哄垎鍖虹粨鏋勶紝鍐嶈ˉ鏀惰棌灏侀潰銆?"))}</p>
        </section>
        <div class="empty-state">${escapeHtml(uiText("Loading collection sections...", "正在加载系列分区..."))}</div>
      `;
      return;
    }
    const groupedCollections = Object.fromEntries(collectionBucketOrder().map((bucket) => [bucket, []]));
    buildCollectionSummaries().forEach((summary) => {
      groupedCollections[summary.bucket].push(summary);
    });
    const bucketOrder = collectionBucketOrder();
    main.innerHTML = `
      <section class="page-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Halls", "\u5c55\u533a"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Halls", "Halls"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Browse the exhibition by series, map collections, cases, capsules, and souvenir wings.", "\u6309\u7cfb\u5217\u3001\u5730\u56fe\u6536\u85cf\u3001\u6b66\u5668\u7bb1\u3001\u80f6\u56ca\u548c\u7eaa\u5ff5\u54c1\u5305\u6d4f\u89c8\u5c55\u533a\u3002"))}</p>
      </section>
      <div class="collection-index">
        ${bucketOrder.map((bucket) => {
          const meta = collectionBucketMeta(bucket);
          const entries = groupedCollections[bucket].sort((a, b) => a.name.localeCompare(b.name, currentLanguage()));
          if (!entries.length) return "";
          return `
            <section class="collection-index-group">
              <p class="eyebrow">${escapeHtml(meta.eyebrow)}</p>
              <h2>${escapeHtml(meta.title)}</h2>
              <p>${escapeHtml(meta.description)}</p>
              <div class="collection-grid">
                ${entries.map((entry) => collectionCardWithPreviewMarkup(entry, bucket)).join("")}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderOpenings() {
    const root = document.getElementById("openingsRoot");
    if (!root) return;
    const renderToken = appState.openingRenderToken + 1;
    appState.openingRenderToken = renderToken;
    const activeOpening = ensureActiveOpening();
    root.innerHTML = `
      <section class="page-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Drop Theatre", "掉落剧场"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Drop Theatre", "掉落剧场"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Select a case or capsule, open single or batch drops, inspect the pool, and track ROI from the existing simulator.", "\u9009\u62e9\u7bb1\u5b50\u6216\u80f6\u56ca\uff0c\u8fdb\u884c\u5355\u5f00\u6216\u8fde\u5f00\uff0c\u68c0\u89c6\u6389\u843d\u6c60\uff0c\u5e76\u7528\u73b0\u6709\u6a21\u62df\u5668\u8ffd\u8e2a\u6295\u5165\u4ea7\u51fa\u3002"))}</p>
      </section>
      ${activeOpening ? openingSimulatorMarkup(activeOpening) : ""}
      <div class="collection-index" id="openingIndexRoot">
        <div class="empty-state">${escapeHtml(uiText("Loading containers...", "正在加载箱子与胶囊..."))}</div>
      </div>
    `;
    if (!openingItems.length) {
      void ensureOpeningDataLoaded().then(() => {
        if (pageName() !== "openings.html" || !openingItems.length) return;
        renderOpenings();
      }).catch(() => {});
      return;
    }
    renderOpeningPickerPortal();
    scheduleUiTask(() => renderOpeningIndex(renderToken));
    const openingPriceKey = activeOpening?.id ? livePriceKey(activeOpening.id, "", "standard") : "";
    if (activeOpening?.id && openingPriceKey && !appState.livePrices[openingPriceKey] && !appState.livePriceRequests[openingPriceKey]) {
      void loadPlatformPrices(activeOpening, "", "standard").then(() => {
        if (pageName() !== "openings.html" || appState.activeOpeningId !== activeOpening.id) return;
        if (appState.openingSpinning) {
          appState.openingDeferredRender = true;
          return;
        }
        renderOpenings();
      }).catch(() => {});
    }
    if (activeOpening?.id && !appState.aiOpeningAnalyses[activeOpening.id] && !appState.aiOpeningAnalysisRequests[activeOpening.id]) {
      void ensureAiOpeningAnalysis(activeOpening.id).then(() => {
        if (pageName() !== "openings.html") return;
        if (appState.openingSpinning) {
          appState.openingDeferredRender = true;
          return;
        }
        renderOpenings();
      }).catch(() => {});
    }
  }

  function renderOpeningIndex(renderToken = appState.openingRenderToken) {
    if (pageName() !== "openings.html") return;
    const root = document.getElementById("openingIndexRoot");
    if (!root) return;
    const defaultVisible = 18;
    const grouped = Object.fromEntries(OPENING_KIND_ORDER.map((kind) => [kind, []]));
    openingItems.forEach((item) => {
      const kind = item.kind || "container";
      if (!grouped[kind]) grouped[kind] = [];
      grouped[kind].push(item);
    });
    const sections = OPENING_KIND_ORDER.map((kind) => {
      const entries = (grouped[kind] || []).sort((a, b) => openingTitle(a).localeCompare(openingTitle(b), currentLanguage()));
      if (!entries.length) return null;
      return {
        kind,
        meta: openingGroupMeta(kind),
        entries
      };
    }).filter(Boolean);
    root.innerHTML = "";
    let index = 0;
    const chunkSize = 18;
    const appendNextSection = () => {
      if (pageName() !== "openings.html") return;
      if (renderToken !== appState.openingRenderToken) return;
      if (!document.getElementById("openingIndexRoot")) return;
      if (index >= sections.length) return;
      const section = sections[index];
      const sectionId = `opening-index-group-${section.kind}`;
      const visibleCount = Math.min(section.entries.length, Math.max(defaultVisible, Number(appState.openingIndexVisibleByKind?.[section.kind] || defaultVisible)));
      const visibleEntries = section.entries.slice(0, visibleCount);
      root.insertAdjacentHTML("beforeend", `
        <section class="collection-index-group">
          <p class="eyebrow">${escapeHtml(section.meta.eyebrow)}</p>
          <h2>${escapeHtml(section.meta.title)}</h2>
          <p>${escapeHtml(section.meta.description)}</p>
          <div class="collection-grid opening-grid" id="${escapeHtml(sectionId)}"></div>
          ${visibleCount < section.entries.length ? `<div class="opening-index-actions"><button class="secondary-action" type="button" data-opening-more="${escapeHtml(section.kind)}">${escapeHtml(uiText("Load More", "加载更多"))}</button></div>` : ""}
        </section>
      `);
      const grid = document.getElementById(sectionId);
      if (grid) {
        let entryIndex = 0;
        const appendChunk = () => {
          if (pageName() !== "openings.html") return;
          if (renderToken !== appState.openingRenderToken) return;
          const slice = visibleEntries.slice(entryIndex, entryIndex + chunkSize);
          if (!slice.length) return;
          grid.insertAdjacentHTML("beforeend", slice.map(openingCardMarkup).join(""));
          entryIndex += chunkSize;
          if (entryIndex < visibleEntries.length) scheduleUiTask(appendChunk);
        };
        scheduleUiTask(appendChunk);
      }
      index += 1;
      if (index < sections.length) scheduleUiTask(appendNextSection);
    };
    scheduleUiTask(appendNextSection);
  }

  function renderOpeningDetail(root, opening) {
    rememberRecentId(opening.id);
    const cachedPlatformPrices = appState.livePrices[livePriceKey(opening.id, "", "standard")] || null;
    const loadingPriceHint = uiText("Checking the latest platform price.", "正在检查最新平台价格。");
    const buffDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.buff?.price)) && Number(cachedPlatformPrices.platforms.buff.price) > 0 ? Number(cachedPlatformPrices.platforms.buff.price) : null;
    const youpinDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.youpin?.price)) && Number(cachedPlatformPrices.platforms.youpin.price) > 0 ? Number(cachedPlatformPrices.platforms.youpin.price) : null;
    const referenceDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.referencePrice)) && Number(cachedPlatformPrices.referencePrice) > 0
      ? Number(cachedPlatformPrices.referencePrice)
      : openingContainerPrice(opening);
    const openingDisplayCost = openingTotalCost(opening, referenceDisplayPrice);
    const referenceHintText = detailReferenceHintText(
      cachedPlatformPrices?.referenceSourceKey || "reference",
      cachedPlatformPrices?.referenceSource || uiText("Public market reference", "公开市场参考价")
    );
    const relatedOpenings = openingItems
      .filter((entry) => entry.id !== opening.id && (entry.kind || "container") === (opening.kind || "container"))
      .slice(0, 6);
    root.innerHTML = `
      <section class="detail-main detail-main-opening">
        <section class="viewer-panel opening-viewer-panel">
          <div class="viewer-toolbar">
            <span>${escapeHtml(openingKindLabel(opening.kind))}</span>
            <a class="secondary-link" href="openings.html">${escapeHtml(uiText("Back to Unbox", "返回开箱"))}</a>
          </div>
          <div class="viewer-stage inspect-scene opening-inspect-scene">
            <div class="stage-glow"></div>
            <div class="inspect-depth-card inspect-depth-card-opening">
              ${opening.image ? `<img class="skin-image inspect-image opening-detail-image" src="${escapeHtml(opening.image)}" alt="${escapeHtml(openingTitle(opening))}" loading="eager" />` : `<div class="empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
            </div>
          </div>
          <div class="inspect-controls opening-detail-actions">
            <button class="primary-link unbox-trigger" id="openingDetailSelectButton" type="button" data-opening-detail-open="${escapeHtml(opening.id)}">${escapeHtml(uiText("Simulate Unbox", "模拟开箱"))}</button>
            <button class="secondary-action" id="openingDetailPickerButton" type="button">${escapeHtml(uiText("Choose Another Container", "更换箱子或胶囊"))}</button>
          </div>
        </section>
        <section class="collection-card detail-info">
          <p class="eyebrow">${escapeHtml(openingKindLabel(opening.kind))}</p>
          <h1>${escapeHtml(openingTitle(opening))}</h1>
          <p>${escapeHtml(openingDescription(opening) || uiText("Browse the container summary, current prices, and the exact listed loot pool below.", "查看该容器简介、当前价格和下方列出的完整掉落池。"))}</p>
          <dl class="spec-list">
            <div><dt>${escapeHtml(uiText("Type", "类型"))}</dt><dd>${escapeHtml(openingKindLabel(opening.kind))}</dd></div>
            <div><dt>${escapeHtml(uiText("Market Hash Name", "市场名称"))}</dt><dd>${escapeHtml(opening.marketHashName || opening.nameEn || openingTitle(opening))}</dd></div>
            <div><dt>${escapeHtml(uiText("First Sale", "首次发售"))}</dt><dd>${escapeHtml(opening.firstSaleDate || uiText("Unknown", "未知"))}</dd></div>
            <div><dt>${escapeHtml(uiText("Listed Drops", "列出掉落"))}</dt><dd>${escapeHtml(String(opening.containsCount || 0))}</dd></div>
            <div><dt>${escapeHtml(uiText("Rare Specials", "稀有特殊物品"))}</dt><dd>${escapeHtml(String(opening.containsRareCount || 0))}</dd></div>
          </dl>
          <div class="platform-price-grid" id="detailPlatformPriceGrid">
            <article class="platform-price-card" data-platform="buff">
              <span class="platform-price-label">${escapeHtml(platformPriceLabel("buff"))}</span>
              <strong class="platform-price-value" id="detailBuffPriceValue">${escapeHtml(formatPrice(buffDisplayPrice))}</strong>
              <small class="platform-price-hint" id="detailBuffPriceHint">${escapeHtml(cachedPlatformPrices ? platformPriceHint(cachedPlatformPrices?.platforms?.buff) : loadingPriceHint)}</small>
            </article>
            <article class="platform-price-card" data-platform="youpin">
              <span class="platform-price-label">${escapeHtml(platformPriceLabel("youpin"))}</span>
              <strong class="platform-price-value" id="detailYoupinPriceValue">${escapeHtml(formatPrice(youpinDisplayPrice))}</strong>
              <small class="platform-price-hint" id="detailYoupinPriceHint">${escapeHtml(cachedPlatformPrices ? platformPriceHint(cachedPlatformPrices?.platforms?.youpin) : loadingPriceHint)}</small>
            </article>
            <article class="platform-price-card is-reference" data-platform="reference">
              <span class="platform-price-label">${escapeHtml(openingCostLabel(opening))}</span>
              <strong class="platform-price-value" id="detailReferencePriceValue">${escapeHtml(formatFinancePrice(openingDisplayCost))}</strong>
              <small class="platform-price-hint" id="detailReferencePriceHint">${escapeHtml(openingRequiresKey(opening) ? `${referenceHintText} + ${uiText("key", "钥匙")} ${formatFinancePrice(openingKeyPrice(opening))}` : referenceHintText)}</small>
            </article>
          </div>
          ${aiOpeningAnalysisMarkup(opening.id)}
        </section>
      </section>
      <section class="detail-related opening-detail-pool">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Inside", "\u5305\u542b\u5185\u5bb9"))}</p>
          <h2>${escapeHtml(uiText("What Can Drop", "鑳藉紑鍑轰粈涔?"))}</h2>
        </div>
        ${openingLootPoolMarkup(opening)}
      </section>
      ${relatedOpenings.length ? `
        <section class="detail-related">
          <div class="section-heading">
            <p class="eyebrow">${escapeHtml(uiText("More Containers", "更多容器"))}</p>
            <h2>${escapeHtml(uiText("Same Category", "同类物品"))}</h2>
          </div>
          <div class="collection-grid opening-grid">
            ${relatedOpenings.map(openingCardMarkup).join("")}
          </div>
        </section>
      ` : ""}
    `;
    renderOpeningPickerPortal();
    loadPlatformPrices(opening, "", "standard").then((payload) => {
      const buffPriceValue = document.getElementById("detailBuffPriceValue");
      const buffPriceHint = document.getElementById("detailBuffPriceHint");
      const youpinPriceValue = document.getElementById("detailYoupinPriceValue");
      const youpinPriceHint = document.getElementById("detailYoupinPriceHint");
      const referencePriceValue = document.getElementById("detailReferencePriceValue");
      const referencePriceHint = document.getElementById("detailReferencePriceHint");
      if (!buffPriceValue || !buffPriceHint || !youpinPriceValue || !youpinPriceHint || !referencePriceValue || !referencePriceHint) return;
      const activeId = new URLSearchParams(location.search).get("id") || "";
      if (activeId !== opening.id) return;
      const buffValue = Number.isFinite(Number(payload?.platforms?.buff?.price)) && Number(payload.platforms.buff.price) > 0 ? Number(payload.platforms.buff.price) : null;
      const youpinValue = Number.isFinite(Number(payload?.platforms?.youpin?.price)) && Number(payload.platforms.youpin.price) > 0 ? Number(payload.platforms.youpin.price) : null;
      const referenceValue = Number.isFinite(Number(payload?.referencePrice)) && Number(payload.referencePrice) > 0
        ? Number(payload.referencePrice)
        : openingContainerPrice(opening);
      const openingCostValue = openingTotalCost(opening, referenceValue);
      buffPriceValue.textContent = formatPrice(buffValue);
      buffPriceHint.textContent = platformPriceHint(payload?.platforms?.buff);
      youpinPriceValue.textContent = formatPrice(youpinValue);
      youpinPriceHint.textContent = platformPriceHint(payload?.platforms?.youpin);
      referencePriceValue.textContent = formatFinancePrice(openingCostValue);
      referencePriceHint.textContent = openingRequiresKey(opening)
        ? `${detailReferenceHintText(payload?.referenceSourceKey, payload?.referenceSource)} + ${uiText("key", "钥匙")} ${formatFinancePrice(openingKeyPrice(opening))}`
        : detailReferenceHintText(payload?.referenceSourceKey, payload?.referenceSource);
    }).catch(() => {});
    if (!appState.aiOpeningAnalyses[opening.id] && !appState.aiOpeningAnalysisRequests[opening.id]) {
      void ensureAiOpeningAnalysis(opening.id).then(() => {
        if (pageName() === "item.html") renderItemDetail();
      }).catch(() => {});
    }
  }

  function renderItemDetail() {
    const root = document.getElementById("itemDetailRoot") || document.getElementById("detailRoot");
    if (!root) return;
    document.body.classList.add("is-inspector-page");
    document.body.classList.remove("home-exhibition-page", "halls-directory-page");
    root.classList.add("obsidian-inspector");
    const inspectorState = getInspectorState();
    const detailParams = new URLSearchParams(location.search);
    const id = detailParams.get("id") || inspectorState.itemId || DEFAULT_DETAIL_ALIAS;
    const inventoryAssetId = detailParams.get("asset") || "";
    const opening = openingById(id);
    const item = resolveDisplayItemById(id) || null;
    if (!item && opening) {
      renderOpeningDetail(root, opening);
      return;
    }
    const fallbackItem = item || items[0];
    if (!fallbackItem) {
      root.innerHTML = `<section class="viewer-panel"><div class="empty-state">${escapeHtml(uiText("Loading exhibit...", "正在加载展品..."))}</div></section>`;
      return;
    }
    const resolvedItem = fallbackItem;
    const specialTemplates = specialTemplatesForItem(resolvedItem);
    const selectedTemplateId = specialTemplates.length ? activeSpecialTemplateId(resolvedItem) : "";
    const pricedItem = selectedSpecialTemplateItem(resolvedItem, selectedTemplateId);
    const itemWearOptions = wearOptions(pricedItem);
    const requestedWear = detailParams.get("wear") || "";
    const requestedVariant = detailParams.get("variant") || "";
    const selectedWear = itemWearOptions.includes(requestedWear) ? requestedWear : activeWearForItem(pricedItem);
    const selectedVariant = variantOptions(pricedItem).includes(requestedVariant) ? requestedVariant : activeVariantForItem(pricedItem);
    setInspectorState({
      itemId: resolvedItem.id,
      wearByItem: {
        ...inspectorState.wearByItem,
        [resolvedItem.id]: selectedWear,
        [pricedItem.id]: selectedWear
      },
      variantByItem: {
        ...inspectorState.variantByItem,
        [resolvedItem.id]: selectedVariant,
        [pricedItem.id]: selectedVariant
      },
      templateByItem: {
        ...inspectorState.templateByItem,
        [resolvedItem.id]: selectedTemplateId
      }
    });
    appState.pendingWear = selectedWear;
    appState.pendingVariant = selectedVariant;
    appState.pendingTemplate = selectedTemplateId;
    const cachedPlatformPrices = appState.livePrices[livePriceKey(pricedItem.id, selectedWear, selectedVariant)] || null;
    const loadingPriceHint = uiText("Checking the selected wear tier price.", "正在检查所选磨损等级价格。");
    const buffDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.buff?.price)) && Number(cachedPlatformPrices.platforms.buff.price) > 0 ? Number(cachedPlatformPrices.platforms.buff.price) : null;
    const youpinDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.platforms?.youpin?.price)) && Number(cachedPlatformPrices.platforms.youpin.price) > 0 ? Number(cachedPlatformPrices.platforms.youpin.price) : null;
    const syncedReferenceRecord = effectiveCatalogPriceRecord(pricedItem);
    const referenceDisplayPrice = Number.isFinite(Number(cachedPlatformPrices?.referencePrice)) && Number(cachedPlatformPrices.referencePrice) > 0
      ? Number(cachedPlatformPrices.referencePrice)
      : syncedReferenceRecord.price;
    const referenceHintText = detailReferenceHintText(
      cachedPlatformPrices?.referenceSourceKey || syncedReferenceRecord.source,
      cachedPlatformPrices?.referenceSource || uiText("Public market reference", "公开市场参考价")
    );
    const canStickerDiy = supportsStickerDiy(pricedItem);
    const linkedInventoryEntry = inventoryAssetId
      ? (Array.isArray(appState.inventoryPreview?.items) ? appState.inventoryPreview.items : []).find((entry) => String(entry?.asset_id || entry?.assetId || "") === inventoryAssetId)
      : null;
    const linkedInventoryStickers = inventoryStickers(linkedInventoryEntry);
    const inventoryStickersForView = linkedInventoryStickers.length ? linkedInventoryStickers : parseInventoryStickerParam(detailParams.get("stickers"));
    const inventoryVersionLabel = inventoryAssetId ? itemVariantLabel(selectedVariant) : "";
    const inventoryTemplateLabel = inventoryAssetId && selectedTemplateId ? specialTemplateLabel(specialTemplates.find((template) => template.id === selectedTemplateId)) : "";
    const inventoryQualityLabel = linkedInventoryEntry ? inventoryInstanceQuality(linkedInventoryEntry) : String(detailParams.get("quality") || "").trim();
    const inventoryWearLabel = linkedInventoryEntry ? inventoryExteriorLabel(linkedInventoryEntry) : String(detailParams.get("exterior") || "").trim();
    const hasInventoryInspectDetails = Boolean(inventoryAssetId && (inventoryVersionLabel || inventoryQualityLabel || inventoryWearLabel || inventoryStickersForView.length));
    rememberRecentId(resolvedItem.id);
    const related = items.filter((entry) => entry.id !== resolvedItem.id && entry.type === resolvedItem.type).slice(0, 4);
    root.innerHTML = `
      <section class="detail-main obsidian-main">
        <section class="viewer-panel obsidian-stage-shell">
          <div class="viewer-toolbar">
            <span>${escapeHtml(itemTitle(resolvedItem))}</span>
            <button class="favorite-button" type="button" data-favorite-id="${escapeHtml(resolvedItem.id)}" aria-pressed="${isFavorite(resolvedItem.id)}">${escapeHtml(isFavorite(resolvedItem.id) ? uiText("Saved", "已收藏") : uiText("Save", "收藏"))}</button>
          </div>
          <div class="viewer-stage inspect-scene ${escapeHtml(selectedWear || "factory-new")}" id="inspectScene">
            <div class="stage-glow"></div>
            <div class="inspect-depth-card" id="inspectDepthCard">
              <div class="inspect-stage-light"></div>
              ${pricedItem.image ? `<img id="inspectImage" class="skin-image inspect-image" src="${escapeHtml(pricedItem.image)}" alt="${escapeHtml(itemTitle(resolvedItem))}" loading="eager" />` : `<div class="empty-state">${escapeHtml(uiText("No image", "暂无图片"))}</div>`}
              <div class="inspect-patina"></div>
              <div class="inspect-edgewear"></div>
              <div class="inspect-scratches"></div>
              <div class="inspect-reflection"></div>
            </div>
          </div>
          <div class="inspect-controls obsidian-control-deck">
            ${itemWearOptions.length ? `<label class="wear-choice-field">
              <span>${escapeHtml(uiText("Wear Tier", "磨损档位"))}</span>
              <select id="wearSelect">
                ${itemWearOptions.map((wearId) => `<option value="${escapeHtml(wearId)}"${selectedWear === wearId ? " selected" : ""}>${escapeHtml(wearLabel(wearId))}</option>`).join("")}
              </select>
            </label>` : ""}
            ${variantOptions(pricedItem).length > 1 ? `<label class="wear-choice-field">
              <span>${escapeHtml(uiText("Version", "版本"))}</span>
              <select id="variantSelect">
                ${variantOptions(pricedItem).map((variantId) => `<option value="${escapeHtml(variantId)}"${selectedVariant === variantId ? " selected" : ""}>${escapeHtml(itemVariantLabel(variantId))}</option>`).join("")}
              </select>
            </label>` : ""}
            ${specialTemplates.length ? `<label class="wear-choice-field">
              <span>${escapeHtml(uiText("Special Template", "特殊模板"))}</span>
              <select id="templateSelect">
                ${["phase", "gem"].map((groupKey) => {
                  const groupTemplates = specialTemplates.filter((template) => template.group === groupKey);
                  if (!groupTemplates.length) return "";
                  return `<optgroup label="${escapeHtml(specialTemplateGroupLabel(groupKey))}">${groupTemplates.map((template) => `<option value="${escapeHtml(template.id)}"${selectedTemplateId === template.id ? " selected" : ""}>${escapeHtml(specialTemplateLabel(template))}</option>`).join("")}</optgroup>`;
                }).join("")}
              </select>
            </label>` : ""}
            ${canStickerDiy ? `<button class="secondary-action" id="toggleDiyButton" type="button" aria-pressed="false">${escapeHtml(uiText("Sticker DIY", "贴纸 DIY"))}</button>` : ""}
          </div>
        </section>
        <section class="collection-card detail-info inspect-plate obsidian-ledger-panel">
          <p class="eyebrow">${escapeHtml(categoryLabel(resolvedItem.type))}</p>
          <h1>${escapeHtml(itemTitle(resolvedItem))}</h1>
          <p>${escapeHtml(itemDescription(resolvedItem))}</p>
          <dl class="spec-list">
            <div><dt>${escapeHtml(uiText("Weapon", "武器"))}</dt><dd>${escapeHtml(itemWeapon(resolvedItem))}</dd></div>
            <div><dt>${escapeHtml(uiText("Hall / Collection", "\u5c55\u533a / \u7cfb\u5217"))}</dt><dd>${escapeHtml(collectionLabel(resolvedItem))}</dd></div>
            <div><dt>${escapeHtml(uiText("Rarity", "稀有度"))}</dt><dd>${escapeHtml(rarityLabel(resolvedItem))}</dd></div>
            <div><dt>${escapeHtml(uiText("Quality", "品质"))}</dt><dd>${escapeHtml(qualityLabel(pricedItem))}</dd></div>
            <div><dt>${escapeHtml(uiText("Wear Range", "磨损范围"))}</dt><dd>${escapeHtml(`${pricedItem.minFloat ?? 0} - ${pricedItem.maxFloat ?? 1}`)}</dd></div>
          </dl>
          <div class="market-plates-heading">
            <p class="eyebrow">${escapeHtml(uiText("Market Plates", "\u5e02\u573a\u94ed\u724c"))}</p>
            <span>${escapeHtml(uiText("Reference, BUFF, and YouPin prices remain synced through the existing price system.", "参考价、BUFF 与悠悠有品价格继续通过现有价格系统同步。"))}</span>
          </div>
          <div class="platform-price-grid obsidian-price-ledger" id="detailPlatformPriceGrid">
            <article class="platform-price-card" data-platform="buff">
              <span class="platform-price-label">${escapeHtml(platformPriceLabel("buff"))}</span>
              <strong class="platform-price-value" id="detailBuffPriceValue">${escapeHtml(formatPrice(buffDisplayPrice))}</strong>
              <small class="platform-price-hint" id="detailBuffPriceHint">${escapeHtml(cachedPlatformPrices ? platformPriceHint(cachedPlatformPrices?.platforms?.buff) : loadingPriceHint)}</small>
            </article>
            <article class="platform-price-card" data-platform="youpin">
              <span class="platform-price-label">${escapeHtml(platformPriceLabel("youpin"))}</span>
              <strong class="platform-price-value" id="detailYoupinPriceValue">${escapeHtml(formatPrice(youpinDisplayPrice))}</strong>
              <small class="platform-price-hint" id="detailYoupinPriceHint">${escapeHtml(cachedPlatformPrices ? platformPriceHint(cachedPlatformPrices?.platforms?.youpin) : loadingPriceHint)}</small>
            </article>
            <article class="platform-price-card is-reference" data-platform="reference">
              <span class="platform-price-label">${escapeHtml(uiText("Reference", "参考价"))}</span>
              <strong class="platform-price-value" id="detailReferencePriceValue">${escapeHtml(formatPrice(referenceDisplayPrice))}</strong>
              <small class="platform-price-hint" id="detailReferencePriceHint">${escapeHtml(referenceHintText)}</small>
            </article>
          </div>
          ${aiItemAnalysisMarkup(pricedItem, selectedWear, selectedVariant)}
          ${hasInventoryInspectDetails ? `<div class="inventory-inspect-stickers">
            <span>${escapeHtml(uiText("Inventory item details", "库存物品详情"))}</span>
            <div>
              ${inventoryVersionLabel ? `<em>${escapeHtml(uiText("Version", "版本"))} 路 ${escapeHtml(inventoryVersionLabel)}</em>` : ""}
              ${inventoryTemplateLabel ? `<em>${escapeHtml(uiText("Special Template", "特殊模板"))} 路 ${escapeHtml(inventoryTemplateLabel)}</em>` : ""}
              ${inventoryQualityLabel ? `<em>${escapeHtml(uiText("Quality", "品质"))} 路 ${escapeHtml(inventoryQualityLabel)}</em>` : ""}
              ${inventoryWearLabel ? `<em>${escapeHtml(uiText("Wear", "磨损"))} 路 ${escapeHtml(inventoryWearLabel)}</em>` : ""}
            </div>
            ${inventoryStickersForView.length ? `<span>${escapeHtml(uiText("Stickers on this inventory item", "这件库存物品上的贴纸"))}</span>
            <div>${inventoryStickersForView.map((sticker) => `<em>${escapeHtml(sticker.name)}</em>`).join("")}</div>` : ""}
          </div>` : ""}
        </section>
      </section>
      <section class="detail-related obsidian-related-rail">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Recommended", "相关推荐"))}</p>
          <h2>${escapeHtml(uiText("Related Items", "相关物品"))}</h2>
        </div>
        <div class="related-list">${related.map(cardMarkup).join("")}</div>
      </section>
    `;
    const wearSelect = document.getElementById("wearSelect");
    applyWearClass(selectedWear || wearSelect?.value || "factory-new");
    loadPlatformPrices(pricedItem, selectedWear, selectedVariant).then((payload) => {
      const buffPriceValue = document.getElementById("detailBuffPriceValue");
      const buffPriceHint = document.getElementById("detailBuffPriceHint");
      const youpinPriceValue = document.getElementById("detailYoupinPriceValue");
      const youpinPriceHint = document.getElementById("detailYoupinPriceHint");
      const referencePriceValue = document.getElementById("detailReferencePriceValue");
      const referencePriceHint = document.getElementById("detailReferencePriceHint");
      if (!buffPriceValue || !buffPriceHint || !youpinPriceValue || !youpinPriceHint || !referencePriceValue || !referencePriceHint) return;
      const activeId = new URLSearchParams(location.search).get("id") || getInspectorState().itemId || DEFAULT_DETAIL_ALIAS;
      const activeItem = resolveDisplayItemById(activeId);
      const activeTemplateId = activeItem ? activeSpecialTemplateId(activeItem) : "";
      if (!activeItem || activeItem.id !== resolvedItem.id || activeTemplateId !== selectedTemplateId || activeWearForItem(selectedSpecialTemplateItem(activeItem, activeTemplateId)) !== selectedWear || activeVariantForItem(selectedSpecialTemplateItem(activeItem, activeTemplateId)) !== selectedVariant) return;
      const buffValue = Number.isFinite(Number(payload?.platforms?.buff?.price)) && Number(payload.platforms.buff.price) > 0 ? Number(payload.platforms.buff.price) : null;
      const youpinValue = Number.isFinite(Number(payload?.platforms?.youpin?.price)) && Number(payload.platforms.youpin.price) > 0 ? Number(payload.platforms.youpin.price) : null;
      const referenceValue = Number.isFinite(Number(payload?.referencePrice)) && Number(payload.referencePrice) > 0
        ? Number(payload.referencePrice)
        : effectiveCatalogPrice(pricedItem);
      buffPriceValue.textContent = formatPrice(buffValue);
      buffPriceHint.textContent = platformPriceHint(payload?.platforms?.buff);
      youpinPriceValue.textContent = formatPrice(youpinValue);
      youpinPriceHint.textContent = platformPriceHint(payload?.platforms?.youpin);
      referencePriceValue.textContent = formatPrice(referenceValue);
      referencePriceHint.textContent = detailReferenceHintText(payload?.referenceSourceKey, payload?.referenceSource);
    }).catch(() => {});
    prefetchWearPrices(pricedItem, selectedWear, selectedVariant);
    const aiDetailKey = livePriceKey(pricedItem.id, selectedWear, selectedVariant);
    if (!appState.aiItemAnalyses[aiDetailKey] || appState.aiItemAnalyses[aiDetailKey]?.loading) {
      void ensureAiItemAnalysis(pricedItem, selectedWear, selectedVariant).then(() => {
        if (pageName() === "item.html") renderItemDetail();
      }).catch(() => {});
    }
  }

  function renderFavorites() {
    const root = document.getElementById("favoritesRoot");
    if (!root) return;
    if (!catalogDataAvailable()) {
      root.innerHTML = `
        <section class="page-intro" data-motion-intro data-motion-title-fast>
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Saved", "已收藏"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Saved", "已收藏"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("Your saved exhibits will stream in after the page frame is ready.", "\u9875\u9762\u6846\u67b6\u5c31\u7eea\u540e\uff0c\u79c1\u4eba\u5c55\u67dc\u4f1a\u7ee7\u7eed\u8f7d\u5165\u3002"))}</p>
        </section>
        <section class="favorites-section"><div class="empty-state">${escapeHtml(uiText("Loading saved exhibits...", "\u6b63\u5728\u52a0\u8f7d\u79c1\u4eba\u5c55\u67dc..."))}</div></section>
      `;
      return;
    }
    const favorites = getUserState().favorites.map((id) => resolveDisplayItemById(id)).filter(Boolean);
    const diyDesigns = getDiyDesigns();
    root.innerHTML = `
      <section class="page-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Saved", "已收藏"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Saved", "已收藏"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Keep saved exhibits, comparison candidates, and DIY sticker schemes in a private display case.", "\u628a\u6536\u85cf\u5c55\u54c1\u3001\u5bf9\u6bd4\u5019\u9009\u548c DIY \u8d34\u7eb8\u65b9\u6848\u4fdd\u5b58\u5728\u79c1\u4eba\u5c55\u67dc\u3002"))}</p>
      </section>
      <section class="favorites-section">
        ${favorites.length ? `<div class="favorites-grid">${favorites.map(favoriteCardMarkup).join("")}</div>` : `<div class="empty-state">${escapeHtml(uiText("No favorites yet. Use Save in the catalog or inspector to add items here.", "\u8fd8\u6ca1\u6709\u4fdd\u5b58\u7684\u5c55\u54c1\uff0c\u53ef\u4ee5\u5728\u9986\u85cf\u6216\u68c0\u89c6\u9875\u70b9\u51fb\u4fdd\u5b58\u3002"))}</div>`}
      </section>
      <section class="favorites-section">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("DIY Designs", "DIY \u65b9\u6848"))}</p>
          <h2>${escapeHtml(uiText("Sticker Gallery", "\u8d34\u7eb8\u753b\u5eca"))}</h2>
        </div>
        ${diyDesigns.length ? `<div class="collection-grid diy-favorites-grid">${diyDesigns.map((design) => `
          <article class="collection-card diy-favorite-card">
            <p class="eyebrow">${escapeHtml(design.baseName || uiText("Custom Design", "\u81ea\u5b9a\u4e49\u65b9\u6848"))}</p>
            <h3>${escapeHtml(new Date(design.createdAt || Date.now()).toLocaleString())}</h3>
            <p>${escapeHtml(uiTemplate("{count} stickers", { count: (design.stickers || []).length }))}</p>
          </article>
        `).join("")}</div>` : `<div class="empty-state">${escapeHtml(uiText("No saved sticker layouts yet.", "\u8fd8\u6ca1\u6709\u4fdd\u5b58\u8d34\u7eb8\u65b9\u6848\u3002"))}</div>`}
      </section>
    `;
  }

  function renderRecent() {
    const root = document.getElementById("recentRoot");
    if (!root) return;
    if (!catalogDataAvailable()) {
      root.innerHTML = `
        <section class="page-intro recent-page-intro" data-motion-intro data-motion-title-fast>
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Trail", "\u89c2\u5c55\u8f68\u8ff9"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Trail", "Trail"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("Recent history is loading back in now.", "\u89c2\u5c55\u8f68\u8ff9\u6b63\u5728\u6062\u590d\u3002"))}</p>
        </section>
        <div class="empty-state">${escapeHtml(uiText("Loading recent exhibits...", "\u6b63\u5728\u52a0\u8f7d\u6700\u8fd1\u5c55\u54c1..."))}</div>
      `;
      return;
    }
    const recent = getUserState().recent.map((id) => resolveDisplayItemById(id)).filter(Boolean);
    root.innerHTML = `
      <section class="page-intro recent-page-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Trail", "\u89c2\u5c55\u8f68\u8ff9"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Trail", "Trail"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Your latest inspected exhibits stay here in time order so you can return quickly.", "\u6700\u8fd1\u68c0\u89c6\u8fc7\u7684\u5c55\u54c1\u4f1a\u6309\u65f6\u95f4\u4fdd\u7559\u5728\u8fd9\u91cc\uff0c\u65b9\u4fbf\u5feb\u901f\u8fd4\u56de\u3002"))}</p>
      </section>
      <div class="recent-page-actions">
        <button class="secondary-action" id="clearRecentViews" type="button">${escapeHtml(uiText("Clear Trail", "\u6e05\u7a7a\u8f68\u8ff9"))}</button>
      </div>
      ${recent.length ? `<div class="favorites-grid recent-grid">${recent.map(favoriteCardMarkup).join("")}</div>` : `<div class="empty-state">${escapeHtml(uiText("No recent views yet. Open any item to have it appear here automatically.", "\u8fd8\u6ca1\u6709\u89c2\u5c55\u8f68\u8ff9\uff0c\u6253\u5f00\u4efb\u610f\u5c55\u54c1\u540e\u4f1a\u81ea\u52a8\u51fa\u73b0\u5728\u8fd9\u91cc\u3002"))}</div>`}
    `;
  }

  async function fetchJson(url, options) {
    const isApiRequest = String(url).startsWith("/api/");
    const requestTargets = isApiRequest ? apiRequestCandidates(url) : [url];
    const sessionToken = readAuthSessionToken();

    async function requestJson(targetUrl) {
      const response = await fetch(targetUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          ...(options?.headers || {})
        },
        ...options
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload.error || payload.message || response.statusText);
        error.status = response.status;
        error.code = payload.code || "";
        throw error;
      }
      return payload;
    }

    let lastError = null;
    for (let index = 0; index < requestTargets.length; index += 1) {
      const targetUrl = requestTargets[index];
      try {
        return await requestJson(targetUrl);
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        lastError = normalizedError;
        if (index >= requestTargets.length - 1 || !shouldRetryApiRequest(error)) throw normalizedError;
      }
    }
    throw lastError || new Error("Request failed");
  }

  function aiLoadoutSeedItemIds() {
    const favorites = getUserState().favorites.filter(Boolean);
    const synced = getSortedInventoryEntries()
      .map((entry) => inventoryInspectorTarget(entry)?.id || "")
      .filter(Boolean);
    return [...new Set((synced.length ? synced : favorites).slice(0, 24))];
  }

  const AI_LOADOUT_NAMED_ITEM_RULES = [
    { slot: "glove", query: "Vice", patterns: [/vice/i] },
    { slot: "glove", query: "Pandora", patterns: [/pandora/i] },
    { slot: "glove", query: "King Snake", patterns: [/king snake/i] },
    { slot: "glove", query: "Superconductor", patterns: [/superconductor/i] },
    { slot: "glove", query: "Amphibious", patterns: [/amphibious/i] },
    { slot: "glove", query: "Nocts", patterns: [/nocts/i] },
    { slot: "glove", query: "Hedge Maze", patterns: [/hedge maze/i] },
    { slot: "glove", query: "Crimson Kimono", patterns: [/crimson kimono/i] },
    { slot: "glove", query: "Spearmint", patterns: [/spearmint/i] },
    { slot: "glove", query: "Snow Leopard", patterns: [/snow leopard/i] },
    { slot: "glove", query: "Imperial Plaid", patterns: [/imperial plaid/i] },
    { slot: "glove", query: "Omega", patterns: [/omega/i] },
    { slot: "glove", query: "Arid", patterns: [/arid/i] },
    { slot: "glove", query: "Slingshot", patterns: [/slingshot/i] },
    { slot: "knife", query: "Butterfly Knife | Doppler", patterns: [/butterfly knife\s*doppler|butterfly\s*doppler|doppler\s*butterfly/i] },
    { slot: "knife", query: "Butterfly Knife | Gamma Doppler", patterns: [/butterfly knife\s*gamma doppler|gamma doppler\s*butterfly/i] },
    { slot: "knife", query: "Butterfly Knife | Fade", patterns: [/butterfly knife\s*fade|butterfly\s*fade|fade\s*butterfly/i] },
    { slot: "knife", query: "Butterfly Knife | Tiger Tooth", patterns: [/butterfly knife\s*tiger tooth|tiger tooth\s*butterfly/i] },
    { slot: "knife", query: "Karambit | Doppler", patterns: [/karambit\s*doppler|doppler\s*karambit/i] },
    { slot: "knife", query: "Karambit | Fade", patterns: [/karambit\s*fade|fade\s*karambit/i] },
    { slot: "knife", query: "Karambit | Tiger Tooth", patterns: [/karambit\s*tiger tooth|tiger tooth\s*karambit/i] },
    { slot: "knife", query: "Karambit | Lore", patterns: [/karambit\s*lore|lore\s*karambit/i] },
    { slot: "knife", query: "M9 Bayonet | Doppler", patterns: [/m9 bayonet\s*doppler|doppler\s*m9/i] },
    { slot: "knife", query: "M9 Bayonet | Gamma Doppler", patterns: [/m9 bayonet\s*gamma doppler|gamma doppler\s*m9/i] },
    { slot: "knife", query: "M9 Bayonet | Fade", patterns: [/m9 bayonet\s*fade|fade\s*m9/i] },
    { slot: "ak", query: "Vulcan", patterns: [/vulcan/i] },
    { slot: "ak", query: "Inheritance", patterns: [/inheritance/i] },
    { slot: "ak", query: "Bloodsport", patterns: [/bloodsport/i] },
    { slot: "ak", query: "Asiimov", patterns: [/asiimov/i] },
    { slot: "ak", query: "Case Hardened", patterns: [/case hardened/i] },
    { slot: "ak", query: "Fire Serpent", patterns: [/fire serpent/i] },
    { slot: "ak", query: "X-Ray", patterns: [/x-ray/i] },
    { slot: "m4a1", query: "Printstream", patterns: [/printstream/i] },
    { slot: "m4a1", query: "Blue Phosphor", patterns: [/blue phosphor/i] },
    { slot: "m4a1", query: "Knight", patterns: [/knight/i] },
    { slot: "m4a1", query: "Hot Rod", patterns: [/hot rod/i] },
    { slot: "m4a1", query: "Fade", patterns: [/m4a1.*fade|fade.*m4a1/i] },
    { slot: "m4a4", query: "Temukau", patterns: [/temukau/i] },
    { slot: "m4a4", query: "Howl", patterns: [/howl/i] },
    { slot: "m4a4", query: "Poseidon", patterns: [/poseidon/i] },
    { slot: "m4a4", query: "Daybreak", patterns: [/daybreak/i] },
    { slot: "usp", query: "Stainless", patterns: [/stainless/i] },
    { slot: "usp", query: "Printstream", patterns: [/usp.*printstream|printstream.*usp/i] },
    { slot: "usp", query: "Whiteout", patterns: [/whiteout/i] },
    { slot: "usp", query: "Kill Confirmed", patterns: [/kill confirmed/i] },
    { slot: "glock", query: "Fade", patterns: [/glock.*fade|fade.*glock/i] }
  ];
  const AI_LOADOUT_KNIFE_BASE_RULES = [
    { query: "Butterfly Knife", patterns: [/butterfly knife|butterfly/i] },
    { query: "Karambit", patterns: [/karambit/i] },
    { query: "M9 Bayonet", patterns: [/\bm9\b|m9 bayonet/i] },
    { query: "Bayonet", patterns: [/bayonet/i] },
    { query: "Flip Knife", patterns: [/flip knife/i] },
    { query: "Huntsman Knife", patterns: [/huntsman/i] }
  ];
  const AI_LOADOUT_KNIFE_FINISH_RULES = [
    { query: "Gamma Doppler", patterns: [/浼介┈澶氭櫘鍕抾gamma doppler/i] },
    { query: "Doppler", patterns: [/澶氭櫘鍕抾doppler/i] },
    { query: "Fade", patterns: [/娓愬彉|fade/i] },
    { query: "Tiger Tooth", patterns: [/铏庣墮|tiger tooth/i] },
    { query: "Slaughter", patterns: [/灞犲か|slaughter/i] },
    { query: "Marble Fade", patterns: [/澶х悊鐭虫笎鍙榺marble fade/i] }
  ];

  function uniquePreferredLoadoutItems(values = []) {
    const seen = new Set();
    return (Array.isArray(values) ? values : []).filter((entry) => {
      const slot = String(entry?.slot || "").trim();
      const query = String(entry?.query || "").trim();
      if (!slot || !query) return false;
      const key = `${slot}::${query.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((entry) => ({
      slot: String(entry.slot).trim(),
      query: String(entry.query).trim()
    }));
  }

  function loadoutSlotForCatalogItem(item) {
    if (!item) return "";
    if (item.type === "knife" || item.type === "glove") return item.type;
    const weapon = String(item.weaponEn || item.weapon || item.weaponZh || "").toLowerCase();
    if (weapon === "ak-47") return "ak";
    if (weapon === "m4a1-s") return "m4a1";
    if (weapon === "m4a4") return "m4a4";
    if (weapon === "usp-s") return "usp";
    if (weapon === "glock-18") return "glock";
    return "";
  }

  function preferredLoadoutItemsFromCatalog(prompt = "", occupiedSlots = new Set()) {
    const normalizedPrompt = normalizeLoadoutName(prompt);
    if (!normalizedPrompt || !Array.isArray(items) || !items.length) return [];
    const matches = [];
    for (const item of items) {
      const slot = loadoutSlotForCatalogItem(item);
      if (!slot || occupiedSlots.has(slot)) continue;
      const normalizedCandidates = [item?.nameZh, item?.nameEn, item?.name]
        .map((entry) => normalizeLoadoutName(entry))
        .filter((entry) => entry && entry.length >= 3);
      const matchedName = normalizedCandidates
        .filter((entry) => normalizedPrompt.includes(entry))
        .sort((left, right) => right.length - left.length)[0];
      if (!matchedName) continue;
      matches.push({
        slot,
        query: String(item?.nameEn || item?.name || "").trim(),
        weight: matchedName.length
      });
    }
    return matches
      .sort((left, right) => right.weight - left.weight)
      .filter((entry, index, source) => source.findIndex((other) => other.slot === entry.slot) === index)
      .map(({ slot, query }) => ({ slot, query }));
  }

  function extractPreferredLoadoutItems(prompt = "") {
    const raw = String(prompt || "");
    const normalized = raw.normalize("NFKC").trim().toLowerCase();
    const includesAll = (...tokens) => tokens.every((token) => normalized.includes(token));
    const items = [];
    const occupiedSlots = new Set();
    if (includesAll("\u8774\u8776\u5200", "\u591a\u666e\u52d2") || includesAll("butterfly", "doppler")) {
      items.push({ slot: "knife", query: "Butterfly Knife | Doppler" });
      occupiedSlots.add("knife");
    } else if (includesAll("\u8774\u8776\u5200", "\u6e10\u53d8") || includesAll("butterfly", "fade")) {
      items.push({ slot: "knife", query: "Butterfly Knife | Fade" });
      occupiedSlots.add("knife");
    } else if (includesAll("\u8774\u8776\u5200", "\u864e\u7259") || includesAll("butterfly", "tiger tooth")) {
      items.push({ slot: "knife", query: "Butterfly Knife | Tiger Tooth" });
      occupiedSlots.add("knife");
    } else if (includesAll("\u722a\u5b50\u5200", "\u591a\u666e\u52d2") || includesAll("karambit", "doppler")) {
      items.push({ slot: "knife", query: "Karambit | Doppler" });
      occupiedSlots.add("knife");
    } else if (includesAll("\u722a\u5b50\u5200", "\u6e10\u53d8") || includesAll("karambit", "fade")) {
      items.push({ slot: "knife", query: "Karambit | Fade" });
      occupiedSlots.add("knife");
    } else if (includesAll("杩堥樋瀵?", "手套") || normalized.includes("vice")) {
      items.push({ slot: "glove", query: "Vice" });
      occupiedSlots.add("glove");
    }
    for (const rule of AI_LOADOUT_NAMED_ITEM_RULES) {
      if (occupiedSlots.has(rule.slot)) continue;
      if (rule.patterns.some((pattern) => pattern.test(raw))) {
        items.push({ slot: rule.slot, query: rule.query });
        occupiedSlots.add(rule.slot);
      }
    }
    for (const match of preferredLoadoutItemsFromCatalog(raw, occupiedSlots)) {
      if (occupiedSlots.has(match.slot)) continue;
      items.push(match);
      occupiedSlots.add(match.slot);
    }
    if (!occupiedSlots.has("knife")) {
      const knifeBase = AI_LOADOUT_KNIFE_BASE_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(raw)))?.query || "";
      const knifeFinish = AI_LOADOUT_KNIFE_FINISH_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(raw)))?.query || "";
      if (knifeBase && knifeFinish) items.unshift({ slot: "knife", query: `${knifeBase} | ${knifeFinish}` });
    }
    return uniquePreferredLoadoutItems(items);
  }

  function itemSlotForUpgrade(item) {
    if (!item) return "";
    if (item.type === "knife" || item.type === "glove") return item.type;
    const text = [item.weaponEn, item.weaponZh, item.weapon, item.nameEn, item.nameZh, item.name, item.type].filter(Boolean).join(" ").trim().toLowerCase();
    if (/\bak-?47\b/.test(text)) return "ak47";
    if (/m4a1-?s/.test(text)) return "m4a1";
    if (/m4a1-?s|m4a1 娑堥煶|m4a1娑堥煶/.test(text)) return "m4a1";
    if (/usp-?s/.test(text)) return "usp";
    if (/glock-?18/.test(text)) return "glock";
    if (/desert eagle/.test(text)) return "deagle";
    if (/desert eagle|娌欓拱/.test(text)) return "deagle";
    return "";
  }

  function inventorySlotForUpgrade(entry, resolvedItem = null) {
    const resolvedSlot = itemSlotForUpgrade(resolvedItem);
    if (resolvedSlot) return resolvedSlot;
    const text = [entry?.market_hash_name, entry?.marketHashName, entry?.item_name, entry?.itemName, entry?.item_type, entry?.itemType].filter(Boolean).join(" ").toLowerCase();
    if (/\bak-?47\b/.test(text)) return "ak47";
    if (/m4a1-?s/.test(text)) return "m4a1";
    if (/m4a1-?s|m4a1 娑堥煶|m4a1娑堥煶/.test(text)) return "m4a1";
    if (/usp-?s/.test(text)) return "usp";
    if (/glock-?18/.test(text)) return "glock";
    if (/desert eagle/.test(text)) return "deagle";
    if (/knife/.test(text)) return "knife";
    if (/glove|\u624b\u5957|hand wraps/.test(text)) return "glove";
    if (/glove|\u624b\u5957|hand wraps/.test(text)) return "glove";
    return "";
  }

  function upgradeSlotLabel(slot) {
    return {
      glove: uiText("Gloves", "手套"),
      knife: uiText("Knife", "刀具"),
      ak47: "AK-47",
      awp: "AWP",
      m4a1: "M4A1-S",
      m4a4: "M4A4",
      usp: "USP-S",
      glock: "Glock-18",
      deagle: uiText("Desert Eagle", "娌欓拱")
    }[slot] || slot;
  }

  function itemThemeFamily(item) {
    const text = [item?.nameEn, item?.nameZh, item?.name, item?.tone, item?.collectionEn].filter(Boolean).join(" ").toLowerCase();
    if (/printstream|snow leopard|king snake|whiteout|stainless|damascus|vulcan|inheritance|mecha|temukau|white|silver|clean|ivory|pearl/.test(text)) return "white";
    if (/bloodsport|redline|crimson|slaughter|kill confirmed|hot rod|cyrex|code red|ruby|red|crimson/.test(text)) return "red";
    if (/vulcan|blue phosphor|superconductor|amphibious|guardian|blueprint|bright water|frontside|cobalt|blue|teal|aqua/.test(text)) return "blue";
    if (/wild lotus|hydroponic|emerald|gamma doppler|hedge maze|spearmint|jade|green|forest|bamboo/.test(text)) return "green";
    if (/neo-noir|nightwish|vice|pandora|imperial plaid|ultraviolet|black pearl|purple|pink|violet|magenta/.test(text)) return "purple";
    if (/gold|tiger tooth|fuel injector|asiimov|lore|arid|overtake|brass|dragon lore|desert hydra|yellow/.test(text)) return "gold";
    if (/nocts|black tie|black laminate|night|night stripe|slate|elite build|lunar weave|smoke out|black|dark|neutral/.test(text)) return "black";
    return String(item?.tone || "").trim().toLowerCase();
  }

  function preferredWearForUpgrade(item, sourceWear = "") {
    const wears = wearOptions(item);
    if (sourceWear && wears.includes(sourceWear)) return sourceWear;
    return ["factory-new", "minimal-wear", "field-tested", "well-worn", "battle-scarred", "default"].find((wear) => wears.includes(wear)) || "";
  }

  function snapshotPriceForItemWear(item, wearId = "") {
    const snapshotRecord = globalThis.CS2_MARKET_PRICES?.items?.[item?.id];
    if (!snapshotRecord?.prices) return 0;
    if (wearId && snapshotRecord.prices[wearId]) return Number(snapshotRecord.prices[wearId]?.price) || 0;
    return snapshotPriceFromRecord(snapshotRecord);
  }

  function snapshotWearPricesForItem(item) {
    const snapshotRecord = globalThis.CS2_MARKET_PRICES?.items?.[item?.id];
    return Object.entries(snapshotRecord?.prices || {})
      .map(([wearId, record]) => ({ wearId, price: Number(record?.price) || 0 }))
      .filter((entry) => entry.wearId && entry.price > 0);
  }

  function bestWearUpgradeForItem(item, sourcePrice, sourceWear = "") {
    const wearPrices = snapshotWearPricesForItem(item);
    if (!wearPrices.length) {
      const wearId = preferredWearForUpgrade(item, sourceWear);
      const price = Number(effectiveCatalogPrice(item)) || 0;
      return price > sourcePrice ? { item, wearId, price } : null;
    }
    const exactWear = sourceWear ? wearPrices.find((entry) => entry.wearId === sourceWear && entry.price > sourcePrice) : null;
    if (exactWear) return { item, wearId: exactWear.wearId, price: exactWear.price };
    const closestHigherWear = wearPrices
      .filter((entry) => entry.price > sourcePrice)
      .sort((a, b) => Math.abs(a.price - sourcePrice) - Math.abs(b.price - sourcePrice))[0];
    return closestHigherWear ? { item, wearId: closestHigherWear.wearId, price: closestHigherWear.price } : null;
  }

  function pushUpgradeSuggestion(suggestions, seenTargets, perSlotCounts, upgradeSlotOrder, {
    slot,
    family,
    upgrade,
    sourceItem = null,
    sourcePrice = 0,
    fallback = false
  }) {
    if (!upgrade?.item || Number(perSlotCounts.get(slot) || 0) >= 2) return false;
    const targetKey = `${upgrade.item.id}:${upgrade.wearId}`;
    if (seenTargets.has(targetKey)) return false;
    seenTargets.add(targetKey);
    perSlotCounts.set(slot, Number(perSlotCounts.get(slot) || 0) + 1);
    const delta = Number(upgrade.price) - Number(sourcePrice || 0);
    suggestions.push({
      id: upgrade.item.id,
      name: itemTitle(upgrade.item),
      weapon: upgradeSlotLabel(slot),
      type: upgrade.item.type,
      wearId: upgrade.wearId,
      image: String(upgrade.item.image || ""),
      family,
      reason: fallback
        ? (currentLanguage().startsWith("zh")
          ? `${upgradeSlotLabel(slot)} \u8865\u9f50\u63a8\u8350\uff0c\u78e8\u635f ${wearLabel(upgrade.wearId) || upgrade.wearId}\uff0c\u4ef7\u683c\u7ea6 ${formatPrice(upgrade.price)}`
          : `${upgradeSlotLabel(slot)} fill-in recommendation, ${wearLabel(upgrade.wearId) || upgrade.wearId}, about ${formatPrice(upgrade.price)}`)
        : (currentLanguage().startsWith("zh")
          ? `\u66ff\u6362 ${itemTitle(sourceItem)}\uff0c\u63a8\u8350\u78e8\u635f ${wearLabel(upgrade.wearId) || upgrade.wearId}\uff0c\u7ea6\u8d35 ${formatPrice(delta)}`
          : `Upgrade from ${itemTitle(sourceItem)}, ${wearLabel(upgrade.wearId) || upgrade.wearId}, about ${formatPrice(delta)} more`),
      price: upgrade.price,
      upgradeSlot: slot,
      sourceName: sourceItem ? itemTitle(sourceItem) : "",
      sourcePrice: Number(sourcePrice) || 0,
      upgradeDelta: Math.max(0, delta)
    });
    return suggestions.length < upgradeSlotOrder.length * 2;
  }

  function buildInventoryUpgradeRecommendations() {
    const entries = getSortedInventoryEntries();
    const seenTargets = new Set();
    const suggestions = [];
    const upgradeSlotOrder = ["glove", "knife", "ak47", "awp", "m4a1", "m4a4", "usp", "glock", "deagle"];
    const allowedSlots = new Set(upgradeSlotOrder);
    const perSlotCounts = new Map();
    const inventoryFamilies = [];
    const groupIndex = Math.max(0, Number(appState.aiInventoryUpgradeGroupIndex) || 0);
    for (const entry of entries) {
      const sourceItem = inventoryInspectorTarget(entry);
      if (!sourceItem) continue;
      const sourcePrice = Number(inventoryReferencePrice(entry));
      if (!Number.isFinite(sourcePrice) || sourcePrice <= 0) continue;
      const slot = inventorySlotForUpgrade(entry, sourceItem);
      if (!allowedSlots.has(slot) || Number(perSlotCounts.get(slot) || 0) >= 2) continue;
      const family = itemThemeFamily(sourceItem);
      if (!slot || !family) continue;
      inventoryFamilies.push(family);
      const sourceWear = inventoryWearFromEntry(entry, sourceItem);
      const candidates = items
        .filter((item) => item.id !== sourceItem.id)
        .filter((item) => itemSlotForUpgrade(item) === slot)
        .filter((item) => itemThemeFamily(item) === family)
        .map((item) => bestWearUpgradeForItem(item, sourcePrice, sourceWear))
        .filter(Boolean)
        .sort((a, b) => (a.price - sourcePrice) - (b.price - sourcePrice));
      const upgrade = candidates.length ? candidates[groupIndex % candidates.length] : null;
      if (!upgrade) continue;
      pushUpgradeSuggestion(suggestions, seenTargets, perSlotCounts, upgradeSlotOrder, { slot, family, upgrade, sourceItem, sourcePrice });
      if (suggestions.length >= upgradeSlotOrder.length * 2) break;
    }
    const dominantFamily = inventoryFamilies[0] || suggestions[0]?.family || "white";
    for (const slot of upgradeSlotOrder) {
      while (Number(perSlotCounts.get(slot) || 0) < 2) {
        const fallbackCandidates = items
          .filter((item) => itemSlotForUpgrade(item) === slot)
          .filter((item) => itemThemeFamily(item) === dominantFamily)
          .flatMap((item) => snapshotWearPricesForItem(item).map((wear) => ({ item, wearId: wear.wearId, price: wear.price })))
          .filter((candidate) => Number(candidate.price) > 0 && !seenTargets.has(`${candidate.item.id}:${candidate.wearId}`))
          .sort((a, b) => b.price - a.price);
        const fallback = fallbackCandidates.length ? fallbackCandidates[groupIndex % fallbackCandidates.length] : null;
        if (!fallback) break;
        pushUpgradeSuggestion(suggestions, seenTargets, perSlotCounts, upgradeSlotOrder, {
          slot,
          family: dominantFamily,
          upgrade: fallback,
          fallback: true
        });
      }
    }
    return suggestions.sort((left, right) => upgradeSlotOrder.indexOf(left.upgradeSlot) - upgradeSlotOrder.indexOf(right.upgradeSlot));
  }

  async function ensureAiInventoryRecommendations(force = false) {
    const cachedSuggestions = Array.isArray(appState.aiInventoryRecommendations?.suggestions)
      ? appState.aiInventoryRecommendations.suggestions
      : [];
    const cacheHasImages = cachedSuggestions.length > 0 && cachedSuggestions.every((entry) => String(entry?.image || "").trim());
    if (appState.aiInventoryLoading || (appState.aiInventoryRecommendations && cacheHasImages && !force)) return;
    appState.aiInventoryLoading = true;
    try {
      await ensureCatalogAssetsLoaded();
      const suggestions = buildInventoryUpgradeRecommendations();
      appState.aiInventoryRecommendations = {
        ok: true,
        dominantFamily: suggestions[0]?.family || "",
        suggestions,
        summary: {
          totalSuggestedCost: suggestions.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
        }
      };
    } catch {
      appState.aiInventoryRecommendations = { ok: false, suggestions: [] };
    } finally {
      appState.aiInventoryLoading = false;
      persistAiLoadoutState();
    }
  }

  async function refreshAiInventoryRecommendations() {
    if (appState.aiInventoryPriceSnapshotRefreshing) return;
    appState.aiInventoryPriceSnapshotRefreshing = true;
    appState.aiInventoryRecommendations = null;
    if (pageName() === "loadout.html") renderLoadout();
    try {
      await loadMarketPricesSnapshot({ fresh: true });
      await ensureAiInventoryRecommendations(true);
    } finally {
      appState.aiInventoryPriceSnapshotRefreshing = false;
      if (pageName() === "loadout.html") renderLoadout();
    }
  }

  async function rotateAiInventoryUpgradeGroup() {
    appState.aiInventoryUpgradeGroupIndex = Math.max(0, Number(appState.aiInventoryUpgradeGroupIndex) || 0) + 1;
    appState.aiInventoryRecommendations = null;
    await ensureAiInventoryRecommendations(true);
    if (pageName() === "loadout.html") renderLoadout();
  }

  async function ensureAiProLoadouts(force = false) {
    const hasCachedTeams = Array.isArray(appState.aiProLoadouts?.teams) && appState.aiProLoadouts.teams.length > 0;
    const cacheIsFresh = hasCachedTeams && (Date.now() - (Number(appState.aiProLoadoutsFetchedAt) || 0) < PRO_LOADOUT_CACHE_MAX_AGE_MS);
    if (appState.aiProLoadoutsLoading || (!force && cacheIsFresh)) return;
    appState.aiProLoadoutsLoading = true;
    try {
      appState.aiProLoadouts = mergeAiProLoadoutsWithFallback(await fetchJson("/api/ai/pro-loadouts"));
      appState.aiProLoadoutsFetchedAt = Date.now();
      appState.aiProLoadoutsSchemaVersion = AI_LOADOUT_SCHEMA_VERSION;
      resetProLoadoutTeamRenderCount();
    } catch {
      appState.aiProLoadouts = hasCachedTeams ? appState.aiProLoadouts : mergeAiProLoadoutsWithFallback({ ok: true, teams: [] });
    } finally {
      appState.aiProLoadoutsLoading = false;
      persistAiLoadoutState();
    }
  }

  function scheduleLoadoutHydration() {
    if (appState.loadoutHydrationStarted || (appState.aiInventoryRecommendations && appState.aiProLoadouts)) return;
    appState.loadoutHydrationStarted = true;
    appState.loadoutFrameReady = true;
    if (pageName() === "loadout.html") renderLoadout();
    window.setTimeout(async () => {
      const backgroundTasks = [ensureAiProLoadouts()];
      if (!appState.aiInventoryRecommendations) {
        backgroundTasks.push(new Promise((resolve) => {
          scheduleUiTask(() => {
            Promise.resolve(ensureAiInventoryRecommendations()).finally(resolve);
          }, { afterFrames: 2, fallbackMs: 80 });
        }));
      }
      try {
        await Promise.allSettled(backgroundTasks);
      } finally {
        appState.loadoutHydrationStarted = false;
        persistAiLoadoutState();
        if (pageName() === "loadout.html") renderLoadout();
      }
    }, 0);
  }

  function pulsePressState(element) {
    if (!(element instanceof HTMLElement)) return;
    element.classList.add("is-pressed");
    window.setTimeout(() => {
      element.classList.remove("is-pressed");
    }, 120);
  }

  async function requestAiLoadoutChat() {
    const promptInput = document.getElementById("aiLoadoutPromptInput");
    const budgetInput = document.getElementById("aiLoadoutBudgetInput");
    const prompt = String(promptInput instanceof HTMLTextAreaElement ? promptInput.value : appState.aiLoadoutChatDraft || "").trim();
    const filterOverrides = aiLoadoutFilterOverrides();
    const budget = Number(budgetInput instanceof HTMLInputElement ? budgetInput.value : appState.aiLoadoutBudgetDraft || 0);
    const budgetMessage = Number.isFinite(budget) && budget > 0
      ? `Budget ${Math.round(budget)} CNY`
      : "";
    if (!userContent) return;
    await ensureCatalogAssetsLoaded();
    appState.aiLoadoutChatPending = true;
    const requestToken = appState.aiLoadoutChatRequestToken + 1;
    appState.aiLoadoutChatRequestToken = requestToken;
    appState.aiLoadoutCategory = "all";
    const nextMessages = appState.aiLoadoutChatMessages.concat([{ role: "user", content: userContent }]);
    appState.aiLoadoutChatMessages = nextMessages;
    persistAiLoadoutState();
    if (pageName() === "loadout.html") renderLoadout();
    try {
      const preferences = parseAiLoadoutPrompt(prompt || userContent);
      const preferredItems = Array.isArray(preferences.preferredItems) ? preferences.preferredItems : [];
      const payload = await fetchJson("/api/recommendations/chat", {
        method: "POST",
        body: JSON.stringify({
          budget,
          locale: currentLanguage(),
          messages: aiLoadoutChatHistory(nextMessages),
          filterOverrides,
          preferences: {
            color: preferences.family || "",
            styles: preferences.styles || [],
            weaponPreferences: preferences.weapons || [],
            mustInclude: [
              ...(preferences.wantsKnife ? ["knife"] : []),
              ...(preferences.wantsGloves ? ["glove"] : [])
            ],
            excludeSlots: preferences.excludeSlots || [],
            preferredWears: preferences.preferredWears || [],
            budgetMode: preferences.budgetMode || "maximize",
            preferredItems,
            filterOverrides
          },
          color: preferences.family || "",
          style: prompt || "",
          weaponPreferences: preferences.weapons || [],
          mustInclude: [
            ...(preferences.wantsKnife ? ["knife"] : []),
            ...(preferences.wantsGloves ? ["glove"] : [])
          ].filter((slot) => !(preferences.avoidKnifeGloves && ["knife", "glove"].includes(slot))),
          excludeSlots: preferences.excludeSlots || [],
          preferredWears: preferences.preferredWears || [],
          budgetMode: preferences.budgetMode || "maximize",
          preferredItems,
          extraWeapons: []
        })
      });
      const assistantContent = payload?.message || payload?.engine?.note || `Generated a primary loadout with about ${Math.round((payload?.selected?.budgetUsage || 0) * 100)}% budget usage.`;
      if (appState.aiLoadoutChatRequestToken !== requestToken) return;
      appState.aiLoadoutChatMessages = appState.aiLoadoutChatMessages.concat([{
        role: "assistant",
        content: assistantContent,
        payload: normalizedPayload
      }]);
      if (payload?.preferences?.budget && !appState.aiLoadoutBudgetDraft) appState.aiLoadoutBudgetDraft = String(Math.round(Number(payload.preferences.budget)));
      appState.aiLoadoutChatDraft = "";
      persistAiLoadoutState();
    } catch (error) {
      if (appState.aiLoadoutChatRequestToken !== requestToken) return;
      appState.aiLoadoutChatMessages = appState.aiLoadoutChatMessages.concat([{
        role: "assistant",
        content: error.message || uiText("AI recommendation is temporarily unavailable.", "AI 推荐暂时不可用。"),
        payload: null
      }]);
      persistAiLoadoutState();
    } finally {
      if (appState.aiLoadoutChatRequestToken === requestToken) {
        appState.aiLoadoutChatPending = false;
        if (pageName() === "loadout.html") renderLoadout();
      }
    }
  }

  function clearAiLoadoutChat() {
    appState.aiLoadoutChatMessages = [];
    appState.aiLoadoutChatDraft = "";
    appState.aiLoadoutBudgetDraft = "";
    appState.aiLoadoutCategory = "all";
    appState.aiLoadoutChatRequestToken += 1;
    appState.aiLoadoutChatPending = false;
    persistAiLoadoutState();
    if (pageName() === "loadout.html") renderLoadout();
  }

  function aiLoadoutChatHistory(messages = []) {
    return (Array.isArray(messages) ? messages : [])
      .map((entry) => ({
        role: entry?.role === "assistant" ? "assistant" : "user",
        content: String(entry?.content || "").trim()
      }))
      .filter((entry) => entry.content);
  }

  function sanitizeAiLoadoutChatPayload(payload) {
    if (payload?.status === "question") return null;
    const suggestionTypeForSlot = (slot = "") => {
      if (slot === "knife" || slot === "glove") return slot;
      if (["usp", "glock", "deagle", "p250", "fiveseven", "tec9"].includes(slot)) return "pistol";
      if (["mp9", "mac10"].includes(slot)) return "smg";
      return "rifle";
    };
    if (payload?.selected?.items) {
      const selectedItems = Array.isArray(payload.selected.items) ? payload.selected.items : [];
      return {
        preferences: payload?.preferences || null,
        summary: {
          totalSuggestedCost: Number(payload.selected.totalPrice) || 0,
          budgetUsage: Number(payload.selected.budgetUsage) || 0,
          itemCount: Number(payload.selected.itemCount) || selectedItems.length
        },
        items: selectedItems.map((entry) => ({
          id: String(entry?.id || "").trim(),
          name: String(entry?.nameEn || entry?.name || "").trim(),
          weapon: String(entry?.slotLabel || entry?.slot || "").trim(),
          type: String(entry?.group || "") || suggestionTypeForSlot(String(entry?.slot || "")),
          group: String(entry?.group || "") || suggestionTypeForSlot(String(entry?.slot || "")),
          wearId: String(entry?.wear || entry?.wearId || "").trim(),
          image: String(entry?.image || "").trim(),
          reason: `${entry?.rarity ? `${entry.rarity}, ` : ""}${entry?.wearLabel || ""}, about ${formatPrice(entry?.price || 0)}${entry?.reason ? ` - ${entry.reason}` : ""}`,
          price: Number(entry?.price) || 0
        }))
      };
    }
    const suggestions = Array.isArray(payload?.suggestions)
      ? payload.suggestions.map((entry) => ({
          id: String(entry?.id || "").trim(),
          name: String(entry?.name || "").trim(),
          weapon: String(entry?.weapon || "").trim(),
          type: String(entry?.type || "").trim(),
          group: String(entry?.group || entry?.type || "").trim(),
          wearId: String(entry?.wearId || "").trim(),
          image: String(entry?.image || "").trim(),
          family: String(entry?.family || "").trim(),
          reason: String(entry?.reason || "").trim(),
          price: Number(entry?.price) || 0
        }))
      : [];
    const totalSuggestedCost = Number(payload?.summary?.totalSuggestedCost);
    return {
      preferences: payload?.preferences || null,
      summary: Number.isFinite(totalSuggestedCost) && totalSuggestedCost > 0
        ? { totalSuggestedCost }
        : null,
      suggestions
    };
  }

  function summarizeAiLoadoutRequest(preferences = null, fallback = "") {
    if (!preferences || typeof preferences !== "object") return fallback || "";
    const parts = [];
    const budget = Number(preferences.budget || 0);
    if (Number.isFinite(budget) && budget > 0) {
      parts.push(`${Math.round(budget)} CNY`);
    }
    if (preferences.color) parts.push(String(preferences.color));
    if (Array.isArray(preferences.styles)) {
      parts.push(...preferences.styles.map((entry) => String(entry || "").trim()).filter(Boolean));
    }
    if (Array.isArray(preferences.preferredItems)) {
      parts.push(...preferences.preferredItems.map((entry) => String(entry?.query || "").trim()).filter(Boolean));
    }
    if (Array.isArray(preferences.weaponPreferences)) {
      parts.push(...preferences.weaponPreferences.map((entry) => String(entry || "").trim()).filter(Boolean));
    }
    if (Array.isArray(preferences.preferredWears)) {
      parts.push(...preferences.preferredWears.map((entry) => String(entry || "").trim()).filter(Boolean));
    }
    if (preferences.budgetMode === "conservative") {
      parts.push(currentLanguage().startsWith("zh") ? "\u4fdd\u7559\u4e00\u70b9\u9884\u7b97" : "leave some budget");
    }
    if (preferences.budgetMode === "maximize") {
      parts.push(currentLanguage().startsWith("zh") ? "\u7528\u6ee1\u9884\u7b97" : "use the full budget");
    }
    return parts.filter(Boolean).join(", ") || fallback || "";
  }

  async function ensureAiItemAnalysis(item, wearId = "", variantId = "standard") {
    if (!item?.id) return null;
    const key = livePriceKey(item.id, wearId, variantId);
    if (appState.aiItemAnalyses[key] && !appState.aiItemAnalyses[key]?.loading) return appState.aiItemAnalyses[key];
    if (appState.aiItemAnalysisRequests[key]) return appState.aiItemAnalysisRequests[key];
    appState.aiItemAnalyses[key] = { loading: true };
    appState.aiItemAnalysisRequests[key] = fetchJson(`/api/ai/item-analysis/${encodeURIComponent(item.id)}?wear=${encodeURIComponent(wearId)}&variant=${encodeURIComponent(variantId)}`)
      .then((payload) => {
        appState.aiItemAnalyses[key] = payload;
        return payload;
      })
      .catch(() => {
        appState.aiItemAnalyses[key] = { ok: false, insights: [] };
        return appState.aiItemAnalyses[key];
      })
      .finally(() => {
        delete appState.aiItemAnalysisRequests[key];
      });
    return appState.aiItemAnalysisRequests[key];
  }

  async function ensureAiOpeningAnalysis(openingId) {
    const key = String(openingId || "").trim();
    if (!key) return null;
    if (appState.aiOpeningAnalyses[key] && !appState.aiOpeningAnalyses[key]?.loading) return appState.aiOpeningAnalyses[key];
    if (appState.aiOpeningAnalysisRequests[key]) return appState.aiOpeningAnalysisRequests[key];
    appState.aiOpeningAnalyses[key] = { loading: true };
    appState.aiOpeningAnalysisRequests[key] = fetchJson(`/api/ai/opening-analysis/${encodeURIComponent(key)}?locale=${encodeURIComponent(currentLanguage())}`)
      .then((payload) => {
        appState.aiOpeningAnalyses[key] = payload;
        return payload;
      })
      .catch(() => {
        appState.aiOpeningAnalyses[key] = { ok: false };
        return appState.aiOpeningAnalyses[key];
      })
      .finally(() => {
        delete appState.aiOpeningAnalysisRequests[key];
      });
    return appState.aiOpeningAnalysisRequests[key];
  }

  function aiSuggestionCardMarkup(entry) {
    const item = entry?.id
      ? resolveDisplayItemById(entry.id)
      : resolveDisplayItemByName(entry?.name || "");
    const href = item ? `item.html?id=${encodeURIComponent(item.id)}&wear=${encodeURIComponent(entry.wearId || "")}` : "";
    const displayName = item ? itemTitle(item) : localizedCatalogDisplayName(entry?.name || "", entry?.weapon || "");
    const displayMeta = item ? itemWeapon(item) : localizedWeaponName(entry?.weapon || categoryLabel(entry.type || ""));
    const imageUrl = String(item?.image || entry?.image || resolveCatalogImageForSuggestion(entry) || "").trim();
    const upgradeMeta = entry?.sourceName && Number(entry?.sourcePrice) > 0
      ? `<div class="ai-upgrade-price-row"><span>${escapeHtml(uiText("Current", "当前"))}: ${escapeHtml(formatPrice(entry.sourcePrice))}</span><span>${escapeHtml(uiText("Upgrade", "升级"))}: ${escapeHtml(formatPrice(entry.price))}</span><span>${escapeHtml(uiText("More", "更多"))}: ${escapeHtml(formatPrice(entry.upgradeDelta))}</span></div>`
      : "";
    const wearMeta = entry?.wearId ? `<span class="ai-wear-badge">${escapeHtml(wearLabel(entry.wearId) || entry.wearId)}</span>` : "";
    return `
      <article class="ai-suggestion-card${href ? " ai-suggestion-card-clickable" : ""}"${href ? ` data-href="${escapeHtml(href)}" tabindex="0" role="link"` : ""}>
        ${imageUrl ? lazyImageMarkup({ src: imageUrl, alt: displayName, loading: "eager", decoding: "async", fetchpriority: "low" }) : ""}
        <p class="eyebrow">${escapeHtml(displayMeta)}</p>
        <h3>${escapeHtml(displayName)}</h3>
        ${wearMeta}
        <p>${escapeHtml(entry.sourceName ? `${uiText("Upgrade", "升级")} 路 ${entry.sourceName}` : (entry.familyLabel || entry.family || uiText("Mixed", "娣锋惌")))}</p>
        ${entry.reason ? `<small>${escapeHtml(entry.reason)}</small>` : ""}
        ${upgradeMeta}
        <strong>${escapeHtml(formatPrice(entry.price))}</strong>
      </article>
    `;
  }

  function aiSuggestionCategoryDefinitions() {
    return [
      { id: "all", label: uiText("All", "鍏ㄩ儴") },
      { id: "rifle", label: uiText("Rifles", "步枪") },
      { id: "pistol", label: uiText("Pistols", "手枪") },
      { id: "smg", label: uiText("SMGs", "鍐查攱鏋?") },
      { id: "shotgun", label: uiText("Shotguns", "闇板脊鏋?") },
      { id: "machinegun", label: uiText("Machine Guns", "机枪") },
      { id: "knife", label: uiText("Knife", "刀具") },
      { id: "glove", label: uiText("Gloves", "手套") }
    ];
  }

  function aiSuggestionCategoryForEntry(entry) {
    const group = String(entry?.group || entry?.type || "");
    if (["rifle", "pistol", "smg", "shotgun", "machinegun", "knife", "glove"].includes(group)) return group;
    if (["usp", "glock", "deagle"].includes(String(entry?.upgradeSlot || ""))) return "pistol";
    return "rifle";
  }

  function aiFamilyLabel(entry = {}) {
    const item = entry?.id ? resolveDisplayItemById(entry.id) : null;
    const tone = String(item?.tone || entry.family || "").toLowerCase();
    if (tone.includes("blue")) return uiText("Blue-White", "钃濈櫧");
    if (tone.includes("green")) return uiText("Green", "缁胯壊");
    if (tone.includes("purple")) return uiText("Purple", "\u7d2b\u8272");
    if (tone.includes("gold")) return uiText("Gold", "閲戣壊");
    if (tone.includes("white")) return uiText("Clean White", "\u7eaf\u51c0\u767d");
    if (tone.includes("black") || tone.includes("neutral")) return uiText("Dark Tactical", "鏆楅粦鎴樻湳");
    if (tone.includes("red")) return uiText("Red-Black", "绾㈤粦");
    return uiText("Mixed", "娣锋惌");
  }

  function aiDominantThemeLabel(family = "") {
    return aiFamilyLabel({ family });
  }

  function aiSuggestionsForCategory(entries = [], category = "all") {
    const decorated = entries.map((entry) => ({ ...entry, familyLabel: aiFamilyLabel(entry) }));
    if (category === "all") return decorated;
    return decorated.filter((entry) => aiSuggestionCategoryForEntry(entry) === category);
  }

  function normalizeLoadoutName(value = "") {
    return String(value || "")
      .normalize("NFKC")
      .replace(/^\(\s*StatTrak\s*\)\s*/i, "")
      .replace(/^StatTrak(?:\u2122)?\s+/i, "")
      .replace(/^Souvenir\s+/i, "")
      .replace(/\bPhase\s*[1-4]\b/gi, " ")
      .replace(/[()'"`.,_\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function parseAiLoadoutPrompt(prompt = "") {
    const raw = String(prompt || "");
    const normalized = raw
      .normalize("NFKC")
      .replace(/[()'"`.,_/-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const has = (pattern) => pattern.test(raw) || pattern.test(normalized);
    const family = has(/red\s*black|black\s*red|crimson|ruby/i)
      ? "red"
      : has(/gold\s*black|black\s*gold|gold|yellow/i)
        ? "gold"
        : has(/blue\s*white|white\s*blue|blue|ice/i)
          ? "blue"
          : has(/purple|pink|violet|magenta|vice/i)
            ? "purple"
            : has(/green|emerald|jade|spearmint|hedge maze/i)
              ? "green"
              : has(/black|mono|dark|noir/i)
                ? "black"
                : "";
    const styles = [
      ["budget", /budget|cheap|value|affordable/i],
      ["luxury", /luxury|premium|elegant|expensive/i],
      ["aggressive", /aggressive|blood|fire|redline/i],
      ["neon", /neon|cyber|glow/i],
      ["collector", /collector|rare|classic/i]
    ].filter(([, pattern]) => has(pattern)).map(([id]) => id);
    const weapons = [
      ["AK-47", /ak[\s-]?47|\bak\b|ak47/i],
      ["M4A1-S", /m4a1[\s-]?s|m4a1s/i],
      ["M4A4", /\bm4a4\b|\bm4\b/i],
      ["AWP", /awp/i],
      ["USP-S", /usp[\s-]?s|\busp\b/i],
      ["Desert Eagle", /deagle|desert eagle/i],
      ["Glock-18", /glock|glock[\s-]?18/i],
      ["MP9", /mp9/i],
      ["MAC-10", /mac[\s-]?10/i]
    ].filter(([, pattern]) => has(pattern)).map(([id]) => id);
    const excludeSlots = /guns only|only guns/i.test(normalized)
      ? ["knife", "glove"]
      : [
          ...(/no knife|without knife/i.test(normalized) ? ["knife"] : []),
          ...(/no gloves?|without gloves?/i.test(normalized) ? ["glove"] : [])
        ];
    const preferredWears = [
      ["factory-new", /factory\s*new|\bfn\b/i],
      ["minimal-wear", /minimal\s*wear|\bmw\b/i],
      ["field-tested", /field-tested|field tested|\bft\b/i],
      ["well-worn", /well-worn|well worn|\bww\b/i],
      ["battle-scarred", /battle-scarred|battle scarred|\bbs\b/i]
    ].filter(([, pattern]) => has(pattern)).map(([id]) => id);
    const budgetMode = /do\s*not\s*max|leave\s*(some\s*)?budget/i.test(normalized)
      ? "conservative"
      : (/max\s*(out)?|use\s*(the\s*)?budget/i.test(normalized) ? "maximize" : "");
    const preferredItems = extractPreferredLoadoutItems(raw);
    return {
      family,
      styles,
      weapons,
      wantsKnife: /knife|karambit|bayonet|m9|butterfly/i.test(normalized),
      wantsGloves: /glove|gloves|hand wraps|sport gloves|specialist gloves/i.test(normalized),
      avoidKnifeGloves: excludeSlots.length > 0,
      excludeSlots,
      preferredWears,
      budgetMode,
      preferredItems
    };
  }

  function resolveDisplayItemByName(name = "") {
    const normalized = normalizeLoadoutName(name);
    if (!normalized) return null;
    for (const item of items) {
      const candidates = [item?.nameEn, item?.nameZh, item?.name, item?.displayName]
        .map((entry) => normalizeLoadoutName(entry))
        .filter(Boolean);
      if (candidates.some((entry) => entry === normalized)) return item;
    }
    for (const item of items) {
      const candidates = [item?.nameEn, item?.nameZh, item?.name, item?.displayName]
        .map((entry) => normalizeLoadoutName(entry))
        .filter(Boolean);
      if (candidates.some((entry) => entry.includes(normalized) || normalized.includes(entry))) return item;
    }
    return null;
  }

  function resolveCatalogImageForSuggestion(entry = {}) {
    const directId = String(entry?.id || "").trim();
    const rawName = String(entry?.name || "").trim();
    const normalizedName = normalizeLoadoutName(rawName);
    const catalog = Array.isArray(globalThis.CS2_CATALOG) ? globalThis.CS2_CATALOG : [];
    const candidates = catalog.filter((item) => item?.image);
    if (directId) {
      const byId = candidates.find((item) => String(item?.id || "") === directId);
      if (byId?.image) return String(byId.image || "");
    }
    if (!normalizedName) return "";
    const exact = candidates.find((item) => [item?.name, item?.nameZh, item?.nameEn, item?.displayName]
      .map((value) => normalizeLoadoutName(value))
      .some((value) => value === normalizedName));
    if (exact?.image) return String(exact.image || "");
    const loose = candidates.find((item) => [item?.name, item?.nameZh, item?.nameEn, item?.displayName]
      .map((value) => normalizeLoadoutName(value))
      .some((value) => value && (value.includes(normalizedName) || normalizedName.includes(value))));
    return String(loose?.image || "");
  }

  function proLoadoutHref(itemId = "") {
    const item = resolveDisplayItemById(itemId);
    return item ? itemHref(item) : "";
  }

  function proPlayerKey(team = "", player = "") {
    return `${String(team || "").trim()}::${String(player || "").trim()}`;
  }

  function proAvatarMarkup(player = {}) {
    const playerName = String(player?.name || "").trim();
    const initials = playerName.split(/\s+/).slice(0, 2).map((entry) => entry[0] || "").join("").slice(0, 2).toUpperCase();
    return proImageMarkup({
      url: player?.avatar,
      label: playerName,
      className: "pro-player-avatar",
      fallbackText: initials || "P",
      kind: "player"
    });
  }

  function proTeamLogoMarkup(team = {}) {
    const label = String(team?.team || "").trim();
    const initials = label.split(/\s+/).map((entry) => entry[0] || "").join("").slice(0, 3).toUpperCase();
    return proImageMarkup({
      url: team?.logo,
      label,
      className: "pro-team-logo",
      fallbackText: initials || "TM",
      kind: "team"
    });
  }

  function proLoadoutItemMarkup(entry = {}, label = "") {
    const item = entry.itemId
      ? resolveDisplayItemById(entry.itemId)
      : resolveDisplayItemByName(entry.name || "");
    const href = item ? itemHref(item) : "";
    const imageUrl = String(item?.image || entry?.image || "").trim();
    return `
      <article class="ai-suggestion-card${href ? " ai-suggestion-card-clickable" : ""}"${href ? ` data-href="${escapeHtml(href)}" tabindex="0" role="link"` : ""}>
        ${imageUrl ? lazyImageMarkup({ src: imageUrl, alt: item ? itemTitle(item) : localizedCatalogDisplayName(entry.name || "", ""), loading: "eager", decoding: "async", fetchpriority: "low" }) : ""}
        <p class="eyebrow">${escapeHtml(label)}</p>
        <h3>${escapeHtml(item ? itemTitle(item) : localizedCatalogDisplayName(entry.name || "", ""))}</h3>
        <p>${escapeHtml(item ? itemWeapon(item) : "")}</p>
      </article>
    `;
  }

  function proLoadoutGroupMarkup(entries = [], label = "") {
    const list = Array.isArray(entries) ? entries.filter(Boolean) : [];
    if (!list.length) return "";
    return `<div class="ai-suggestion-grid compact">${list.map((entry) => proLoadoutItemMarkup(entry, label)).join("")}</div>`;
  }

  function proPlayerLoadoutMarkup(team, player) {
    return [
      proLoadoutGroupMarkup(player?.knife, uiText("Knife", "刀具")),
      proLoadoutGroupMarkup(player?.gloves, uiText("Gloves", "\u624b\u5957")),
      proLoadoutGroupMarkup(player?.guns, uiText("Guns", "\u67aa\u68b0"))
    ].join("");
  }

  function refreshProPlayerLoadoutVisibility() {
    const activeKey = String(appState.activeProPlayerKey || "");
    document.querySelectorAll("[data-pro-player]").forEach((button) => {
      const key = String(button.getAttribute("data-pro-player") || "");
      const isActive = Boolean(activeKey && key === activeKey);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", isActive ? "true" : "false");
    });
    document.querySelectorAll("[data-pro-player-loadout]").forEach((panel) => {
      const key = String(panel.getAttribute("data-pro-player-loadout") || "");
      panel.hidden = !(activeKey && key === activeKey);
    });
  }

  function aiSuggestionTabsMarkup(targetKey, activeCategory, entries = []) {
    const counts = new Map();
    aiSuggestionCategoryDefinitions().forEach((definition) => {
      const count = definition.id === "all"
        ? entries.length
        : aiSuggestionsForCategory(entries, definition.id).length;
      counts.set(definition.id, count);
    });
    return `
      <div class="ai-filter-tabs">
        ${aiSuggestionCategoryDefinitions().filter((definition) => Number(counts.get(definition.id)) > 0).map((definition) => `
          <button class="secondary-action compact-action${definition.id === activeCategory ? " active-filter" : ""}" type="button" data-ai-category-target="${escapeHtml(targetKey)}" data-ai-category="${escapeHtml(definition.id)}">
            ${escapeHtml(definition.label)} 路 ${escapeHtml(String(counts.get(definition.id) || 0))}
          </button>
        `).join("")}
      </div>
    `;
  }

  function aiInventoryRecommendationsMarkup() {
    const payload = appState.aiInventoryRecommendations;
    if (appState.aiInventoryLoading && !payload) return `<div class="empty-state">${escapeHtml(uiText("Analyzing your inventory style...", "正在分析你的库存风格..."))}</div>`;
    if (!payload?.ok) return `<div class="empty-state">${escapeHtml(uiText("Sign in and sync inventory, or save a few favorites to unlock style recommendations.", LOADOUT_ZH.inventoryEmpty))}</div>`;
    const combo = payload.comboGuide;
    const activeCategory = appState.aiInventoryCategory || "all";
    const suggestions = aiSuggestionsForCategory(payload.suggestions || [], activeCategory);
    const snapshotUpdatedAt = globalThis.CS2_MARKET_PRICES?.updatedAt || "";
    return `
      <section class="ai-panel">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Inventory Upgrade", LOADOUT_ZH.inventoryTitle))}</p>
          <h2>${escapeHtml(uiText("More Expensive Same-Style Swaps", LOADOUT_ZH.inventoryHeading))}</h2>
        </div>
        <p class="ai-copy">${escapeHtml(uiText("Only recommends a pricier skin in the same category and color family as an item you already own. If no matching upgrade exists, it is skipped.", LOADOUT_ZH.inventoryCopy))}</p>
        <div class="ai-data-freshness">
          <span>${escapeHtml(snapshotUpdatedAt ? `${uiText("Price data", LOADOUT_ZH.priceData)} 路 ${formatDateTime(snapshotUpdatedAt)}` : uiText("Price data is loading", LOADOUT_ZH.priceLoading))}</span>
          <button class="secondary-action compact-action" id="rotateAiInventoryUpgradeGroupButton" type="button">${escapeHtml(uiText("Another set", LOADOUT_ZH.anotherSet))}</button>
          <button class="secondary-action compact-action" id="refreshAiInventoryRecommendationsButton" type="button"${appState.aiInventoryPriceSnapshotRefreshing ? " disabled" : ""}>${escapeHtml(appState.aiInventoryPriceSnapshotRefreshing ? uiText("Refreshing...", LOADOUT_ZH.refreshing) : uiText("Refresh data", LOADOUT_ZH.refresh))}</button>
        </div>
        ${combo ? `<div class="ai-combo-strip">
          <span>${escapeHtml(uiText("Recommended knife and glove direction", LOADOUT_ZH.combo))}</span>
          <strong>${escapeHtml((Array.isArray(combo.budget) ? combo.budget : []).map((name) => localizedCatalogDisplayName(name, "")).join(" + "))}</strong>
          <small>${escapeHtml(uiText("Premium option", LOADOUT_ZH.premium))}: ${escapeHtml((Array.isArray(combo.premium) ? combo.premium : []).map((name) => localizedCatalogDisplayName(name, "")).join(" + "))}</small>
        </div>` : ""}
        ${aiSuggestionTabsMarkup("inventory", activeCategory, payload.suggestions || [])}
        <div class="ai-suggestion-grid">
          ${suggestions.map(aiSuggestionCardMarkup).join("") || `<div class="empty-state">${escapeHtml(uiText("No matching items found in the current price snapshot.", LOADOUT_ZH.noSnapshot))}</div>`}
        </div>
      </section>
    `;
  }

  function aiLoadoutFilterText() {
    const parts = [];
    const preset = appState.aiLoadoutPreset || "auto";
    if (preset === "premium") parts.push("premium default slots: gloves, knife, AK-47, AWP, M4A4, M4A1-S, USP-S, Glock-18");
    if (preset === "mid") parts.push("mid budget default slots: knife, AK-47, AWP, M4A4, M4A1-S, USP-S, Glock-18");
    if (preset === "guns") parts.push("guns only: AK-47, AWP, M4A4, M4A1-S, USP-S, Glock-18, no knife, no gloves");
    if (appState.aiLoadoutColorFilter) parts.push(appState.aiLoadoutColorFilter);
    if (appState.aiLoadoutStyleFilter) parts.push(appState.aiLoadoutStyleFilter);
  }

  function aiLoadoutFilterOverrides() {
    return {
      preset: String(appState.aiLoadoutPreset || "auto").trim().toLowerCase(),
      color: String(appState.aiLoadoutColorFilter || "").trim(),
      style: String(appState.aiLoadoutStyleFilter || "").trim()
    };
  }

  function aiLoadoutFilterBarMarkup() {
    const preset = appState.aiLoadoutPreset || "auto";
    const color = appState.aiLoadoutColorFilter || "";
    const style = appState.aiLoadoutStyleFilter || "";
    const option = (value, label, selected) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
    return `
      <div class="ai-loadout-filters">
        <label>${escapeHtml(uiText("Budget logic", "\u9884\u7B97\u903B\u8F91"))}<select id="aiLoadoutPresetSelect">${option("auto", uiText("Auto by budget", "\u6309\u9884\u7B97\u81EA\u52A8"), preset)}${option("premium", uiText("3000+: gloves + knife + core guns", "3000+\uFF1A\u624B\u5957+\u5200+\u6838\u5FC3\u67AA"), preset)}${option("mid", uiText("800-3000: knife + core guns", "800-3000\uFF1A\u5200+\u6838\u5FC3\u67AA"), preset)}${option("guns", uiText("Under 800: guns only", "800\u4EE5\u4E0B\uFF1A\u53EA\u8981\u67AA"), preset)}</select></label>
        <label>${escapeHtml(uiText("Color", "\u989C\u8272"))}<select id="aiLoadoutColorSelect">${option("", uiText("Let AI infer", "\u8BA9 AI \u5224\u65AD"), color)}${option("black", uiText("Black / dark", "\u9ED1\u8272 / \u6697\u9ED1"), color)}${option("white", uiText("White / clean", "\u767D\u8272 / \u5E72\u51C0"), color)}${option("red", uiText("Red / red-black", "\u7EA2\u8272 / \u7EA2\u9ED1"), color)}${option("blue", uiText("Blue / blue-white", "\u84DD\u8272 / \u84DD\u767D"), color)}${option("green", uiText("Green", "\u7EFF\u8272"), color)}${option("purple", uiText("Purple / pink", "\u7D2B\u8272 / \u7C89\u8272"), color)}${option("gold", uiText("Gold / luxury", "\u91D1\u8272 / \u5962\u534E"), color)}</select></label>
        <label>${escapeHtml(uiText("Style", "\u98CE\u683C"))}<select id="aiLoadoutStyleSelect">${option("", uiText("No extra style", "\u4E0D\u989D\u5916\u9650\u5B9A"), style)}${option("clean", uiText("Clean", "\u5E72\u51C0"), style)}${option("understated", uiText("Subtle", "\u4F4E\u8C03\u8010\u770B"), style)}${option("luxury", uiText("Premium", "\u9AD8\u7EA7\u8D28\u611F"), style)}${option("tactical", uiText("Tactical", "\u6218\u672F\u6697\u9ED1"), style)}${option("aggressive", uiText("Aggressive", "\u5F20\u626C\u4FB5\u7565"), style)}${option("neon", uiText("Neon / cyber", "\u9713\u8679\u8D5B\u535A"), style)}</select></label>
        <div class="ai-loadout-filter-summary">${escapeHtml(aiLoadoutFilterText() || uiText("The backend will choose slots by budget.", "\u540E\u7AEF\u4F1A\u6309\u9884\u7B97\u81EA\u52A8\u9009\u62E9\u69FD\u4F4D\u3002"))}</div>
      </div>
    `;
  }

  function aiChatMarkup() {
    const messages = Array.isArray(appState.aiLoadoutChatMessages) ? appState.aiLoadoutChatMessages : [];
    const latestAssistantMessage = [...messages].reverse().find((entry) => entry?.role === "assistant");
    const payload = latestAssistantMessage?.payload || null;
    const activeCategory = appState.aiLoadoutCategory || "all";
    const requestSummary = summarizeAiLoadoutRequest(payload?.preferences, appState.aiLoadoutChatDraft || "");
    return `
      <section class="ai-panel ai-chat-panel">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("AI Loadout Chat", LOADOUT_ZH.chatTitle))}</p>
          <h2>${escapeHtml(uiText("Describe Your Ideal Setup", LOADOUT_ZH.chatHeading))}</h2>
        </div>
        <p class="ai-copy">${escapeHtml(uiText("Low budget requests stay on gun skins first, and vague requests trigger follow-up questions before recommendations.", LOADOUT_ZH.chatCopy))}</p>
        ${aiLoadoutFilterBarMarkup()}
        <form class="ai-chat-form" id="aiLoadoutChatForm">
          <label>
            ${escapeHtml(uiText("Budget (CNY)", "\u9884\u7b97\uff08\u4eba\u6c11\u5e01\uff09"))}
            <input id="aiLoadoutBudgetInput" type="number" min="0" step="50" value="${escapeHtml(String(appState.aiLoadoutBudgetDraft || ""))}" placeholder="1500" />
          </label>
          <label>
            ${escapeHtml(uiText("What do you want?", LOADOUT_ZH.askWhat))}
            <textarea id="aiLoadoutPromptInput" rows="3" placeholder="${escapeHtml(uiText("Example: blue-white, clean, mostly AK + USP, no flashy knives", "示例：蓝白配色、干净风、主要是 AK + USP、不想要花哨刀具"))}">${escapeHtml(appState.aiLoadoutChatDraft || "")}</textarea>
          </label>
          <div class="ai-chat-actions">
            <button class="primary-action" type="submit"${appState.aiLoadoutChatPending ? " disabled" : ""}>${escapeHtml(appState.aiLoadoutChatPending ? uiText("Thinking...", LOADOUT_ZH.thinking) : uiText("Ask AI", LOADOUT_ZH.askAi))}</button>
            <button class="secondary-action" id="clearAiLoadoutChatButton" type="button"${messages.length || appState.aiLoadoutChatDraft || appState.aiLoadoutBudgetDraft ? "" : " disabled"}>${escapeHtml(uiText("Clear Chat", LOADOUT_ZH.clearChat))}</button>
          </div>
        </form>
        <div class="ai-chat-log">
          ${latestAssistantMessage ? `
            <article class="ai-chat-bubble" data-role="assistant">
              <div class="ai-chat-bubble-head">
                <strong>${escapeHtml(uiText("AI Recommendation", LOADOUT_ZH.aiRecommendation))}</strong>
                ${requestSummary ? `<small>${escapeHtml(currentLanguage().startsWith("zh") ? `\u6309\u5f53\u524d\u8981\u6c42\u66f4\u65b0\uff1a${requestSummary}` : `Updated for: ${requestSummary}`)}</small>` : ""}
              </div>
              <p>${escapeHtml(latestAssistantMessage.content || "")}</p>
              ${payload?.summary?.totalSuggestedCost ? `<small>${escapeHtml(currentLanguage().startsWith("zh")
                ? `\u672c\u6b21\u63a8\u8350\u603b\u4ef7\u7ea6 ${formatPrice(payload.summary.totalSuggestedCost)}`
                : `Suggested total is about ${formatPrice(payload.summary.totalSuggestedCost)}`)}</small>` : ""}
              ${payload?.suggestions?.length ? `${aiSuggestionTabsMarkup("loadout", activeCategory, payload.suggestions)}
              <div class="ai-suggestion-grid compact">
                ${aiSuggestionsForCategory(payload.suggestions, activeCategory).map(aiSuggestionCardMarkup).join("")}
              </div>` : ""}
            </article>
          ` : appState.aiLoadoutChatPending ? `<div class="empty-state">${escapeHtml(uiText("Updating the recommendation...", LOADOUT_ZH.updating))}</div>` : `<div class="empty-state">${escapeHtml(uiText("Start with a color, mood, weapon preference, or pro player name.", LOADOUT_ZH.chatEmpty))}</div>`}
        </div>
      </section>
    `;
  }
  function aiProLoadoutsMarkup() {
    const payload = appState.aiProLoadouts;
    if (appState.aiProLoadoutsLoading && !payload) return `<div class="empty-state">${escapeHtml(uiText("Loading pro loadouts...", LOADOUT_ZH.proLoading))}</div>`;
    if (!payload?.ok) {
      return `<section class="ai-panel ai-inline-panel"><p class="eyebrow">${escapeHtml(uiText("Pro Loadouts", LOADOUT_ZH.proTitle))}</p><div class="empty-state">${escapeHtml(uiText("Pro loadouts are temporarily unavailable.", LOADOUT_ZH.proUnavailable))}</div></section>`;
    }
    const teams = Array.isArray(payload.teams) ? payload.teams : [];
    const visibleCount = Math.max(PRO_LOADOUT_TEAM_PAGE_SIZE, Number(appState.aiProTeamsRenderedCount) || PRO_LOADOUT_TEAM_PAGE_SIZE);
    const visibleTeams = teams.slice(0, visibleCount);
    const hasMoreTeams = visibleTeams.length < teams.length;
    return `
      <section class="ai-panel">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Pro Loadouts", LOADOUT_ZH.proTitle))}</p>
          <h2>${escapeHtml(uiText("By Team", LOADOUT_ZH.byTeam))}</h2>
        </div>
        <div class="pro-team-grid">
          ${visibleTeams.map((team) => `
            <article class="pro-team-card">
              <div class="pro-team-head">
                ${proTeamLogoMarkup(team)}
                <div>
                  <h3>${escapeHtml(team.team)}</h3>
                  <small><a href="${escapeHtml(team.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(uiText("Source", LOADOUT_ZH.source))}</a></small>
                </div>
              </div>
              <div class="pro-player-list">
                ${(Array.isArray(team.players) ? team.players : []).map((player) => {
                  const key = proPlayerKey(team.team, player.name);
                  const isActive = appState.activeProPlayerKey === key;
                  return `
                    <section class="pro-player-card">
                      <button class="pro-player-head${isActive ? " is-active" : ""}" type="button" data-pro-player="${escapeHtml(key)}" aria-expanded="${isActive ? "true" : "false"}">
                        ${proAvatarMarkup(player)}
                        <strong>${escapeHtml(player.name)}</strong>
                      </button>
                      <div class="pro-player-loadout" data-pro-player-loadout="${escapeHtml(key)}"${isActive ? "" : " hidden"}>
                        ${proPlayerLoadoutMarkup(team, player)}
                      </div>
                    </section>
                  `;
                }).join("")}
              </div>
            </article>
          `).join("")}
        </div>
        ${hasMoreTeams ? `<button class="load-more-button" id="loadMoreProTeams" type="button">${escapeHtml(uiText("Load More Teams", LOADOUT_ZH.loadMoreTeams))}</button>` : ""}
      </section>
    `;
  }
  function aiItemAnalysisMarkup(item, wearId = "", variantId = "standard") {
    const payload = appState.aiItemAnalyses[livePriceKey(item?.id, wearId, variantId)];
    if (payload?.loading || !payload) {
      return `<section class="ai-panel ai-inline-panel"><p class="eyebrow">${escapeHtml(uiText("AI Market Read", "AI 甯傚満鍒ゆ柇"))}</p><div class="empty-state">${escapeHtml(uiText("Reading current market data...", "正在读取当前市场数据..."))}</div></section>`;
    }
    if (!payload?.ok) {
      return `<section class="ai-panel ai-inline-panel"><p class="eyebrow">${escapeHtml(uiText("AI Market Read", "AI 甯傚満鍒ゆ柇"))}</p><h2>${escapeHtml(uiText("Market Read", "甯傚満鍒ゆ柇"))}</h2><div class="empty-state">${escapeHtml(uiText("AI market read is temporarily unavailable for this version.", "当前版本的 AI 市场判断暂时不可用。"))}</div></section>`;
    }
    return `
      <section class="ai-panel ai-inline-panel">
        <p class="eyebrow">${escapeHtml(uiText("AI Market Read", "AI 甯傚満鍒ゆ柇"))}</p>
        <h2>${escapeHtml(uiText("Market Read", "甯傚満鍒ゆ柇"))}</h2>
        <div class="ai-metric-row">
          <span>${escapeHtml(uiText("Liquidity", "娴佸姩鎬?"))}</span>
          <strong>${escapeHtml(payload.liquidity || uiText("Unknown", "未知"))}</strong>
        </div>
        ${payload.bestSellingWear ? `<div class="ai-metric-row">
          <span>${escapeHtml(uiText("Most active wear", "最活跃磨损"))}</span>
          <strong>${escapeHtml(wearLabel(payload.bestSellingWear.wearId || "") || payload.bestSellingWear.label)}</strong>
        </div>` : ""}
        ${payload.history ? `<div class="ai-metric-row">
          <span>${escapeHtml(uiText("7d trend", "7 天趋势"))}</span>
          <strong>${escapeHtml(payload.history.trend === "up" ? uiText("Rising", "涓婃定") : payload.history.trend === "down" ? uiText("Falling", "涓嬭穼") : uiText("Stable", "骞崇ǔ"))}</strong>
        </div>` : ""}
        <div class="ai-insight-list">
          ${(payload.insights || []).map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}
        </div>
      </section>
    `;
  }

  function localizeAiOpeningTopDrop(entry) {
    if (!entry || typeof entry !== "object") return null;
    const candidateNames = [entry.id, entry.name, entry.nameEn, entry.nameZh, entry.displayName]
      .map((value) => String(value || "").trim())
      .filter(Boolean);
    const catalogItem = (entry.id && itemMap.get(entry.id))
      || candidateNames
        .map((value) => inventoryInspectorTarget({ itemName: value, marketHashName: value }))
        .find(Boolean)
      || null;
    const displayName = catalogItem
      ? itemTitle(catalogItem)
      : firstNonEmpty(currentLanguage() === "en" ? entry.nameEn : entry.nameZh, entry.nameZh, entry.nameEn, entry.name, entry.id);
    const displayRarity = catalogItem
      ? rarityLabel(catalogItem)
      : firstNonEmpty(currentLanguage() === "en" ? entry.rarityEn : entry.rarityZh, entry.rarityZh, entry.rarityEn, entry.rarity, "");
    return {
      ...entry,
      catalogItem,
      displayName,
      displayRarity
    };
  }

  function aiOpeningAnalysisMarkup(openingId = "") {
    const payload = appState.aiOpeningAnalyses[String(openingId || "").trim()];
    if (payload?.loading || !payload) {
      return `<section class="ai-panel ai-inline-panel"><p class="eyebrow">${escapeHtml(uiText("AI Case Read", "AI 开箱解读"))}</p><div class="empty-state">${escapeHtml(uiText("Calculating expected value and drop profile...", "正在计算期望价值和掉落画像..."))}</div></section>`;
    }
    if (!payload?.ok) {
      return `<section class="ai-panel ai-inline-panel"><p class="eyebrow">${escapeHtml(uiText("AI Case Read", "AI 开箱解读"))}</p><h2>${escapeHtml(uiText("Input vs Return", "投入与产出"))}</h2><div class="empty-state">${escapeHtml(uiText("AI case read is temporarily unavailable.", "AI 开箱解读暂时不可用。"))}</div></section>`;
    }
    return `
      <section class="ai-panel ai-inline-panel">
        <p class="eyebrow">${escapeHtml(uiText("AI Case Read", "AI 开箱解读"))}</p>
        <h2>${escapeHtml(uiText("Input vs Return", "投入与产出"))}</h2>
        <div class="ai-metric-grid">
          <div><span>${escapeHtml(uiText("Entry Cost", "入场成本"))}</span><strong>${escapeHtml(payload.entryCost ? formatPrice(payload.entryCost) : uiText("Unknown", "未知"))}</strong></div>
          <div><span>${escapeHtml(uiText("Expected Value", "期望价值"))}</span><strong>${escapeHtml(payload.expectedValue ? formatPrice(payload.expectedValue) : uiText("Unknown", "未知"))}</strong></div>
          <div><span>${escapeHtml(uiText("ROI", "回报率"))}</span><strong>${escapeHtml(payload.roi ? `${payload.roi}%` : uiText("Unknown", "未知"))}</strong></div>
        </div>
        <p class="ai-copy">${escapeHtml(payload.commentary || "")}</p>
        ${(payload.insights || []).length ? `<div class="ai-insight-list">${payload.insights.map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}</div>` : ""}
        <div class="ai-suggestion-grid compact">
          ${(payload.topDrops || []).map((entry) => {
            const localizedEntry = localizeAiOpeningTopDrop(entry);
            return `
              <article class="ai-suggestion-card">
                <p class="eyebrow">${escapeHtml(localizedEntry?.displayRarity || "")}</p>
                <h3>${escapeHtml(localizedEntry?.displayName || "")}</h3>
                <p>${escapeHtml(currentLanguage().startsWith("zh") ? `璇ョ█鏈夊害妗跺崰姣旂害 ${localizedEntry?.probability}%` : `${localizedEntry?.probability}% chance bucket share`)}</p>
                <strong>${escapeHtml(formatPrice(localizedEntry?.price))}</strong>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function livePriceKey(itemId, wearId = "", variantId = "standard") {
    return `${String(itemId || "").trim()}::${String(variantId || "standard").trim()}::${String(wearId || "").trim()}`;
  }

  function setCatalogPriceOverrides(payload) {
    appState.catalogPriceOverrides = payload?.items && typeof payload.items === "object" ? payload.items : {};
    appState.catalogPriceOverridesLoaded = true;
    persistPriceCaches();
  }

  async function ensureCatalogPriceOverrides(force = false) {
    if (!force) {
      if (!appState.catalogPriceOverridesLoaded) {
        appState.catalogPriceOverrides = appState.catalogPriceOverrides || {};
        appState.catalogPriceOverridesLoaded = true;
      }
      return;
    }
    if (appState.catalogPriceOverridesLoading) return;
    appState.catalogPriceOverridesLoading = true;
    try {
      const payload = await fetchJson("/api/catalog-price-overrides");
      setCatalogPriceOverrides(payload);
    } catch {
      if (!appState.catalogPriceOverridesLoaded) {
        appState.catalogPriceOverrides = {};
        appState.catalogPriceOverridesLoaded = true;
      }
    } finally {
      appState.catalogPriceOverridesLoading = false;
    }
  }

  function capCachedMap(records = {}, limit = 240) {
    const entries = Object.entries(records || {});
    if (entries.length <= limit) return records || {};
    return Object.fromEntries(entries.slice(-limit));
  }

  function persistPriceCaches() {
    try {
      writeLocalJson(LIVE_PRICE_CACHE_KEY, capCachedMap(appState.livePrices, 120));
      writeLocalJson(PRICE_OVERRIDE_CACHE_KEY, capCachedMap(appState.catalogPriceOverrides, 360));
    } catch {}
  }

  function restorePriceCaches() {
    const livePrices = readLocalJson(LIVE_PRICE_CACHE_KEY, {});
    const overrides = readLocalJson(PRICE_OVERRIDE_CACHE_KEY, {});
    appState.livePrices = livePrices && typeof livePrices === "object" ? livePrices : {};
    appState.catalogPriceOverrides = overrides && typeof overrides === "object" ? overrides : {};
    appState.catalogPriceOverridesLoaded = Object.keys(appState.catalogPriceOverrides).length > 0;
  }

  function cacheCatalogPriceOverride(override) {
    if (!override?.itemId) return;
    appState.catalogPriceOverrides = {
      ...appState.catalogPriceOverrides,
      [livePriceKey(override.itemId, override.wearId, override.variantId)]: override
    };
    appState.catalogPriceOverridesLoaded = true;
    persistPriceCaches();
  }

  function cacheLivePricePayload(payload) {
    if (!payload?.id) return;
    const youpinStatus = String(payload?.platforms?.youpin?.status || "");
    const youpinPrice = Number(payload?.platforms?.youpin?.price);
    if ((youpinStatus === "error" || youpinStatus === "unavailable") && !(Number.isFinite(youpinPrice) && youpinPrice > 0)) return;
    appState.livePrices = {
      ...appState.livePrices,
      [livePriceKey(payload.id, payload.wearId, payload.variantId)]: payload
    };
    persistPriceCaches();
  }

  function applyBatchPricePayload(payload) {
    for (const [itemId, record] of Object.entries(payload?.items || {})) {
      const priceRecord = record?.prices?.default || null;
      const price = Number(priceRecord?.price);
      if (!itemId || !Number.isFinite(price) || price <= 0) continue;
      cacheCatalogPriceOverride({
        itemId,
        wearId: "",
        variantId: "standard",
        effectivePrice: price,
        effectiveSource: String(priceRecord?.source || "snapshot"),
        updatedAt: priceRecord?.updatedAt || null,
        marketHashName: String(priceRecord?.marketHashName || "")
      });
    }
  }

  function catalogPriceOverrideFor(item, wearId = "", variantId = "standard") {
    if (!item?.id) return null;
    return appState.catalogPriceOverrides[livePriceKey(item.id, wearId, variantId)] || null;
  }

  function effectiveCatalogPriceRecordForSelection(item, wearId = "", variantId = "standard") {
    if (!item) return { price: null, source: "reference", updatedAt: null, hasSyncedPlatformPrice: false };
    const override = catalogPriceOverrideFor(item, wearId, String(variantId || "standard"));
    if (Number.isFinite(Number(override?.effectivePrice)) && Number(override.effectivePrice) > 0) {
      return {
        price: Number(override.effectivePrice),
        source: String(override.effectiveSource || "").trim() || "synced",
        updatedAt: override.updatedAt || null,
        hasSyncedPlatformPrice: true
      };
    }
    const snapshotPrice = snapshotPriceForItemWear(item, wearId);
    if (Number.isFinite(Number(snapshotPrice)) && Number(snapshotPrice) > 0) {
      return { price: Number(snapshotPrice), source: "snapshot", updatedAt: null, hasSyncedPlatformPrice: true };
    }
    const fallbackPrice = Number(item?.price);
    return {
      price: Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : null,
      source: "reference",
      updatedAt: null,
      hasSyncedPlatformPrice: false
    };
  }

  function syncedPriceSourceLabel(sourceKey) {
    if (sourceKey === "youpin") return uiText("Synced YouPin reference", "已同步悠悠有品参考价");
    if (sourceKey === "buff") return uiText("Synced BUFF reference", "已同步 BUFF 参考价");
    if (sourceKey === "snapshot") return uiText("Local market snapshot", "本地市场快照");
    return uiText("Synced platform reference", "已同步平台参考价");
  }

  function effectiveCatalogPriceRecord(item) {
    const target = catalogOverrideTarget(item);
    const priceItem = target.templateItem || item;
    const override = catalogPriceOverrideFor(priceItem, target.wearId, target.variantId);
    if (Number.isFinite(Number(override?.effectivePrice)) && Number(override.effectivePrice) > 0) {
      return {
        price: Number(override.effectivePrice),
        source: String(override.effectiveSource || "").trim() || "synced",
        updatedAt: override.updatedAt || null,
        hasSyncedPlatformPrice: true
      };
    }
    const snapshotPrice = snapshotPriceForItemWear(priceItem, target.wearId);
    if (Number.isFinite(Number(snapshotPrice)) && Number(snapshotPrice) > 0) {
      return { price: Number(snapshotPrice), source: "snapshot", updatedAt: null, hasSyncedPlatformPrice: true };
    }
    const fallbackPrice = Number(priceItem?.price);
    return {
      price: Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : null,
      source: "reference",
      updatedAt: null,
      hasSyncedPlatformPrice: false
    };
  }

  function effectiveCatalogPrice(item) {
    return effectiveCatalogPriceRecord(item).price;
  }

  function detailReferenceHintText(sourceKey, fallbackText = "") {
    if (sourceKey === "youpin" || sourceKey === "buff") return syncedPriceSourceLabel(sourceKey);
    return fallbackText && fallbackText !== "PublicMarket"
      ? fallbackText
      : uiText("Public market reference", "公开市场参考价");
  }

  function platformPriceLabel(platformKey) {
    if (platformKey === "buff") return uiText("BUFF", "BUFF");
    if (platformKey === "youpin") return uiText("YouPin", "悠悠有品");
    return platformKey;
  }

  function localizePlatformMessage(message) {
    const text = String(message || "").trim();
    if (!text) return "";
    if (/Open BUFF login/i.test(text)) return uiText(text, "\u6253\u5f00\u0020\u0042\u0055\u0046\u0046\u0020\u767b\u5f55\u7a97\u53e3\u540e\uff0c\u5b8c\u6210\u767b\u5f55\u5e76\u56de\u5230\u8fd9\u91cc\u9a8c\u8bc1\u3002");
    if (/Open YouPin login/i.test(text)) return uiText(text, "\u6253\u5f00\u60a0\u60a0\u6709\u54c1\u767b\u5f55\u7a97\u53e3\u540e\uff0c\u5b8c\u6210\u767b\u5f55\u5e76\u56de\u5230\u8fd9\u91cc\u9a8c\u8bc1\u3002");
    if (/saved on the server/i.test(text)) return /YouPin/i.test(text) ? uiText(text, "\u60a0\u60a0\u6709\u54c1\u6388\u6743\u5df2\u4fdd\u5b58\u5230\u670d\u52a1\u7aef\uff0c\u540e\u7eed\u67e5\u4ef7\u4e0d\u4f9d\u8d56\u540e\u53f0\u6d4f\u89c8\u5668\u3002") : uiText(text, "\u0042\u0055\u0046\u0046\u0020\u6388\u6743\u5df2\u4fdd\u5b58\u5230\u670d\u52a1\u7aef\uff0c\u540e\u7eed\u67e5\u4ef7\u4e0d\u4f9d\u8d56\u540e\u53f0\u6d4f\u89c8\u5668\u3002");
    if (/YouPin login was not detected|missing the required local auth values|validation failed|helper browser/i.test(text)) return uiText(text, "\u5c1a\u672a\u5728\u60a0\u60a0\u6709\u54c1\u8f85\u52a9\u6d4f\u89c8\u5668\u4e2d\u68c0\u6d4b\u5230\u6709\u6548\u767b\u5f55\uff0c\u8bf7\u91cd\u65b0\u70b9\u51fb\u201c\u767b\u5f55\u60a0\u60a0\u6709\u54c1\u201d\uff0c\u5728\u5f39\u51fa\u7684\u4e13\u7528\u7a97\u53e3\u5b8c\u6210\u767b\u5f55\u540e\u518d\u9a8c\u8bc1\u3002");
    if (/saved login expired|YouPin login expired|YouPin login .*required/i.test(text)) return uiText(text, "\u60a0\u60a0\u6709\u54c1\u767b\u5f55\u6388\u6743\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u8fde\u63a5\u3002");
    if (/BUFF saved login expired|BUFF login .*required/i.test(text)) return uiText(text, "\u0042\u0055\u0046\u0046\u0020\u767b\u5f55\u6388\u6743\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u8fde\u63a5\u3002");
    if (/BUFF price unavailable/i.test(text)) return uiText(text, "\u0042\u0055\u0046\u0046\u0020\u6682\u65e0\u53ef\u7528\u62a5\u4ef7\u3002");
    if (/YouPin price unavailable/i.test(text)) return uiText(text, "\u60a0\u60a0\u6709\u54c1\u6682\u65e0\u53ef\u7528\u62a5\u4ef7\u3002");
    if (/YouPin request was rate limited, showing the last cached price/i.test(text)) return uiText(text, "\u60a0\u60a0\u6709\u54c1\u8bf7\u6c42\u89e6\u53d1\u9650\u6d41\uff0c\u6b63\u5728\u7ee7\u7eed\u663e\u793a\u4e0a\u6b21\u7f13\u5b58\u62a5\u4ef7\u3002");
    if (/YouPin request was rate limited/i.test(text)) return uiText(text, "\u60a0\u60a0\u6709\u54c1\u8bf7\u6c42\u89e6\u53d1\u9650\u6d41\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002");
    if (/YouPin synced cache has no matching price/i.test(text)) return uiText(text, "\u60a0\u60a0\u6709\u54c1\u5df2\u8fde\u63a5\uff0c\u4f46\u672c\u6b21\u540c\u6b65\u672a\u8986\u76d6\u8fd9\u4e2a\u9970\u54c1\u6216\u78e8\u635f\u3002");
    if (/BUFF synced cache has no matching price/i.test(text)) return uiText(text, "\u0042\u0055\u0046\u0046\u0020\u5df2\u8fde\u63a5\uff0c\u4f46\u672c\u6b21\u540c\u6b65\u672a\u8986\u76d6\u8fd9\u4e2a\u9970\u54c1\u6216\u78e8\u635f\u3002");
    if (/live price loaded/i.test(text)) return /YouPin/i.test(text) ? uiText(text, "\u60a0\u60a0\u6709\u54c1\u5b9e\u65f6\u4ef7\u683c\u5df2\u52a0\u8f7d\u3002") : uiText(text, "\u0042\u0055\u0046\u0046\u0020\u5b9e\u65f6\u4ef7\u683c\u5df2\u52a0\u8f7d\u3002");
    if (/synced price loaded from cache/i.test(text)) return /YouPin/i.test(text) ? uiText(text, "\u5df2\u663e\u793a\u540c\u6b65\u8fc7\u7684\u60a0\u60a0\u6709\u54c1\u62a5\u4ef7\u3002") : uiText(text, "\u5df2\u663e\u793a\u540c\u6b65\u8fc7\u7684\u0020\u0042\u0055\u0046\u0046\u0020\u62a5\u4ef7\u3002");
    return text;
  }

  function platformPriceHint(platform) {
    if (!platform) return uiText("Price data is loading.", "价格数据加载中。");
    return localizePlatformMessage(platform.message) || uiText("Price data was refreshed.", "价格数据已刷新。");
  }

  function prefetchWearPrices(item, selectedWear = "", variantId = "standard") {
    if (appState.youpinStatus?.connected) return;
    const wearIds = wearOptions(item).filter((wearId) => wearId && wearId !== selectedWear);
    wearIds.forEach((wearId) => {
      void loadPlatformPrices(item, wearId, variantId).catch(() => {});
    });
  }

  async function loadPlatformPrices(item, wearId = "", variantId = "standard") {
    if (!item?.id) return null;
    const key = livePriceKey(item.id, wearId, variantId);
    if (appState.livePrices[key]) return appState.livePrices[key];
    if (appState.livePriceRequests[key]) return appState.livePriceRequests[key];
    try {
      const params = new URLSearchParams();
      if (wearId) params.set("wear", wearId);
      if (variantId) params.set("variant", variantId);
      const query = params.toString() ? `?${params.toString()}` : "";
      const request = fetchJson(`/api/platform-prices/${encodeURIComponent(item.id)}${query}`);
      appState.livePriceRequests[key] = request;
      const payload = await request;
      if (payload?.syncedOverride?.itemId) {
        cacheCatalogPriceOverride(payload.syncedOverride);
      }
      if (payload?.referenceSourceKey === "youpin") {
        void loadMarketPricesSnapshot({ fresh: true }).then(() => {
          if (pageName() === "catalog.html") updateCatalogResults();
        }).catch(() => {});
      }
      cacheLivePricePayload(payload);
      return payload;
    } catch (error) {
      const referenceRecord = effectiveCatalogPriceRecord(item);
      const fallback = {
        id: item.id,
        wearId,
        variantId,
        referencePrice: referenceRecord.price,
        referenceSource: referenceRecord.source === "reference" ? "PublicMarket" : syncedPriceSourceLabel(referenceRecord.source),
        referenceSourceKey: referenceRecord.source,
        platforms: {
          buff: { label: "BUFF", price: null, status: "error", message: error.message || uiText("BUFF price lookup failed.", "BUFF 价格查询失败。") },
          youpin: { label: uiText("YouPin", "悠悠有品"), price: null, status: "error", message: error.message || uiText("YouPin price lookup failed.", "悠悠有品价格查询失败。") }
        }
      };
      appState.livePrices[key] = fallback;
      return fallback;
    } finally {
      delete appState.livePriceRequests[key];
    }
  }

  async function ensureAccountData(force = false, options = {}) {
    if (appState.authLoading || (appState.authLoaded && !force)) return;
    if (Date.now() < accountOverviewUnavailableUntil) {
      appState.authLoaded = true;
      appState.authLoading = false;
      appState.authStatus = appState.session ? "authenticated" : "anonymous";
      return;
    }
    const silent = Boolean(options.silent);
    appState.authLoading = true;
    if (!silent && (!appState.authLoaded || force)) appState.authStatus = "loading";
    try {
      const overview = await fetchJson("/api/account/overview");
      applyAccountOverview(overview, { clearToken: !overview.authenticated, keepFeedback: options.keepFeedback });
    } catch (error) {
      accountOverviewUnavailableUntil = Date.now() + 30000;
      appState.authStatus = appState.session ? "authenticated" : "error";
      if (!silent) {
        appState.accountError = uiText(
          "Account service is unavailable. Start the local server and refresh this page.",
          "账号服务暂不可用。请启动本地服务后刷新页面。"
        );
      }
    } finally {
      appState.authLoaded = true;
      appState.authLoading = false;
    }
  }

  function accountFeedbackMarkup() {
    const message = appState.accountError || appState.accountMessage;
    if (!message) return "";
    return `<p class="auth-feedback${appState.accountError ? " is-error" : ""}">${escapeHtml(message)}</p>`;
  }

  function clearAuthFormAutofill() {
    document.querySelectorAll("#accountLoginForm input, #accountRegisterForm input").forEach((input) => {
      if (input instanceof HTMLInputElement) input.value = "";
    });
  }

  function scheduleAuthFormAutofillClear() {
    if (Date.now() > appState.suppressAuthAutofillUntil) return;
    requestAnimationFrame(() => clearAuthFormAutofill());
    window.setTimeout(clearAuthFormAutofill, 80);
    window.setTimeout(clearAuthFormAutofill, 360);
  }

  function renderAccount() {
    const root = document.getElementById("accountRoot");
    if (!root) return;
    try {
      const user = appState.session;
      const isBusy = Boolean(appState.accountBusyAction);
      const inventoryItems = getAccountPreviewInventoryEntries(8);
      const inventoryCount = Array.isArray(appState.inventoryPreview?.items) ? appState.inventoryPreview.items.length : Number(user?.lastInventoryCount || 0);
      const steamProfile = pickSteamProfileForUser(user, appState.steamProfile, user?.steamProfile);
      const steamAvatar = steamAvatarUrl(steamProfile, user?.steamId);
      const buffStatus = appState.buffStatus || { status: "not_started", connected: false, message: uiText("Connect BUFF to unlock live BUFF prices.", "连接 BUFF 后可启用实时 BUFF 价格。") };
      const youpinStatus = appState.youpinStatus || { status: "not_started", connected: false, message: uiText("Connect YouPin to unlock live YouPin prices.", "连接悠悠有品后可启用实时悠悠有品价格。") };
      const hasSteamProfileCard = Boolean(steamProfile?.steamId || user?.steamId);
      const hasSteamProfileDetails = Boolean(steamProfile?.personaName || steamProfile?.avatar);
      const steamBindingState = user?.steamId ? (hasSteamProfileDetails ? "complete" : "bound") : "empty";
      const authUnavailable = appState.authStatus === "error" && !user;
      const authLoading = !appState.authLoaded || appState.authLoading;
      const profileCard = hasSteamProfileCard ? `
      <div class="steam-profile-info">
        ${steamAvatar ? lazyImageMarkup({ className: "steam-avatar", src: steamAvatar, alt: steamProfile.personaName || "Steam", loading: "lazy" }) : ""}
        <div>
          <span>${escapeHtml(uiText("Steam Profile", "Steam 璧勬枡"))}</span>
          <strong>${escapeHtml(steamProfile?.personaName || steamProfile?.steamId || user?.steamId || uiText("Player", "玩家"))}</strong>
          ${steamProfile?.profileUrl ? `<a href="${escapeHtml(steamProfile.profileUrl)}" target="_blank" rel="noreferrer">${escapeHtml(uiText("Open Steam Profile", "打开 Steam 主页"))}</a>` : ""}
        </div>
        <div>
          <span>${escapeHtml(uiText("Community Visibility", "社区可见性"))}</span>
          <strong>${escapeHtml(steamProfile?.visibility || uiText("Unknown", "未知"))}</strong>
        </div>
      </div>
    ` : "";
      const profileHint = hasSteamProfileCard
      ? (!hasSteamProfileDetails ? `<p class="version-note">${escapeHtml(uiText("Steam binding is saved. Public profile details will appear as soon as they are fetched successfully.", "Steam 绑定已保存，公开资料获取成功后会显示在这里。"))}</p>` : "")
      : `<p class="version-note">${escapeHtml(uiText("Bind a public SteamID64 to show the Steam name, avatar, and synced inventory here.", "绑定公开的 SteamID64 后，这里会显示 Steam 名称、头像和同步库存。"))}</p>`;
      const authMarkup = authLoading ? `
      <section class="account-panel account-loading-panel">
        <p class="eyebrow">${escapeHtml(uiText("Pass", "通行证"))}</p>
        <h2>${escapeHtml(uiText("Checking Session", "正在检查会话"))}</h2>
        <p class="account-loading-copy">${escapeHtml(uiText("Checking your local account session and synced inventory status.", "正在检查本地账号会话和库存同步状态。"))}</p>
      </section>
    ` : authUnavailable ? `
      <section class="account-panel account-loading-panel">
        <p class="eyebrow">${escapeHtml(uiText("Pass", "通行证"))}</p>
        <h2>${escapeHtml(uiText("Service Unavailable", "服务暂不可用"))}</h2>
        ${accountFeedbackMarkup()}
        <div class="account-actions">
          <button class="secondary-action" id="retryAccountButton" type="button">${escapeHtml(uiText("Retry", "重试"))}</button>
        </div>
      </section>
    ` : user ? `
      <section class="account-panel account-profile-panel">
        <p class="eyebrow">${escapeHtml(uiText("Profile", "资料"))}</p>
        <h2>${escapeHtml(user.username || uiText("Player", "玩家"))}</h2>
        <div class="account-meta" data-steam-state="${escapeHtml(steamBindingState)}">
          <div><span>${escapeHtml(uiText("Created", "创建时间"))}</span><strong>${escapeHtml(formatDateTime(user.createdAt))}</strong></div>
          <div><span>${escapeHtml(uiText("Steam ID", "Steam ID"))}</span><strong>${escapeHtml(user.steamId || uiText("Not bound", "未绑定"))}</strong></div>
          <div><span>${escapeHtml(uiText("Inventory Sync", "库存同步"))}</span><strong>${escapeHtml(formatDateTime(user.lastInventorySyncAt))}</strong></div>
          <div><span>${escapeHtml(uiText("Items Synced", "同步数量"))}</span><strong>${escapeHtml(String(user.lastInventoryCount || 0))}</strong></div>
        </div>
        ${profileCard}
        ${profileHint}
        <form class="steam-bind" id="accountSteamBindForm">
          <label>
            ${escapeHtml(uiText("Steam ID / 64-bit account", "Steam ID / 64 位账号"))}
            <input name="steamId" placeholder="7656119..." value="${escapeHtml(user.steamId || "")}" />
          </label>
          <button class="primary-action" type="submit"${isBusy ? " disabled" : ""}>${escapeHtml(uiText("Save Steam Binding", "保存 Steam 绑定"))}</button>
        </form>
        <div class="account-actions">
          <button class="secondary-action" id="syncSteamButton" type="button"${user.steamId && !isBusy ? "" : " disabled"}>${escapeHtml(appState.inventorySyncRunning ? uiText("Syncing...", "同步中...") : uiText("Sync Steam Inventory", "同步 Steam 库存"))}</button>
          <button class="secondary-action" id="accountLogoutButton" type="button"${isBusy ? " disabled" : ""}>${escapeHtml(uiText("Sign Out", "退出登录"))}</button>
        </div>
      </section>
    ` : `
      <section class="account-panel account-access-panel">
        <p class="eyebrow">${escapeHtml(uiText("Platform Access", "平台访问"))}</p>
        <h2>${escapeHtml(uiText("Sign In or Create an Account", "登录或创建账号"))}</h2>
        <div class="auth-grid account-auth-grid">
          <form class="auth-form" id="accountLoginForm" autocomplete="off">
            <h3>${escapeHtml(uiText("Sign In", "登录"))}</h3>
            <label>${escapeHtml(uiText("Username", "用户名"))}<input name="username" required minlength="3" maxlength="24" autocomplete="off" autocapitalize="none" spellcheck="false" data-lpignore="true" /></label>
            <label>${escapeHtml(uiText("Password", "密码"))}<input name="password" type="password" required minlength="6" autocomplete="new-password" data-lpignore="true" /></label>
            <button class="primary-action" type="submit"${isBusy ? " disabled" : ""}>${escapeHtml(appState.accountBusyAction === "login" ? uiText("Signing In...", "登录中...") : uiText("Sign In", "登录"))}</button>
          </form>
          <form class="auth-form" id="accountRegisterForm" autocomplete="off">
            <h3>${escapeHtml(uiText("Register", "注册"))}</h3>
            <label>${escapeHtml(uiText("Username", "用户名"))}<input name="username" required minlength="3" maxlength="24" autocomplete="off" autocapitalize="none" spellcheck="false" data-lpignore="true" /></label>
            <label>${escapeHtml(uiText("Password", "密码"))}<input name="password" type="password" required minlength="6" autocomplete="new-password" data-lpignore="true" /></label>
            <button class="secondary-action" type="submit"${isBusy ? " disabled" : ""}>${escapeHtml(appState.accountBusyAction === "register" ? uiText("Creating...", "创建中...") : uiText("Create Account", "创建账号"))}</button>
          </form>
        </div>
      </section>
    `;
      root.innerHTML = `
      <section class="page-intro account-hero" data-motion-intro>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Pass", "通行证"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Pass", "通行证"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Manage account access, Steam binding, platform credentials, inventory sync, and market price sync.", "管理账号通行、Steam 绑定、平台凭证、库存同步和市场价格同步。"))}</p>
      </section>
      ${accountFeedbackMarkup()}
      <section class="account-layout">
        <div class="account-main">
          ${authMarkup}
          <section class="account-panel account-sync-panel">
            <p class="eyebrow">${escapeHtml(uiText("Market Sync", "市场同步"))}</p>
            <h2>${escapeHtml(uiText("Market Sync", "市场同步"))}</h2>
            <div class="account-meta sync-meta">
              <div><span>${escapeHtml(uiText("Current Source", "当前来源"))}</span><strong>${escapeHtml(uiText("Public Market", "公开市场"))}</strong></div>
              <div><span>${escapeHtml(uiText("Sync Interval", "同步周期"))}</span><strong>${escapeHtml(appState.syncStatus?.intervalMinutes ? `${appState.syncStatus.intervalMinutes} min` : uiText("Unknown", "未知"))}</strong></div>
              <div><span>${escapeHtml(uiText("Task", "同步任务"))}</span><strong>${escapeHtml(appState.syncStatus?.running ? uiText("Running", "运行中") : uiText("Idle", "空闲"))}</strong></div>
              <div><span>${escapeHtml(uiText("Last Run", "上次执行"))}</span><strong>${escapeHtml(formatDateTime(appState.syncStatus?.lastRunAt))}</strong></div>
              <div><span>${escapeHtml(uiText("Next Run", "下次执行"))}</span><strong>${escapeHtml(formatDateTime(appState.syncStatus?.nextRunAt))}</strong></div>
            </div>
            <div class="account-actions">
              <small>${escapeHtml(uiText("Viewing an item now automatically saves the latest platform price and reuses it as the reference price across the catalog and inspector.", "查看任意饰品后，系统会自动保存最新平台价格，并在目录和检视器中作为参考价复用。"))}</small>
            </div>
          </section>
        </div>
        <div class="account-side">
          <section class="account-panel">
            <p class="eyebrow">${escapeHtml(uiText("BUFF", "BUFF"))}</p>
            <h2>${escapeHtml(uiText("BUFF Price Login", "BUFF 价格登录"))}</h2>
            <div class="account-meta sync-meta">
              <div><span>${escapeHtml(uiText("Connection", "连接状态"))}</span><strong>${escapeHtml(buffStatus.connected ? uiText("Connected", "已连接") : uiText("Not Connected", "未连接"))}</strong></div>
              <div><span>${escapeHtml(uiText("Last Validation", "最近验证"))}</span><strong>${escapeHtml(formatDateTime(buffStatus.lastValidatedAt))}</strong></div>
            </div>
            <p class="version-note">${escapeHtml(localizePlatformMessage(buffStatus.message) || uiText("Use the helper browser only for the initial BUFF login. After validation, live prices keep working without leaving that browser open.", "仅首次连接 BUFF 时使用辅助浏览器。验证成功后，实时价格可继续使用。"))}</p>
            <div class="account-actions">
              <button class="primary-action" id="startBuffLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Log In to BUFF", "登录 BUFF"))}</button>
              <button class="secondary-action" id="validateBuffLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Validate BUFF Session", "验证 BUFF 登录"))}</button>
              <button class="secondary-action" id="disconnectBuffLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Disconnect BUFF", "解绑 BUFF"))}</button>
            </div>
          </section>
          <section class="account-panel">
            <p class="eyebrow">${escapeHtml(uiText("YouPin", "悠悠有品"))}</p>
            <h2>${escapeHtml(uiText("YouPin Price Login", "悠悠有品价格登录"))}</h2>
            <div class="account-meta sync-meta">
              <div><span>${escapeHtml(uiText("Connection", "连接状态"))}</span><strong>${escapeHtml(youpinStatus.connected ? uiText("Connected", "已连接") : uiText("Not Connected", "未连接"))}</strong></div>
              <div><span>${escapeHtml(uiText("Last Validation", "最近验证"))}</span><strong>${escapeHtml(formatDateTime(youpinStatus.lastValidatedAt))}</strong></div>
            </div>
            <p class="version-note">${escapeHtml(localizePlatformMessage(youpinStatus.message) || uiText("Use the helper browser only for the initial YouPin login. After validation, live prices keep working without leaving that browser open.", "仅首次连接悠悠有品时使用辅助浏览器。验证成功后，无需保持浏览器开启也能继续获取实时价格。"))}</p>
            <div class="account-actions">
              <button class="primary-action" id="startYoupinLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Log In to YouPin", "登录悠悠有品"))}</button>
              <button class="secondary-action" id="validateYoupinLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Validate YouPin Session", "验证悠悠有品登录"))}</button>
              <button class="secondary-action" id="disconnectYoupinLoginButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(uiText("Disconnect YouPin", "解绑悠悠有品"))}</button>
              <button class="secondary-action" id="runSyncButton" type="button"${user && !isBusy ? "" : " disabled"}>${escapeHtml(appState.accountBusyAction === "price-sync" ? uiText("Syncing YouPin Prices...", "正在同步悠悠有品价格...") : uiText("Sync YouPin Prices", "同步悠悠有品价格"))}</button>
            </div>
          </section>
        </div>
        <section class="account-panel account-inventory-panel">
          <div class="account-panel-heading">
            <div>
              <p class="eyebrow">${escapeHtml(uiText("Inventory", "库存"))}</p>
              <h2>${escapeHtml(uiText("Vault Preview", "藏库预览"))}</h2>
            </div>
            <p class="inventory-summary">${escapeHtml(user ? uiTemplate("{count} synced items are ready for preview here.", { count: inventoryCount }) : uiText("After Steam is bound, synced items will appear here.", "绑定 Steam 后，同步库存会显示在这里。"))}</p>
          </div>
          <div class="inventory-grid">
            ${inventoryItems.slice(0, 8).map(safeInventoryCardMarkup).join("") || `<div class="empty-state">${escapeHtml(uiText("No synced inventory yet.", "还没有同步到库存。"))}</div>`}
          </div>
        </section>
      </section>
      ${!globalThis.CS2_MARKET_PRICES?.items && inventoryItems.length ? `<p class="inventory-summary">${escapeHtml(uiText("Prices are loading in the background and will appear shortly.", "价格正在后台加载，很快会显示。"))}</p>` : ""}
    `;
      if (!user) scheduleAuthFormAutofillClear();
    } catch (error) {
      console.error("Account page render failed", error);
      root.innerHTML = `
        <section class="page-intro account-hero" data-motion-intro>
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Pass", "通行证"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Pass", "通行证"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("This page hit a temporary render error. Reload once or reopen the page.", "页面暂时渲染失败，请刷新或重新打开。"))}</p>
        </section>
        <div class="empty-state">${escapeHtml(error?.message || uiText("Unable to render account page right now.", "暂时无法渲染账号页面。"))}</div>
      `;
    }
  }

  function renderInventory() {
    const root = document.getElementById("inventoryGalleryRoot");
    if (!root) return;
    try {
      queueInventoryMarketPricesLoad();
      const synced = getSortedInventoryEntries();
      const visibleEntries = getVisibleInventoryEntries();
      const syncedTotalValue = synced.reduce((sum, entry) => {
        const nextValue = Number(inventoryReferencePrice(entry));
        return sum + (Number.isFinite(nextValue) ? nextValue : 0);
      }, 0);
      const isLoadingInventory = appState.authLoading || (!appState.authLoaded && appState.authStatus !== "error");
      root.innerHTML = `
      <section class="page-intro account-page" data-motion-intro>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Vault", "\u4e2a\u4eba\u85cf\u5e93"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Vault", "Vault"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Review synced Steam inventory, total value, item prices, and jump directly into inspection.", "\u67e5\u770b\u5df2\u540c\u6b65\u7684 Steam \u5e93\u5b58\u3001\u603b\u4ef7\u503c\u3001\u5355\u54c1\u4ef7\u683c\uff0c\u5e76\u76f4\u63a5\u8df3\u8f6c\u68c0\u89c6\u3002"))}</p>
        ${synced.length ? `<p class="inventory-summary">${escapeHtml(uiText("Total value", "总价值"))} 路 ${escapeHtml(formatPrice(syncedTotalValue))}</p>` : ""}
      </section>
      ${synced.length ? `
        <section class="inventory-grid">
          ${visibleEntries.map(safeInventoryCardMarkup).join("")}
        </section>
        ${visibleEntries.length < synced.length ? `<button class="load-more-button" id="loadMoreInventory" type="button">${escapeHtml(currentLanguage().startsWith("zh") ? `?????${visibleEntries.length}/${synced.length}?` : `Load More (${visibleEntries.length}/${synced.length})`)}</button>` : ""}
        ${!globalThis.CS2_MARKET_PRICES?.items ? `<p class="inventory-summary">${escapeHtml(uiText("Prices are loading in the background and will appear shortly.", "价格正在后台加载，很快会显示。"))}</p>` : ""}
      ` : `<div class="empty-state">${escapeHtml(isLoadingInventory ? uiText("Loading synced Steam inventory...", "正在加载已同步的 Steam 库存...") : uiText("No synced inventory yet. Bind Steam and run inventory sync from the account page.", "还没有同步库存。请在通行证页面绑定 Steam 并同步库存。"))}</div>`}
    `;
    } catch (error) {
      console.error("Inventory page render failed", error);
      root.innerHTML = `
        <section class="page-intro account-page" data-motion-intro>
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Vault", "\u4e2a\u4eba\u85cf\u5e93"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Vault", "Vault"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("This page hit a temporary render error. Reload once or reopen the page.", "页面暂时渲染失败，请刷新或重新打开。"))}</p>
        </section>
        <div class="empty-state">${escapeHtml(error?.message || uiText("Unable to render inventory page right now.", "暂时无法渲染库存页面。"))}</div>
      `;
    }
  }

  function preserveWindowScrollDuringRender(callback) {
    const beforeX = Number(window.scrollX || window.pageXOffset || 0);
    const beforeY = Number(window.scrollY || window.pageYOffset || 0);
    const result = callback();
    if (typeof window.scrollTo === "function") window.scrollTo(beforeX, beforeY);
    return result;
  }

  function preserveElementViewportDuringRender(element, callback) {
    const beforeTop = element?.getBoundingClientRect?.().top;
    const beforeX = Number(window.scrollX || window.pageXOffset || 0);
    const beforeY = Number(window.scrollY || window.pageYOffset || 0);
    const result = callback();
    if (Number.isFinite(beforeTop) && typeof window.scrollTo === "function") {
      const afterTop = element?.getBoundingClientRect?.().top;
      if (Number.isFinite(afterTop)) window.scrollTo(beforeX, beforeY + afterTop - beforeTop);
    }
    return result;
  }

  function renderLoadout() {
    const root = document.getElementById("loadoutRoot");
    if (!root) return;
    const hasCatalog = Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length;
    const hasInventoryPayload = Boolean(appState.aiInventoryRecommendations);
    const hasProPayload = Boolean(appState.aiProLoadouts);
    const frameState = appState.loadoutFrameReady ? "ready" : (appState.loadoutHydrationStarted ? "hydrating" : "frame");
    root.innerHTML = `
      <section class="page-intro account-page" data-motion-intro data-loadout-stage="${escapeHtml(frameState)}">
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Curator", LOADOUT_ZH.curator))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Curator", LOADOUT_ZH.curator))}</h1>
        <p data-motion-part="copy">${escapeHtml((hasCatalog || hasInventoryPayload || hasProPayload)
          ? uiText("Ask for budget-aware skin pairings, same-color inventory upgrades, and pro-inspired references.", LOADOUT_ZH.introReady)
          : uiText("The curator console appears first; recommendations and references stream in after catalog data is ready.", LOADOUT_ZH.introLoading))}</p>
      </section>
      ${aiChatMarkup()}
      ${(hasCatalog || hasInventoryPayload || appState.aiInventoryLoading)
        ? aiInventoryRecommendationsMarkup()
        : `<section class="ai-panel ai-inline-panel" data-loadout-stage="frame"><p class="ai-copy">${escapeHtml(uiText("Preparing recommendations...", LOADOUT_ZH.preparing))}</p></section>`}
      ${(hasProPayload || appState.aiProLoadoutsLoading)
        ? aiProLoadoutsMarkup()
        : `<section class="ai-panel ai-inline-panel" data-loadout-stage="hydrating"><p class="ai-copy">${escapeHtml(uiText("Loading pro references...", LOADOUT_ZH.proLoading))}</p></section>`}
    `;
    if (!appState.aiInventoryRecommendations || !appState.aiProLoadouts) {
      scheduleLoadoutHydration();
    }
  }
  function renderCompareTray() {
    const root = document.getElementById("compareTray");
    if (!root) return;
    const compareItems = getUserState().compare.map((id) => resolveDisplayItemById(id)).filter(Boolean);
    if (!compareItems.length) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    root.hidden = false;
    root.innerHTML = `
      <div class="compare-tray-head">
        <div>
          <p class="eyebrow">${escapeHtml(uiText("Compare", "对比"))}</p>
          <strong>${escapeHtml(uiTemplate("{count} items selected", { count: compareItems.length }))}</strong>
        </div>
        <button class="secondary-action compact-action" type="button" data-compare-clear>${escapeHtml(uiText("Clear Compare", "清空对比"))}</button>
      </div>
      <div class="compare-tray-grid">${compareItems.map(compareChipMarkup).join("")}</div>
    `;
  }

  function applyWearClass(wearId) {
    const scene = document.getElementById("inspectScene");
    if (!scene) return;
    const known = Object.keys(WEAR_TEXT).map((id) => `wear-${id}`);
    scene.classList.remove(...known);
    scene.classList.add(`wear-${wearId}`);
  }

  function refreshFavoriteSurfaces() {
    renderFavorites();
    renderRecent();
    renderCompareTray();
    if (pageName() === "catalog.html") updateCatalogResults();
    if (pageName() === "item.html") renderItemDetail();
    if (pageName() === "loadout.html") renderLoadout();
    if (pageName() === "index.html") renderHome();
  }

  function toggleFavorite(id) {
    if (!requireAuthForFavorite()) return;
    const current = getUserState();
    current.favorites = current.favorites.includes(id) ? current.favorites.filter((entry) => entry !== id) : [id, ...current.favorites].slice(0, 240);
    setUserState(current);
    refreshFavoriteSurfaces();
  }

  function redirectToAccountLogin(reason = "") {
    const params = new URLSearchParams();
    params.set("login", "1");
    if (reason) params.set("reason", reason);
    const target = `account.html?${params.toString()}`;
    location.assign(location.protocol === "file:" ? localPageUrl(target) : target);
  }

  function requireAuthForFavorite() {
    if (appState.session) return true;
    appState.accountError = "";
      appState.accountMessage = uiText("Please sign in first.", "请先登录。");
    redirectToAccountLogin("favorite-login");
    return false;
  }

  function toggleCompare(id) {
    const current = getUserState();
    current.compare = current.compare.includes(id) ? current.compare.filter((entry) => entry !== id) : [...current.compare, id].slice(0, 4);
    setUserState(current);
    renderCompareTray();
    if (pageName() === "catalog.html") updateCatalogResults();
    if (pageName() === "item.html") renderItemDetail();
  }

  function clearRecentViews() {
    const current = getUserState();
    current.recent = [];
    setUserState(current);
    renderRecent();
  }

  function saveCurrentDiyDesign() {
    const current = resolveDisplayItemById(new URLSearchParams(location.search).get("id") || DEFAULT_DETAIL_ALIAS);
    const stickers = [...document.querySelectorAll("#freeStickerOverlay .free-sticker")].map((node) => ({
      image: node.getAttribute("src") || "",
      name: node.getAttribute("alt") || "",
      x: Number.parseFloat(node.style.left) || 50,
      y: Number.parseFloat(node.style.top) || 50,
      size: Number.parseFloat(node.style.width) || 13,
      rotate: Number((node.getAttribute("style")?.match(/rotate\((-?\d+)/) || [])[1] || 0)
    }));
    if (!current || !stickers.length) {
      return Promise.resolve({ ok: false, message: uiText("No sticker layout to save yet.", "还没有可保存的贴纸布局。") });
    }
    const designs = getDiyDesigns();
    designs.unshift({
      id: `${current.id}-${Date.now()}`,
      baseItemId: current.id,
      baseName: itemTitle(current),
      baseImage: current.image || "",
      collectionLabel: collectionLabel(current),
      createdAt: new Date().toISOString(),
      stickers
    });
    setDiyDesigns(designs.slice(0, 24));
    renderFavorites();
    return Promise.resolve({ ok: true, message: uiText("Saved to Favorites.", "已保存到收藏夹。") });
  }

  function supportsStickerDiy(item) {
    return ["pistol", "rifle", "smg", "shotgun", "machinegun"].includes(item?.type || "");
  }

  async function submitAuthForm(endpoint, form) {
    const body = Object.fromEntries(new FormData(form).entries());
    const isRegister = endpoint.includes("register");
    setAccountBusyAction(isRegister ? "register" : "login");
    renderAccount();
    let result;
    try {
      result = await fetchJson(endpoint, { method: "POST", body: JSON.stringify(body) });
    } catch (error) {
      setAccountBusyAction("");
      const rawMessage = String(error.message || "");
      const readableMessage = /[\u4e00-\u9fff]/.test(rawMessage) && !rawMessage.includes(String.fromCodePoint(0xfffd)) ? rawMessage : "";
      if (readableMessage) throw new Error(readableMessage);
      if (isRegister && (error.code === "account_exists" || error.status === 409)) {
        throw new Error(uiText("This account already exists. Please change the username or sign in.", "该账号已存在，请更换用户名或直接登录。"));
      }
      if (isRegister && (error.code === "invalid_credentials" || error.status === 400)) {
        throw new Error(uiText("Username must be at least 3 characters and password at least 6 characters.", "用户名至少 3 个字符，密码至少 6 个字符。"));
      }
      if (!isRegister && (error.code === "account_not_found" || error.status === 404)) {
        throw new Error(uiText("This account does not exist. Please register first.", "该账号不存在，请先注册。"));
      }
      if (!isRegister && (error.code === "bad_password" || error.status === 401)) {
        throw new Error(uiText("The password is incorrect. Please fix it and try again.", "\u5bc6\u7801\u4e0d\u6b63\u786e\uff0c\u8bf7\u4fee\u6539\u540e\u91cd\u8bd5\u3002"));
      }
      throw new Error(rawMessage || uiText("Account service is unavailable. Please try again after starting the local server.", "账号服务不可用，请启动本地服务后重试。"));
    }
    if (result.sessionToken) {
      saveAuthSessionToken(result.sessionToken);
    }
    if (result.user) {
      applyAuthenticatedUser(result.user, { keepFeedback: true });
      appState.steamProfileMeta = result.user.steamProfile ? { ok: true, profile: result.user.steamProfile } : appState.steamProfileMeta;
    }
    appState.accountError = "";
    appState.accountMessage = isRegister
      ? uiText("Account created and signed in.", "账号已创建并完成登录。")
      : uiText("Signed in successfully.", "鐧诲綍鎴愬姛銆?");
    setAccountBusyAction("");
    renderAccount();
    renderInventory();
    if (location.protocol === "file:") {
      location.assign(localPageUrl("account.html?login=1"));
      return;
    }
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function logoutAccount() {
    setAccountBusyAction("logout");
    renderAccount();
    await fetchJson("/api/auth/logout", { method: "POST", body: "{}" });
    applyLoggedOutState({ clearToken: true, keepFeedback: true });
    appState.accountMessage = uiText("Signed out.", "已退出登录。");
    appState.accountError = "";
    setAccountBusyAction("");
    renderAccount();
    renderInventory();
  }

  async function saveSteamBinding(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "";
    if (submitButton) {
      submitButton.textContent = uiText("Saving...", "保存中...");
      submitButton.setAttribute("disabled", "disabled");
    }
    const body = Object.fromEntries(new FormData(form).entries());
    const rawSteamId = String(body.steamId || "").trim();
    const steamIdMatch = rawSteamId.match(/7656119\d{10}/);
    if (steamIdMatch) body.steamId = steamIdMatch[0];
    const nextSteamId = String(body.steamId || "").trim();
    const previousSteamId = String(appState.session?.steamId || "").trim();
    if (nextSteamId && nextSteamId !== previousSteamId) {
      appState.steamProfile = steamProfileFallback(nextSteamId);
      appState.steamProfileMeta = { ok: true, profile: appState.steamProfile };
      appState.inventoryPreview = emptyInventoryPreview();
      resetInventorySortCache();
    }
    try {
      setAccountBusyAction("steam-bind");
      renderAccount();
      const payload = await fetchJson("/api/auth/steam/bind", { method: "POST", body: JSON.stringify(body) });
      if (payload?.user) applyAuthenticatedUser(payload.user, { keepFeedback: true });
      if (payload?.profile) {
        appState.steamProfile = pickSteamProfileForUser(payload.user || appState.session, payload.profile);
        appState.steamProfileMeta = { ok: true, profile: appState.steamProfile };
      } else if (payload?.user) {
        appState.steamProfile = pickSteamProfileForUser(payload.user, payload.user.steamProfile, appState.steamProfile);
        appState.steamProfileMeta = { ok: true, profile: appState.steamProfile };
      }
    } catch (error) {
      if (submitButton) {
        submitButton.textContent = originalButtonText;
        submitButton.removeAttribute("disabled");
      }
      setAccountBusyAction("");
      if (error.status === 400) {
        throw new Error(uiText("Please enter a valid SteamID64 or a Steam profile URL containing it.", "璇疯緭鍏ユ湁鏁堢殑 SteamID64锛屾垨鍖呭惈 SteamID64 鐨?Steam 涓婚〉閾炬帴銆?"));
      }
      if (error.status === 401) {
        throw new Error(uiText("Please sign in again before saving Steam binding.", "璇烽噸鏂扮櫥褰曞悗鍐嶄繚瀛?Steam 缁戝畾銆?"));
      }
      throw error;
    }
    appState.accountMessage = uiText("Steam binding saved. Use Sync Steam Inventory when you want to refresh inventory.", "Steam 绑定已保存，需要刷新库存时请使用“同步 Steam 库存”。");
    appState.accountError = "";
    setAccountBusyAction("");
    renderAccount();
    renderInventory();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function runSteamSync() {
    appState.inventorySyncRunning = true;
    renderAccount();
    try {
      const result = await fetchJson("/api/steam/sync", { method: "POST", body: "{}" });
      appState.accountMessage = uiText("Steam inventory synced.", "Steam 库存已同步。");
      appState.accountError = "";
      if (appState.session) {
        appState.session = {
          ...appState.session,
          lastInventorySyncAt: result?.syncedAt || appState.session.lastInventorySyncAt,
          lastInventoryCount: Number(result?.count ?? appState.session.lastInventoryCount ?? 0)
        };
      }
      appState.inventoryPreview = {
        ok: true,
        count: Number(result?.count || 0),
        syncedAt: result?.syncedAt || null,
        items: Array.isArray(result?.items) ? result.items : []
      };
      resetInventorySortCache();
      resetInventoryRenderCount();
      if (result?.profile) {
        appState.steamProfile = result.profile;
        appState.steamProfileMeta = { ok: true, profile: result.profile };
      }
      renderAccount();
      renderInventory();
      void scheduleAccountRefresh({ keepFeedback: true });
    } finally {
      appState.inventorySyncRunning = false;
      renderAccount();
    }
  }

  async function runPriceSync() {
    setAccountBusyAction("price-sync");
    renderAccount();
    const payload = await fetchJson("/api/price-sync/run", { method: "POST", body: "{}" });
    const count = Number(payload?.youpin?.itemCount || payload?.youpin?.matchedCount || 0);
    appState.accountMessage = count
      ? uiTemplate("YouPin price sync completed: {count} items.", { count: String(count) })
      : uiText("YouPin price sync completed, but no matching prices were found.", "悠悠有品价格同步完成，但没有匹配到可用报价。");
    appState.accountError = "";
    clearLivePriceCache();
    setAccountBusyAction("");
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function startBuffLogin() {
    await fetchJson("/api/buff/connect/start", { method: "POST", body: "{}" });
    appState.accountMessage = uiText(
      "A dedicated BUFF browser window has been opened. Sign in there, validate once here, then you may close that browser.",
      "\u5df2\u6253\u5f00\u4e13\u7528\u0020\u0042\u0055\u0046\u0046\u0020\u6d4f\u89c8\u5668\u7a97\u53e3\u3002\u8bf7\u5148\u5728\u7a97\u53e3\u91cc\u5b8c\u6210\u767b\u5f55\uff0c\u518d\u56de\u5230\u8fd9\u91cc\u70b9\u51fb\u201c\u9a8c\u8bc1\u0020\u0042\u0055\u0046\u0046\u0020\u767b\u5f55\u201d\uff1b\u9a8c\u8bc1\u6210\u529f\u540e\u5373\u53ef\u5173\u95ed\u8be5\u6d4f\u89c8\u5668\u3002"
    );
    appState.accountError = "";
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function validateBuffLogin() {
    const payload = await fetchJson("/api/buff/connect/status?refresh=1");
    appState.buffStatus = payload.status || null;
    clearLivePriceCache();
    appState.accountMessage = payload.status?.connected
      ? uiText("BUFF login verified and saved. Item pages will now prefer live BUFF prices without keeping the helper browser open.", "BUFF 登录已验证并保存，饰品页现在会优先显示实时 BUFF 价格，无需保持辅助浏览器开启。")
      : (localizePlatformMessage(payload.status?.message) || uiText("BUFF login is not ready yet.", "BUFF 登录尚未准备好。"));
    appState.accountError = "";
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function disconnectBuffLogin() {
    await fetchJson("/api/buff/connect", { method: "DELETE" });
    appState.buffStatus = null;
    appState.accountMessage = uiText("BUFF session disconnected.", "BUFF 会话已解绑。");
    appState.accountError = "";
    clearLivePriceCache();
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function startYoupinLogin() {
    await fetchJson("/api/youpin/connect/start", { method: "POST", body: "{}" });
    appState.accountMessage = uiText(
      "A dedicated YouPin browser window has been opened. Sign in there, validate once here, then you may close that browser.",
      "\u5df2\u6253\u5f00\u4e13\u7528\u60a0\u60a0\u6709\u54c1\u6d4f\u89c8\u5668\u7a97\u53e3\u3002\u8bf7\u5148\u5728\u7a97\u53e3\u91cc\u5b8c\u6210\u767b\u5f55\uff0c\u518d\u56de\u5230\u8fd9\u91cc\u70b9\u51fb\u201c\u9a8c\u8bc1\u60a0\u60a0\u6709\u54c1\u767b\u5f55\u201d\uff1b\u9a8c\u8bc1\u6210\u529f\u540e\u5373\u53ef\u5173\u95ed\u8be5\u6d4f\u89c8\u5668\u3002"
    );
    appState.accountError = "";
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function validateYoupinLogin() {
    const payload = await fetchJson("/api/youpin/connect/status?refresh=1");
    appState.youpinStatus = payload.status || null;
    clearLivePriceCache();
    appState.accountMessage = payload.status?.connected
      ? uiText("YouPin login verified and saved. Item pages will now show live YouPin prices without keeping the helper browser open.", "悠悠有品登录已验证并保存，饰品页会在可用时显示实时悠悠有品价格。")
      : (localizePlatformMessage(payload.status?.message) || uiText("YouPin login is not ready yet.", "悠悠有品登录尚未准备好。"));
    appState.accountError = "";
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  async function disconnectYoupinLogin() {
    await fetchJson("/api/youpin/connect", { method: "DELETE" });
    appState.youpinStatus = null;
    appState.accountMessage = uiText("YouPin session disconnected.", "悠悠有品会话已解绑。");
    appState.accountError = "";
    clearLivePriceCache();
    renderAccount();
    void scheduleAccountRefresh({ keepFeedback: true });
  }

  function openPicker(id) {
    const picker = document.getElementById(id);
    if (!picker) return;
    if (id === "collectionPicker") {
      appState.collectionPickerSuper = "";
      appState.collectionPickerQuery = "";
      appState.collectionPickerVisibleLimit = 60;
    }
    picker.hidden = false;
    document.body.classList.add("picker-open");
  }

  function closePicker(picker) {
    if (!picker) return;
    picker.hidden = true;
    if (![...document.querySelectorAll(".collection-picker")].some((entry) => !entry.hidden)) {
      document.body.classList.remove("picker-open");
    }
  }

  function markActiveNavigation() {
    const current = pageName();
    document.querySelectorAll(".top-nav a").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = (link.getAttribute("href") || "").split("?")[0];
      const currentPath = current === "" ? "index.html" : current;
      const linkPath = href || "index.html";
      const isActive = linkPath === currentPath;
      link.classList.toggle("is-active", isActive);
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function isHeavyMotionPage() {
    return ["loadout.html", "inventory.html", "account.html"].includes(pageName());
  }

  function applyPageMotionState() {
    document.body.dataset.page = pageName();
    document.body.classList.toggle("is-heavy-motion-page", isHeavyMotionPage());
    document.body.classList.toggle("is-inspector-page", pageName() === "item.html");
    document.body.classList.remove("is-page-entered");
    document.body.classList.add("is-page-entering");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.body.classList.add("is-page-entered");
        document.body.classList.remove("is-page-entering");
      });
    });
  }

  function navigateSmoothly(href, trigger) {
    const target = String(href || "").trim();
    if (!target) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      location.assign(target);
      return;
    }
    if (trigger instanceof HTMLElement) {
      trigger.classList.add("is-pressing");
    }
    document.body.classList.remove("nav-open");
    const menuButton = document.querySelector(".menu-toggle");
    if (menuButton instanceof HTMLButtonElement) menuButton.setAttribute("aria-expanded", "false");
    const scrim = document.querySelector(".nav-scrim");
    if (scrim instanceof HTMLElement) scrim.hidden = true;
    document.documentElement.classList.add("is-navigating");
    if (appState.navigationTimer) {
      window.clearTimeout(appState.navigationTimer);
      appState.navigationTimer = 0;
    }
    appState.navigationTimer = window.setTimeout(() => {
      appState.navigationTimer = 0;
      location.assign(target);
    }, 110);
  }

  function resetTransientUiState() {
    appState.openingPickerOpen = false;
    if (appState.navigationTimer) {
      window.clearTimeout(appState.navigationTimer);
      appState.navigationTimer = 0;
    }
    document.documentElement.classList.remove("is-navigating");
    document.body.classList.remove("is-page-entering");
    document.body.classList.remove("is-page-entered");
    document.body.classList.remove("picker-open");
    document.querySelectorAll(".top-nav a.is-pressing").forEach((link) => {
      link.classList.remove("is-pressing");
    });
    document.querySelectorAll(".collection-picker").forEach((picker) => {
      picker.hidden = true;
    });
    document.getElementById("openingPickerPortal")?.remove();
  }

  function bindEvents() {
    document.addEventListener("submit", async (event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;
      try {
        if (form.id === "accountLoginForm") {
          event.preventDefault();
          await submitAuthForm("/api/auth/login", form);
        } else if (form.id === "accountRegisterForm") {
          event.preventDefault();
          await submitAuthForm("/api/auth/register", form);
        } else if (form.id === "accountSteamBindForm") {
          event.preventDefault();
          await saveSteamBinding(form);
        } else if (form.id === "aiLoadoutChatForm") {
          event.preventDefault();
          await requestAiLoadoutChat();
        }
      } catch (error) {
        appState.accountError = error.message;
        appState.accountMessage = "";
        renderAccount();
      }
    });

    document.addEventListener("click", async (event) => {
      const rawTarget = event.target;
      const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement || null;
      if (!target) return;
      if (target.closest("#aiLoadoutChatForm button[type='submit']")) {
        event.preventDefault();
        await requestAiLoadoutChat();
        return;
      }
      const menuToggle = target.closest(".menu-toggle");
      if (menuToggle instanceof HTMLButtonElement) {
        const isOpen = document.body.classList.toggle("nav-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        const scrim = document.querySelector(".nav-scrim");
        if (scrim instanceof HTMLElement) scrim.hidden = !isOpen;
        return;
      }

      if (target.closest(".nav-scrim")) {
        document.body.classList.remove("nav-open");
        const menuButton = document.querySelector(".menu-toggle");
        if (menuButton instanceof HTMLButtonElement) menuButton.setAttribute("aria-expanded", "false");
        const scrim = document.querySelector(".nav-scrim");
        if (scrim instanceof HTMLElement) scrim.hidden = true;
        return;
      }
      const plainLink = target.closest("a[href]");
      if (plainLink instanceof HTMLAnchorElement && !plainLink.target && !plainLink.hasAttribute("download") && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        const url = new URL(plainLink.href, location.href);
        if (url.origin === location.origin && url.pathname !== location.pathname) {
          event.preventDefault();
          navigateSmoothly(plainLink.getAttribute("href") || plainLink.href, plainLink);
          return;
        }
      }
      const inventoryInspectTrigger = target.closest("[data-inventory-inspect]");
      if (inventoryInspectTrigger instanceof HTMLElement) {
        event.preventDefault();
        navigateSmoothly(inventoryInspectTrigger.dataset.inventoryInspect || "");
        return;
      }
      const inventoryCard = target.closest(".inventory-item[data-href]");
      if (inventoryCard instanceof HTMLElement && !target.closest("a, button, input, select, textarea")) {
        event.preventDefault();
        pulsePressState(inventoryCard);
        navigateSmoothly(inventoryCard.dataset.href || "", inventoryCard);
        return;
      }
      const favoriteCard = target.closest(".favorite-card[data-href]");
      if (favoriteCard instanceof HTMLElement && !target.closest("a, button, input, select, textarea")) {
        event.preventDefault();
        pulsePressState(favoriteCard);
        navigateSmoothly(favoriteCard.dataset.href || "", favoriteCard);
        return;
      }
      const aiSuggestionCard = target.closest(".ai-suggestion-card[data-href]");
      if (aiSuggestionCard instanceof HTMLElement && !target.closest("a, button, input, select, textarea")) {
        event.preventDefault();
        pulsePressState(aiSuggestionCard);
        navigateSmoothly(aiSuggestionCard.dataset.href || "", aiSuggestionCard);
        return;
      }
      const aiCategorySwitch = target.closest("[data-ai-category-target][data-ai-category]");
      if (aiCategorySwitch instanceof HTMLElement) {
        event.preventDefault();
        const targetKey = aiCategorySwitch.dataset.aiCategoryTarget || "";
        const category = aiCategorySwitch.dataset.aiCategory || "all";
        if (targetKey === "inventory") {
          appState.aiInventoryCategory = category;
          if (pageName() === "loadout.html") renderLoadout();
        }
        if (targetKey === "loadout") {
          appState.aiLoadoutCategory = category;
          persistAiLoadoutState();
          if (pageName() === "loadout.html") renderLoadout();
        }
        return;
      }
      if (target.id === "clearAiLoadoutChatButton") {
        event.preventDefault();
        clearAiLoadoutChat();
        return;
      }
      if (target.id === "refreshAiInventoryRecommendationsButton") {
        event.preventDefault();
        await refreshAiInventoryRecommendations();
        return;
      }
      if (target.id === "rotateAiInventoryUpgradeGroupButton") {
        event.preventDefault();
        await rotateAiInventoryUpgradeGroup();
        return;
      }
      const proPlayerSwitch = target.closest("[data-pro-player]");
      if (proPlayerSwitch instanceof HTMLElement) {
        event.preventDefault();
        const key = proPlayerSwitch.dataset.proPlayer || "";
        appState.activeProPlayerKey = appState.activeProPlayerKey === key ? "" : key;
        persistAiLoadoutState();
        if (pageName() === "loadout.html") refreshProPlayerLoadoutVisibility();
        return;
      }
      const favoriteTrigger = target.closest("[data-favorite-id]");
      if (favoriteTrigger instanceof HTMLElement) {
        event.preventDefault();
        toggleFavorite(favoriteTrigger.dataset.favoriteId || "");
        return;
      }
      const compareTrigger = target.closest("[data-compare-id]");
      if (compareTrigger instanceof HTMLElement) {
        event.preventDefault();
        toggleCompare(compareTrigger.dataset.compareId || "");
        return;
      }
      const openingSelect = target.closest("[data-opening-select]");
      if (openingSelect instanceof HTMLElement) {
        event.preventDefault();
        setActiveOpening(openingSelect.dataset.openingSelect || "");
        return;
      }
      const openingOpen = target.closest("[data-opening-open]");
      if (openingOpen instanceof HTMLElement) {
        event.preventDefault();
        const openingId = openingOpen.dataset.openingOpen || "";
        if (openingId && openingId !== appState.activeOpeningId) {
          appState.activeOpeningId = openingId;
          persistOpeningState();
          renderOpenings();
        }
        runOpeningSimulation();
        return;
      }
      if (target.closest("#openCasePickerButton")) {
        event.preventDefault();
        openOpeningPicker();
        return;
      }
      if (target.closest("#openingDetailPickerButton")) {
        event.preventDefault();
        openOpeningPicker();
        if (pageName() === "item.html") renderItemDetail();
        return;
      }
      const openingDetailOpen = target.closest("[data-opening-detail-open]");
      if (openingDetailOpen instanceof HTMLElement) {
        event.preventDefault();
        const openingId = openingDetailOpen.dataset.openingDetailOpen || "";
        if (!openingId) return;
        appState.activeOpeningId = openingId;
        persistOpeningState();
        location.href = "openings.html";
        return;
      }
      if (target.matches("[data-opening-picker-close]")) {
        event.preventDefault();
        closeOpeningPicker();
        return;
      }
      const openingKind = target.closest("[data-opening-kind]");
      if (openingKind instanceof HTMLElement) {
        event.preventDefault();
        appState.openingPickerKind = openingKind.dataset.openingKind || "";
        persistOpeningState();
        renderOpeningPickerPortal();
        return;
      }
      const openingMore = target.closest("[data-opening-more]");
      if (openingMore instanceof HTMLElement) {
        event.preventDefault();
        const kind = openingMore.dataset.openingMore || "";
        const currentVisible = Number(appState.openingIndexVisibleByKind?.[kind] || 18);
        appState.openingIndexVisibleByKind = {
          ...appState.openingIndexVisibleByKind,
          [kind]: currentVisible + 18
        };
        renderOpeningIndex();
        return;
      }
      const openingPick = target.closest("[data-opening-pick]");
      if (openingPick instanceof HTMLElement) {
        event.preventDefault();
        appState.openingPickerOpen = false;
        renderOpeningPickerPortal();
        if (![...document.querySelectorAll(".collection-picker")].some((entry) => !entry.hidden)) {
          document.body.classList.remove("picker-open");
        }
        const openingId = openingPick.dataset.openingPick || "";
        if (pageName() === "item.html") {
          const nextOpening = openingById(openingId);
          if (nextOpening) {
            appState.activeOpeningId = nextOpening.id;
            persistOpeningState();
            location.href = openingHref(nextOpening);
            return;
          }
        }
        setActiveOpening(openingId);
        return;
      }
      if (target.closest("#runOpeningButton")) {
        event.preventDefault();
        runOpeningSimulation();
        return;
      }
      if (target.closest("#runOpeningBatchButton")) {
        event.preventDefault();
        runOpeningBatchSimulation();
        return;
      }
      if (target.closest("#clearOpeningHistoryButton")) {
        event.preventDefault();
        clearOpeningHistory();
        renderOpenings();
        return;
      }
      if (target.closest("#openingHistoryPrevPage")) {
        event.preventDefault();
        appState.openingHistoryPage = Math.max(0, (Number(appState.openingHistoryPage) || 0) - 1);
        persistOpeningState();
        renderOpenings();
        return;
      }
      if (target.closest("#openingHistoryNextPage")) {
        event.preventDefault();
        appState.openingHistoryPage = Math.max(0, Number(appState.openingHistoryPage) || 0) + 1;
        persistOpeningState();
        renderOpenings();
        return;
      }
      if (target.closest("[data-opening-inspect-link]")) return;
      const openingBatchResult = target.closest("[data-opening-batch-index]");
      if (openingBatchResult instanceof HTMLElement) {
        event.preventDefault();
        selectOpeningBatchResult(Number(openingBatchResult.dataset.openingBatchIndex));
        return;
      }
      const openingHistoryResult = target.closest("[data-opening-history-index]");
      if (openingHistoryResult instanceof HTMLElement) {
        event.preventDefault();
        selectOpeningHistory(Number(openingHistoryResult.dataset.openingHistoryIndex));
        return;
      }
      const openingPoolResult = target.closest("[data-opening-pool-index]");
      if (openingPoolResult instanceof HTMLElement) {
        event.preventDefault();
        selectOpeningPoolResult(Number(openingPoolResult.dataset.openingPoolIndex));
        return;
      }
      if (target.matches("[data-compare-clear]")) {
        const current = getUserState();
        current.compare = [];
        setUserState(current);
        renderCompareTray();
        if (pageName() === "catalog.html") updateCatalogResults();
        if (pageName() === "item.html") renderItemDetail();
        return;
      }
      if (target.id === "clearRecentViews") {
        clearRecentViews();
        return;
      }
      if (target.id === "openTypePicker") openPicker("typePicker");
      if (target.id === "openRarityPicker") openPicker("rarityPicker");
      if (target.id === "openCollectionPicker") {
        openPicker("collectionPicker");
        refreshCatalogPickerUi();
      }
      if (target.matches(".picker-backdrop, .picker-close")) {
        closePicker(target.closest(".collection-picker"));
        return;
      }
      if (target.id === "clearType") document.getElementById("typeFilter").value = "";
      if (target.id === "clearRarity") document.getElementById("rarityFilter").value = "";
      if (target.id === "clearCollection") {
        document.getElementById("collectionFilter").value = "";
        appState.collectionPickerSuper = "";
        appState.collectionPickerQuery = "";
        appState.collectionPickerVisibleLimit = 60;
      }
      if (target.id === "clearType" || target.id === "clearRarity" || target.id === "clearCollection") {
        if (target.id === "clearCollection") refreshCatalogPickerUi(); else updateCatalogResults();
        return;
      }
      if (target.id === "confirmType" || target.id === "confirmRarity" || target.id === "confirmCollection") {
        closePicker(target.closest(".collection-picker"));
        updateCatalogResults();
        return;
      }
      if (target.id === "collectionPickerBack") {
        appState.collectionPickerSuper = "";
        appState.collectionPickerQuery = "";
        appState.collectionPickerVisibleLimit = 60;
        refreshCatalogPickerUi();
        return;
      }
      if (target.id === "collectionPickerShowMore") {
        appState.collectionPickerVisibleLimit += 60;
        refreshCatalogPickerUi();
        return;
      }
      const collectionSuperTrigger = target.closest("[data-collection-super]");
      if (collectionSuperTrigger instanceof HTMLElement) {
        appState.collectionPickerSuper = collectionSuperTrigger.dataset.collectionSuper || "";
        appState.collectionPickerVisibleLimit = 60;
        refreshCatalogPickerUi();
        return;
      }
      const pickerValue = target.closest("[data-picker-value]");
      if (pickerValue instanceof HTMLElement) {
        const value = pickerValue.dataset.pickerValue || "";
        const picker = pickerValue.closest(".collection-picker");
        if (picker?.id === "typePicker") document.getElementById("typeFilter").value = value;
        if (picker?.id === "rarityPicker") document.getElementById("rarityFilter").value = value;
        if (picker?.id === "collectionPicker") document.getElementById("collectionFilter").value = value;
        if (picker?.id === "collectionPicker") refreshCatalogPickerUi(); else updateCatalogResults();
        return;
      }
      if (target.id === "resetFilters") {
        const searchInput = document.getElementById("searchInput");
        const typeFilter = document.getElementById("typeFilter");
        const rarityFilter = document.getElementById("rarityFilter");
        const collectionFilter = document.getElementById("collectionFilter");
        const priceFilter = document.getElementById("priceFilter");
        const sortFilter = document.getElementById("sortFilter");
        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "";
        if (rarityFilter) rarityFilter.value = "";
        if (collectionFilter) collectionFilter.value = "";
        if (priceFilter) priceFilter.value = "5000";
        if (sortFilter) sortFilter.value = "featured";
        appState.catalogRenderedCount = PAGE_SIZE;
        if (pageName() === "catalog.html") history.replaceState({}, "", location.pathname);
        updateCatalogResults();
        return;
      }
      if (target.id === "loadMore") {
        appState.catalogRenderedCount += PAGE_SIZE;
        updateCatalogResults();
        return;
      }
      if (target.id === "loadMoreInventory") {
        appState.inventoryRenderedCount += INVENTORY_PAGE_SIZE;
        renderInventory();
        return;
      }
      if (target.id === "loadMoreProTeams") {
        appState.aiProTeamsRenderedCount += PRO_LOADOUT_TEAM_PAGE_SIZE;
        if (pageName() === "loadout.html") renderLoadout();
        return;
      }
      if (target.id === "shareCatalogLink") {
        navigator.clipboard?.writeText(location.href).catch(() => {});
        return;
      }
      try {
        if (target.id === "accountLogoutButton") {
          await logoutAccount();
          return;
        }
        if (target.id === "retryAccountButton") {
          appState.accountError = "";
          appState.accountMessage = "";
          await refreshAccountSurfaces({ keepFeedback: true });
          return;
        }
        if (target.id === "syncSteamButton") {
          await runSteamSync();
          return;
        }
        if (target.id === "startBuffLoginButton") {
          await startBuffLogin();
          return;
        }
        if (target.id === "validateBuffLoginButton") {
          await validateBuffLogin();
          return;
        }
        if (target.id === "disconnectBuffLoginButton") {
          await disconnectBuffLogin();
          return;
        }
        if (target.id === "startYoupinLoginButton") {
          await startYoupinLogin();
          return;
        }
        if (target.id === "validateYoupinLoginButton") {
          await validateYoupinLogin();
          return;
        }
        if (target.id === "disconnectYoupinLoginButton") {
          await disconnectYoupinLogin();
          return;
        }
        if (target.id === "runSyncButton") {
          await runPriceSync();
        }
      } catch (error) {
        setAccountBusyAction("");
        appState.inventorySyncRunning = false;
        appState.accountError = error.message;
        appState.accountMessage = "";
        renderAccount();
      }
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (event.key !== "Enter" && event.key !== " ") return;
      if (target?.matches(".inventory-item[data-href]")) {
        event.preventDefault();
        pulsePressState(target);
        navigateSmoothly(target.dataset.href || "", target);
        return;
      }
      if (target?.matches(".favorite-card[data-href]")) {
        event.preventDefault();
        pulsePressState(target);
        navigateSmoothly(target.dataset.href || "", target);
        return;
      }
      if (target?.matches(".ai-suggestion-card[data-href]")) {
        event.preventDefault();
        pulsePressState(target);
        navigateSmoothly(target.dataset.href || "", target);
        return;
      }
      if (target?.matches("[data-opening-batch-index]")) {
        event.preventDefault();
        selectOpeningBatchResult(Number(target.dataset.openingBatchIndex));
        return;
      }
      if (target?.matches("[data-opening-pool-index]")) {
        event.preventDefault();
        selectOpeningPoolResult(Number(target.dataset.openingPoolIndex));
        return;
      }
      if (!target?.matches("[data-opening-history-index]")) return;
      event.preventDefault();
      selectOpeningHistory(Number(target.dataset.openingHistoryIndex));
    });

    document.addEventListener("input", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;
      if (target.id === "openingBatchCount") {
        const input = target instanceof HTMLInputElement ? target : null;
        appState.openingBatchCount = normalizeOpeningBatchCount(input?.value || 1);
        persistOpeningState();
        if (input && Number(input.value) > 50) input.value = "50";
        return;
      }
      if (target.id === "aiLoadoutPromptInput") {
        const input = target instanceof HTMLTextAreaElement ? target : null;
        appState.aiLoadoutChatDraft = input?.value || "";
        persistAiLoadoutState();
        return;
      }
      if (target.id === "aiLoadoutBudgetInput") {
        const input = target instanceof HTMLInputElement ? target : null;
        appState.aiLoadoutBudgetDraft = input?.value || "";
        persistAiLoadoutState();
        return;
      }
      if (["searchInput", "priceFilter"].includes(target.id)) {
        appState.catalogRenderedCount = PAGE_SIZE;
        updateCatalogResults();
        return;
      }
      if (target.id === "collectionSearch") {
        appState.collectionPickerQuery = target.value || "";
        appState.collectionPickerVisibleLimit = 60;
        refreshCatalogPickerUi();
        return;
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;
      if (["aiLoadoutPresetSelect", "aiLoadoutColorSelect", "aiLoadoutStyleSelect"].includes(target.id)) {
        if (target.id === "aiLoadoutPresetSelect") appState.aiLoadoutPreset = target.value || "auto";
        if (target.id === "aiLoadoutColorSelect") appState.aiLoadoutColorFilter = target.value || "";
        if (target.id === "aiLoadoutStyleSelect") appState.aiLoadoutStyleFilter = target.value || "";
        persistAiLoadoutState();
        if (pageName() === "loadout.html") renderLoadout();
        return;
      }
      if (target.id === "sortFilter") {
        appState.catalogRenderedCount = PAGE_SIZE;
        updateCatalogResults();
      }
      if (target.id === "wearSelect") {
        appState.pendingWear = target.value;
        const requestedId = new URLSearchParams(location.search).get("id") || getInspectorState().itemId || DEFAULT_DETAIL_ALIAS;
        const resolvedItem = resolveDisplayItemById(requestedId);
        const itemId = resolvedItem?.id || requestedId;
        const pricedItem = resolvedItem ? selectedSpecialTemplateItem(resolvedItem) : null;
        const inspectorState = getInspectorState();
        setInspectorState({
          itemId,
          wearByItem: {
            ...inspectorState.wearByItem,
            [itemId]: target.value,
            ...(pricedItem ? { [pricedItem.id]: target.value } : {})
          },
          variantByItem: inspectorState.variantByItem || {},
          templateByItem: inspectorState.templateByItem || {}
        });
        applyWearClass(target.value);
        if (pricedItem) {
          const loadingHint = uiText("Checking the selected wear tier price.", "正在检查所选磨损等级价格。");
          const referenceHint = document.getElementById("detailReferencePriceHint");
          const buffHint = document.getElementById("detailBuffPriceHint");
          const youpinHint = document.getElementById("detailYoupinPriceHint");
          if (buffHint) buffHint.textContent = loadingHint;
          if (youpinHint) youpinHint.textContent = loadingHint;
          if (referenceHint) referenceHint.textContent = loadingHint;
          void loadPlatformPrices(pricedItem, target.value, activeVariantForItem(pricedItem)).then(() => renderItemDetail()).catch(() => renderItemDetail());
          return;
        }
        renderItemDetail();
      }
      if (target.id === "variantSelect") {
        appState.pendingVariant = target.value || "standard";
        const requestedId = new URLSearchParams(location.search).get("id") || getInspectorState().itemId || DEFAULT_DETAIL_ALIAS;
        const resolvedItem = resolveDisplayItemById(requestedId);
        const itemId = resolvedItem?.id || requestedId;
        const pricedItem = resolvedItem ? selectedSpecialTemplateItem(resolvedItem) : null;
        const inspectorState = getInspectorState();
        setInspectorState({
          itemId,
          wearByItem: inspectorState.wearByItem || {},
          variantByItem: {
            ...inspectorState.variantByItem,
            [itemId]: target.value || "standard",
            ...(pricedItem ? { [pricedItem.id]: target.value || "standard" } : {})
          },
          templateByItem: inspectorState.templateByItem || {}
        });
        if (pricedItem) {
          const loadingHint = uiText("Checking the selected version price.", "正在检查所选版本价格。");
          const referenceHint = document.getElementById("detailReferencePriceHint");
          const buffHint = document.getElementById("detailBuffPriceHint");
          const youpinHint = document.getElementById("detailYoupinPriceHint");
          if (buffHint) buffHint.textContent = loadingHint;
          if (youpinHint) youpinHint.textContent = loadingHint;
          if (referenceHint) referenceHint.textContent = loadingHint;
          void loadPlatformPrices(pricedItem, activeWearForItem(pricedItem), target.value || "standard").then(() => renderItemDetail()).catch(() => renderItemDetail());
          return;
        }
        renderItemDetail();
      }
      if (target.id === "templateSelect") {
        appState.pendingTemplate = target.value || "";
        const requestedId = new URLSearchParams(location.search).get("id") || getInspectorState().itemId || DEFAULT_DETAIL_ALIAS;
        const resolvedItem = resolveDisplayItemById(requestedId);
        const pricedItem = resolvedItem ? selectedSpecialTemplateItem(resolvedItem, target.value || "") : null;
        const inspectorState = getInspectorState();
        if (resolvedItem) {
          setInspectorState({
            itemId: resolvedItem.id,
            wearByItem: inspectorState.wearByItem || {},
            variantByItem: inspectorState.variantByItem || {},
            templateByItem: {
              ...inspectorState.templateByItem,
              [resolvedItem.id]: target.value || ""
            }
          });
          const params = new URLSearchParams(location.search);
          if (target.value) params.set("template", target.value);
          else params.delete("template");
          history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
        }
        if (pricedItem) {
          const loadingHint = uiText("Checking the selected special template price.", "正在检查所选特殊模板价格。");
          const referenceHint = document.getElementById("detailReferencePriceHint");
          const buffHint = document.getElementById("detailBuffPriceHint");
          const youpinHint = document.getElementById("detailYoupinPriceHint");
          if (buffHint) buffHint.textContent = loadingHint;
          if (youpinHint) youpinHint.textContent = loadingHint;
          if (referenceHint) referenceHint.textContent = loadingHint;
          void loadPlatformPrices(pricedItem, activeWearForItem(pricedItem), activeVariantForItem(pricedItem)).then(() => renderItemDetail()).catch(() => renderItemDetail());
          return;
        }
        renderItemDetail();
      }
    });
  }

  function updateInspectorNavLink() {
    const navLink = document.querySelector('.top-nav [data-nav-key="Inspector"]');
    if (!navLink) return;
    const inspectorState = getInspectorState();
    const itemId = inspectorState.itemId || DEFAULT_DETAIL_ALIAS;
    const resolveItem = typeof globalThis.resolveDisplayItemById === "function" ? globalThis.resolveDisplayItemById : null;
    const resolvedItem = resolveItem ? resolveItem(itemId) : null;
    const hrefId = resolvedItem?.aliases?.[0] || resolvedItem?.id || itemId;
    navLink.href = `item.html?id=${encodeURIComponent(hrefId)}`;
  }

  function renderAll() {
    renderPageContent(pageName());
  }

  async function renderCurrentPage() {
    const currentPage = pageName();
    const currentPageIsItemDetail = currentPage === "item.html";
    const detailParams = new URLSearchParams(location.search);
    const requestedItemId = detailParams.get("id") || getInspectorState().itemId || DEFAULT_DETAIL_ALIAS;
    const currentPageNeedsCatalogData = ["index.html", "catalog.html", "collections.html", "favorites.html", "recent.html", "openings.html"].includes(currentPage);
    const hasCatalogData = Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length > 0;
    const currentPageNeedsOpeningData = currentPage === "openings.html";
    const hasOpeningData = !currentPageNeedsOpeningData || openingDataAvailable();
    if (currentPageIsItemDetail && !hasCatalogData && !resolveDisplayItemById(requestedItemId)) {
      prepareDeferredImageState(currentPage);
      renderPageContent(currentPage);
      markActiveNavigation();
      applyPageMotionState();
      void ensureItemDetailDataLoaded(requestedItemId).then(() => ensureItemRelatedDataLoaded(resolveDisplayItemById(requestedItemId))).then(() => {
        if (pageName() !== currentPage) return;
        prepareDeferredImageState(currentPage);
        renderPageContent(currentPage);
        markActiveNavigation();
        scheduleDeferredImageHydration(currentPage);
      }).catch(() => {});
      return;
    }
    if (currentPageNeedsCatalogData && (!hasCatalogData || !hasOpeningData)) {
      prepareDeferredImageState(currentPage);
      renderPageContent(currentPage);
      markActiveNavigation();
      applyPageMotionState();
      const catalogLoader = currentPage === "catalog.html"
        ? ensureCatalogAssetsLoaded()
        : currentPageNeedsOpeningData
          ? ensureOpeningDataLoaded()
          : ensureCatalogDataLoaded();
      void catalogLoader.then(() => {
        if (pageName() !== currentPage) return;
        prepareDeferredImageState(currentPage);
        renderPageContent(currentPage);
        markActiveNavigation();
        scheduleDeferredImageHydration(currentPage);
      }).catch(() => {});
      return;
    }
    if (currentPage === "catalog.html") {
      await ensureCatalogAssetsLoaded();
    } else if (currentPageNeedsOpeningData) {
      await ensureOpeningDataLoaded();
    } else if (currentPageIsItemDetail) {
      await ensureItemDetailDataLoaded(requestedItemId);
      await ensureItemRelatedDataLoaded(resolveDisplayItemById(requestedItemId));
    } else if (currentPageNeedsCatalogData) {
      await ensureCatalogDataLoaded();
    }
    prepareDeferredImageState(currentPage);
    renderPageContent(currentPage);
    markActiveNavigation();
    applyPageMotionState();
    scheduleDeferredImageHydration(currentPage);
  }

  try {
    globalThis.items = items;
    globalThis.categoryDefinitions = CATEGORY_ORDER.map((id) => ({ id, labelEn: CATEGORY_I18N[id]?.en || id, labelZh: CLEAN_CATEGORY_LABELS_ZH[id] || CATEGORY_I18N[id]?.["zh-CN"] || CATEGORY_I18N[id]?.zh || id }));
    globalThis.resolveDisplayItemById = resolveDisplayItemById;
    globalThis.effectiveCatalogPriceRecord = effectiveCatalogPriceRecord;
    globalThis.effectiveCatalogPrice = effectiveCatalogPrice;
    globalThis.applyBatchPricePayload = applyBatchPricePayload;
    globalThis.renderCurrentPage = renderCurrentPage;
    globalThis.refreshFavoriteSurfaces = refreshFavoriteSurfaces;
    globalThis.saveCurrentDiyDesign = saveCurrentDiyDesign;
    globalThis.supportsStickerDiy = supportsStickerDiy;
  } catch {}
  window.addEventListener("cs2-opening-data-ready", () => {
    openingItems = Array.isArray(globalThis.CS2_UNBOXING) ? globalThis.CS2_UNBOXING : openingItems;
    if (pageName() === "openings.html" && openingItems.length) renderOpenings();
  });
  async function boot() {
    bindEvents();
    initLazyImageLoading();
    resetTransientUiState();
    restorePriceCaches();
    restoreAuthOverviewSnapshot();
    consumeAccountRedirectFeedback();
    restoreAiLoadoutState();
    await globalThis.ensureCatalogLocaleLoaded?.(currentLanguage());
    restoreOpeningState();
    await renderCurrentPage();
    document.documentElement.dataset.uiReady = "true";
    window.addEventListener("pageshow", async (event) => {
      if (!event.persisted) return;
      resetTransientUiState();
      document.documentElement.dataset.uiReady = "true";
      try {
        const currentPage = pageName();
        if (currentPage === "loadout.html") {
          appState.loadoutFrameReady = Boolean(appState.aiLoadoutChatMessages.length || appState.aiInventoryRecommendations || appState.aiProLoadouts);
          renderLoadout();
          return;
        }
        await renderCurrentPage();
        if (currentPage === "account.html" || currentPage === "inventory.html") {
          await ensureAccountData(true, { keepFeedback: true, silent: true });
        }
      } catch {}
      await renderCurrentPage();
    });
    window.addEventListener("popstate", () => {
      resetTransientUiState();
      void renderCurrentPage();
    });
    try {
      await Promise.allSettled([ensureAccountData()]);
      if ((pageName() === "inventory.html" || pageName() === "loadout.html") && appState.session?.steamId && !(appState.inventoryPreview?.items || []).length && !appState.inventoryAutoSyncStarted) {
        appState.inventoryAutoSyncStarted = true;
        try {
          await runSteamSync();
        } catch {}
      }
      await renderCurrentPage();
    } catch {
      await renderCurrentPage();
    }
  }

  boot().catch(() => {
    bindEvents();
    resetTransientUiState();
    void renderCurrentPage();
    document.documentElement.dataset.uiReady = "true";
  });
