(() => {
  const STORAGE_KEY = "cs2-relic-hall:language";
  const DEFAULT_LANG = "zh-CN";

  const LANGUAGE_LABELS = [
    { code: "zh-CN", label: "\u7b80\u4f53\u4e2d\u6587" },
    { code: "en", label: "English" },
    { code: "pt-BR", label: "Portugu\u00eas (Brasil)" },
    { code: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
    { code: "es-ES", label: "Espa\u00f1ol" },
    { code: "bg", label: "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438" },
    { code: "cs", label: "\u010ce\u0161tina" },
    { code: "da", label: "Dansk" },
    { code: "nl", label: "Nederlands" },
    { code: "fi", label: "Suomi" },
    { code: "fr", label: "Fran\u00e7ais" },
    { code: "de", label: "Deutsch" },
    { code: "el", label: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac" },
    { code: "hu", label: "Magyar" },
    { code: "it", label: "Italiano" },
    { code: "ja", label: "\u65e5\u672c\u8a9e" },
    { code: "ko", label: "\ud55c\uad6d\uc5b4" },
    { code: "es-MX", label: "Espa\u00f1ol (Latinoam\u00e9rica)" },
    { code: "no", label: "Norsk" },
    { code: "pl", label: "Polski" },
    { code: "pt-PT", label: "Portugu\u00eas" },
    { code: "ro", label: "Rom\u00e2n\u0103" },
    { code: "sv", label: "Svenska" },
    { code: "zh-TW", label: "\u7e41\u9ad4\u4e2d\u6587" },
    { code: "th", label: "\u0e44\u0e17\u0e22" },
    { code: "tr", label: "T\u00fcrk\u00e7e" },
    { code: "uk", label: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430" },
    { code: "vi", label: "Ti\u1ebfng Vi\u1ec7t" }
  ];

  const NAV_KEYS = {
    "catalog.html": "Catalog",
    "collections.html": "Collections",
    "item.html": "Inspector",
    "favorites.html": "Favorites",
    "recent.html": "Recent",
    "related.html": "Related",
    "tools.html": "Tools",
    "account.html": "Account",
    "inventory.html": "Inventory",
    "loadout.html": "Loadout"
  };

  const PAGE_TITLE_KEYS = {
    "index.html": "CS Exhibition",
    "catalog.html": "Catalog",
    "collections.html": "Collections",
    "item.html": "Inspector",
    "favorites.html": "Favorites",
    "recent.html": "Recent Views",
    "related.html": "Related News",
    "tools.html": "Tools",
    "account.html": "Account Center",
    "inventory.html": "Inventory Gallery",
    "loadout.html": "Loadout Studio",
    "openings.html": "Unbox"
  };

  const NAV_TRANSLATIONS = {
    en: {
      nav: "Primary Navigation",
      brand: "CS Exhibition",
      Catalog: "Catalog",
      Collections: "Collections",
      Inspector: "Inspector",
      Favorites: "Favorites",
      Recent: "Recent",
      Related: "Related",
      Tools: "Tools",
      Account: "Account",
      Unbox: "Unbox",
      Inventory: "Inventory",
      Loadout: "Loadout"
    },
    "zh-CN": {
      nav: "\u4e3b\u5bfc\u822a",
      brand: "CS Exhibition",
      Catalog: "\u76ee\u5f55",
      Collections: "\u6536\u85cf\u54c1",
      Inspector: "\u68c0\u89c6\u5668",
      Favorites: "\u6536\u85cf\u5939",
      Recent: "\u6700\u8fd1\u6d4f\u89c8",
      Related: "\u76f8\u5173\u8d44\u8baf",
      Tools: "\u5b9e\u7528\u5de5\u5177",
      Account: "\u8d26\u53f7",
      Unbox: "\u5f00\u7bb1",
      Inventory: "\u5e93\u5b58",
      Loadout: "\u9970\u54c1\u642d\u914d"
    },
    "zh-TW": {
      nav: "\u4e3b\u5c0e\u822a",
      brand: "CS Exhibition",
      Catalog: "\u76ee\u9304",
      Collections: "\u6536\u85cf\u54c1",
      Inspector: "\u6aa2\u8996\u5668",
      Favorites: "\u6536\u85cf\u593e",
      Recent: "\u6700\u8fd1\u700f\u89bd",
      Related: "\u76f8\u95dc\u8cc7\u8a0a",
      Tools: "\u5be6\u7528\u5de5\u5177",
      Account: "\u5e33\u865f",
      Unbox: "\u958b\u7bb1",
      Inventory: "\u5eab\u5b58",
      Loadout: "\u98fe\u54c1\u642d\u914d"
    },
    ja: {
      nav: "\u30e1\u30a4\u30f3\u30ca\u30d3\u30b2\u30fc\u30b7\u30e7\u30f3",
      brand: "CS2 Skin Atlas",
      Catalog: "\u30ab\u30bf\u30ed\u30b0",
      Collections: "\u30b3\u30ec\u30af\u30b7\u30e7\u30f3",
      Inspector: "\u30a4\u30f3\u30b9\u30da\u30af\u30bf\u30fc",
      Favorites: "\u304a\u6c17\u306b\u5165\u308a",
      Recent: "\u6700\u8fd1\u8868\u793a",
      Account: "\u30a2\u30ab\u30a6\u30f3\u30c8",
      Inventory: "\u30a4\u30f3\u30d9\u30f3\u30c8\u30ea"
    },
    ko: {
      nav: "\uc8fc \ub0b4\ube44\uac8c\uc774\uc158",
      brand: "CS2 Skin Atlas",
      Catalog: "\uce74\ud0c8\ub85c\uadf8",
      Collections: "\uceec\ub809\uc158",
      Inspector: "\uc778\uc2a4\ud399\ud130",
      Favorites: "\uc990\uaca8\ucc3e\uae30",
      Recent: "\ucd5c\uadfc \ubcf8 \ud56d\ubaa9",
      Account: "\uacc4\uc815",
      Inventory: "\uc778\ubca4\ud1a0\ub9ac"
    },
    ru: {
      nav: "\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f",
      brand: "CS2 Skin Atlas",
      Catalog: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433",
      Collections: "\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438",
      Inspector: "\u0418\u043d\u0441\u043f\u0435\u043a\u0442\u043e\u0440",
      Favorites: "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435",
      Recent: "\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0435",
      Account: "\u0410\u043a\u043a\u0430\u0443\u043d\u0442",
      Inventory: "\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u044c"
    },
    "es-ES": {
      nav: "Navegaci\u00f3n principal",
      brand: "CS2 Skin Atlas",
      Catalog: "Cat\u00e1logo",
      Collections: "Colecciones",
      Inspector: "Inspector",
      Favorites: "Favoritos",
      Recent: "Recientes",
      Account: "Cuenta",
      Inventory: "Inventario"
    },
    "es-MX": {
      nav: "Navegaci\u00f3n principal",
      brand: "CS2 Skin Atlas",
      Catalog: "Cat\u00e1logo",
      Collections: "Colecciones",
      Inspector: "Inspector",
      Favorites: "Favoritos",
      Recent: "Recientes",
      Account: "Cuenta",
      Inventory: "Inventario"
    },
    fr: {
      nav: "Navigation principale",
      brand: "CS2 Skin Atlas",
      Catalog: "Catalogue",
      Collections: "Collections",
      Inspector: "Inspecteur",
      Favorites: "Favoris",
      Recent: "R\u00e9cents",
      Account: "Compte",
      Inventory: "Inventaire"
    },
    de: {
      nav: "Hauptnavigation",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Sammlungen",
      Inspector: "Inspektor",
      Favorites: "Favoriten",
      Recent: "Zuletzt",
      Account: "Konto",
      Inventory: "Inventar"
    },
    "pt-BR": {
      nav: "Navega\u00e7\u00e3o principal",
      brand: "CS2 Skin Atlas",
      Catalog: "Cat\u00e1logo",
      Collections: "Cole\u00e7\u00f5es",
      Inspector: "Inspector",
      Favorites: "Favoritos",
      Recent: "Recentes",
      Account: "Conta",
      Inventory: "Invent\u00e1rio"
    },
    "pt-PT": {
      nav: "Navega\u00e7\u00e3o principal",
      brand: "CS2 Skin Atlas",
      Catalog: "Cat\u00e1logo",
      Collections: "Cole\u00e7\u00f5es",
      Inspector: "Inspector",
      Favorites: "Favoritos",
      Recent: "Recentes",
      Account: "Conta",
      Inventory: "Invent\u00e1rio"
    },
    it: {
      nav: "Navigazione principale",
      brand: "CS2 Skin Atlas",
      Catalog: "Catalogo",
      Collections: "Collezioni",
      Inspector: "Ispettore",
      Favorites: "Preferiti",
      Recent: "Recenti",
      Account: "Account",
      Inventory: "Inventario"
    },
    nl: {
      nav: "Hoofdnavigatie",
      brand: "CS2 Skin Atlas",
      Catalog: "Catalogus",
      Collections: "Collecties",
      Inspector: "Inspector",
      Favorites: "Favorieten",
      Recent: "Recent",
      Account: "Account",
      Inventory: "Inventaris"
    },
    pl: {
      nav: "Nawigacja g\u0142\u00f3wna",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Kolekcje",
      Inspector: "Inspektor",
      Favorites: "Ulubione",
      Recent: "Ostatnie",
      Account: "Konto",
      Inventory: "Ekwipunek"
    },
    tr: {
      nav: "Ana gezinti",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Koleksiyonlar",
      Inspector: "\u0130nceleyici",
      Favorites: "Favoriler",
      Recent: "Son G\u00f6r\u00fclenler",
      Account: "Hesap",
      Inventory: "Envanter"
    },
    uk: {
      nav: "\u0413\u043e\u043b\u043e\u0432\u043d\u0430 \u043d\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044f",
      brand: "CS2 Skin Atlas",
      Catalog: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433",
      Collections: "\u041a\u043e\u043b\u0435\u043a\u0446\u0456\u0457",
      Inspector: "\u0406\u043d\u0441\u043f\u0435\u043a\u0442\u043e\u0440",
      Favorites: "\u041e\u0431\u0440\u0430\u043d\u0435",
      Recent: "\u041d\u0435\u0434\u0430\u0432\u043d\u0456",
      Account: "\u0410\u043a\u0430\u0443\u043d\u0442",
      Inventory: "\u0406\u043d\u0432\u0435\u043d\u0442\u0430\u0440"
    },
    bg: {
      nav: "\u041e\u0441\u043d\u043e\u0432\u043d\u0430 \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f",
      brand: "CS2 Skin Atlas",
      Catalog: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433",
      Collections: "\u041a\u043e\u043b\u0435\u043a\u0446\u0438\u0438",
      Inspector: "\u0418\u043d\u0441\u043f\u0435\u043a\u0442\u043e\u0440",
      Favorites: "\u041b\u044e\u0431\u0438\u043c\u0438",
      Recent: "\u0421\u043a\u043e\u0440\u043e\u0448\u043d\u0438",
      Account: "\u0410\u043a\u0430\u0443\u043d\u0442",
      Inventory: "\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440"
    },
    cs: {
      nav: "Hlavn\u00ed navigace",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Kolekce",
      Inspector: "Inspektor",
      Favorites: "Obl\u00edben\u00e9",
      Recent: "Ned\u00e1vn\u00e9",
      Account: "\u00da\u010det",
      Inventory: "Invent\u00e1\u0159"
    },
    da: {
      nav: "Prim\u00e6r navigation",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Samlinger",
      Inspector: "Inspekt\u00f8r",
      Favorites: "Favoritter",
      Recent: "Seneste",
      Account: "Konto",
      Inventory: "Inventar"
    },
    fi: {
      nav: "P\u00e4\u00e4navigointi",
      brand: "CS2 Skin Atlas",
      Catalog: "Luettelo",
      Collections: "Kokoelmat",
      Inspector: "Tarkastaja",
      Favorites: "Suosikit",
      Recent: "Viimeisimm\u00e4t",
      Account: "Tili",
      Inventory: "Inventaario"
    },
    el: {
      nav: "\u039a\u03cd\u03c1\u03b9\u03b1 \u03c0\u03bb\u03bf\u03ae\u03b3\u03b7\u03c3\u03b7",
      brand: "CS2 Skin Atlas",
      Catalog: "\u039a\u03b1\u03c4\u03ac\u03bb\u03bf\u03b3\u03bf\u03c2",
      Collections: "\u03a3\u03c5\u03bb\u03bb\u03bf\u03b3\u03ad\u03c2",
      Inspector: "\u0395\u03c0\u03b9\u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03ae\u03c2",
      Favorites: "\u0391\u03b3\u03b1\u03c0\u03b7\u03bc\u03ad\u03bd\u03b1",
      Recent: "\u03a0\u03c1\u03cc\u03c3\u03c6\u03b1\u03c4\u03b1",
      Account: "\u039b\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc\u03c2",
      Inventory: "\u0391\u03c0\u03bf\u03b8\u03ad\u03bc\u03b1"
    },
    hu: {
      nav: "Els\u0151dleges navig\u00e1ci\u00f3",
      brand: "CS2 Skin Atlas",
      Catalog: "Katal\u00f3gus",
      Collections: "Gy\u0171jtem\u00e9nyek",
      Inspector: "Vizsg\u00e1l\u00f3",
      Favorites: "Kedvencek",
      Recent: "Legut\u00f3bbiak",
      Account: "Fi\u00f3k",
      Inventory: "K\u00e9szlet"
    },
    no: {
      nav: "Hovednavigasjon",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Samlinger",
      Inspector: "Inspekt\u00f8r",
      Favorites: "Favoritter",
      Recent: "Nylige",
      Account: "Konto",
      Inventory: "Inventar"
    },
    ro: {
      nav: "Navigare principal\u0103",
      brand: "CS2 Skin Atlas",
      Catalog: "Catalog",
      Collections: "Colec\u021bii",
      Inspector: "Inspector",
      Favorites: "Favorite",
      Recent: "Recente",
      Account: "Cont",
      Inventory: "Inventar"
    },
    sv: {
      nav: "Huvudnavigering",
      brand: "CS2 Skin Atlas",
      Catalog: "Katalog",
      Collections: "Samlingar",
      Inspector: "Inspekt\u00f6r",
      Favorites: "Favoriter",
      Recent: "Senaste",
      Account: "Konto",
      Inventory: "Inventarie"
    },
    th: {
      nav: "\u0e01\u0e32\u0e23\u0e19\u0e33\u0e17\u0e32\u0e07\u0e2b\u0e25\u0e31\u0e01",
      brand: "CS2 Skin Atlas",
      Catalog: "\u0e41\u0e04\u0e15\u0e32\u0e25\u0e47\u0e2d\u0e01",
      Collections: "\u0e04\u0e2d\u0e25\u0e40\u0e25\u0e01\u0e0a\u0e31\u0e19",
      Inspector: "\u0e15\u0e31\u0e27\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a",
      Favorites: "\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e42\u0e1b\u0e23\u0e14",
      Recent: "\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14",
      Account: "\u0e1a\u0e31\u0e0d\u0e0a\u0e35",
      Inventory: "\u0e04\u0e25\u0e31\u0e07"
    },
    vi: {
      nav: "\u0110i\u1ec1u h\u01b0\u1edbng ch\u00ednh",
      brand: "CS2 Skin Atlas",
      Catalog: "Danh m\u1ee5c",
      Collections: "B\u1ed9 s\u01b0u t\u1eadp",
      Inspector: "Tr\u00ecnh xem",
      Favorites: "Y\u00eau th\u00edch",
      Recent: "G\u1ea7n \u0111\u00e2y",
      Account: "T\u00e0i kho\u1ea3n",
      Inventory: "Kho v\u1eadt ph\u1ea9m"
    }
  };

  Object.values(NAV_TRANSLATIONS).forEach((pack) => {
    if (pack && typeof pack === "object") {
      pack.brand = "CS Exhibition";
    }
  });

  const UI_TRANSLATIONS = {
    "zh-CN": {
      "Primary Navigation": "\u4e3b\u5bfc\u822a",
      "Language": "\u8bed\u8a00",
      "CS2 Skin Atlas": "CS Exhibition",
      "CS Exhibition": "CS Exhibition",
      "Catalog": "\u76ee\u5f55",
      "Collections": "\u6536\u85cf\u54c1",
      "Inspector": "\u68c0\u89c6\u5668",
      "Favorites": "\u6536\u85cf\u5939",
      "Recent": "\u6700\u8fd1\u6d4f\u89c8",
      "Recent Views": "\u6700\u8fd1\u6d4f\u89c8",
      "Tools": "\u5b9e\u7528\u5de5\u5177",
      "Account": "\u8d26\u53f7",
      "Account Center": "\u8d26\u53f7\u4e2d\u5fc3",
      "Inventory": "\u5e93\u5b58",
      "Inventory Gallery": "\u5e93\u5b58\u5c55\u5385",
      "Loadout": "\u9970\u54c1\u642d\u914d",
      "Loadout Studio": "\u667a\u80fd\u9970\u54c1\u642d\u914d\u5ba4",
      "Unbox": "\u5f00\u7bb1",
      "Select Collection": "\u9009\u62e9\u6536\u85cf\u54c1",
      "Search collections": "\u641c\u7d22\u6536\u85cf\u54c1",
      "Select Weapon Type": "\u9009\u62e9\u6b66\u5668\u7c7b\u578b",
      "Search weapon types": "\u641c\u7d22\u6b66\u5668\u7c7b\u578b",
      "Select Rarity": "\u9009\u62e9\u7a00\u6709\u5ea6",
      "Search rarities": "\u641c\u7d22\u7a00\u6709\u5ea6",
      "Clear": "\u6e05\u9664",
      "Confirm": "\u786e\u8ba4",
      "Close": "\u5173\u95ed",
      "Close picker": "\u5173\u95ed\u9009\u62e9\u5668",
      "{count} items": "{count} \u4ef6\u9970\u54c1",
      "{count} items selected": "\u5df2\u9009\u62e9 {count} \u4ef6\u9970\u54c1",
      "{count} stickers": "{count} \u5f20\u8d34\u7eb8"
    },
    "zh-TW": {
      "Primary Navigation": "\u4e3b\u5c0e\u822a",
      "Language": "\u8a9e\u8a00",
      "CS2 Skin Atlas": "CS Exhibition",
      "CS Exhibition": "CS Exhibition",
      "Catalog": "\u76ee\u9304",
      "Collections": "\u6536\u85cf\u54c1",
      "Inspector": "\u6aa2\u8996\u5668",
      "Favorites": "\u6536\u85cf\u593e",
      "Recent": "\u6700\u8fd1\u700f\u89bd",
      "Recent Views": "\u6700\u8fd1\u700f\u89bd",
      "Tools": "\u5be6\u7528\u5de5\u5177",
      "Account": "\u5e33\u865f",
      "Account Center": "\u5e33\u865f\u4e2d\u5fc3",
      "Inventory": "\u5eab\u5b58",
      "Inventory Gallery": "\u5eab\u5b58\u5c55\u5ef3",
      "Loadout": "\u98fe\u54c1\u642d\u914d",
      "Loadout Studio": "\u667a\u80fd\u98fe\u54c1\u642d\u914d\u5ba4",
      "Unbox": "\u958b\u7bb1",
      "Select Collection": "\u9078\u64c7\u6536\u85cf\u54c1",
      "Search collections": "\u641c\u5c0b\u6536\u85cf\u54c1",
      "Select Weapon Type": "\u9078\u64c7\u6b66\u5668\u985e\u578b",
      "Search weapon types": "\u641c\u5c0b\u6b66\u5668\u985e\u578b",
      "Select Rarity": "\u9078\u64c7\u7a00\u6709\u5ea6",
      "Search rarities": "\u641c\u5c0b\u7a00\u6709\u5ea6",
      "Clear": "\u6e05\u9664",
      "Confirm": "\u78ba\u8a8d",
      "Close": "\u95dc\u9589",
      "Close picker": "\u95dc\u9589\u9078\u64c7\u5668",
      "{count} items": "{count} \u4ef6\u98fe\u54c1",
      "{count} items selected": "\u5df2\u9078\u64c7 {count} \u4ef6\u98fe\u54c1",
      "{count} stickers": "{count} \u5f35\u8cbc\u7d19"
    },
    ja: {
      "Primary Navigation": "メインナビゲーション",
      "Language": "言語",
      "CS2 Skin Atlas": "CS2 Skin Atlas",
      "Catalog": "カタログ",
      "Collections": "コレクション",
      "Inspector": "インスペクター",
      "Favorites": "お気に入り",
      "Recent": "最近表示",
      "Recent Views": "最近表示",
      "Account": "アカウント",
      "Account Center": "アカウントセンター",
      "Inventory": "インベントリ",
      "Inventory Gallery": "インベントリギャラリー",
      "Unbox": "開封",
      "Interactive Unbox": "インタラクティブ開封",
      "Weapon Case": "武器ケース",
      "Souvenir Package": "記念品パッケージ",
      "Capsule": "カプセル",
      "Music Kit Box": "ミュージックキットボックス",
      "Package": "パッケージ",
      "Container": "コンテナ",
      "Open This Case": "このケースを開ける",
      "Opening...": "開封中...",
      "Open Again": "もう一度開ける",
      "Click to Change Case": "クリックしてケースを変更",
      "Choose another case": "別のケースを選択",
      "Roll For Drop": "ドロップを抽選",
      "The marker stops on your simulated reward.": "マーカーがシミュレーション報酬で停止します。",
      "Ready to open": "開封準備完了",
      "Hit the button to let the reel decide your drop.": "ボタンを押すとリールがドロップを決定します。",
      "Inside This Case": "このケースの中身",
      "Full Loot Pool": "全ドロップ一覧",
      "Browse the exact listed contents of this container below.": "このコンテナに記載されている内容を下で確認できます。",
      "Case and Capsule Index": "ケースとカプセル一覧",
      "Browse weapon cases, souvenir packages, capsules, and music kit boxes in one place.": "武器ケース、記念品パッケージ、カプセル、ミュージックキットボックスをまとめて確認できます。",
      "Choose Case": "ケースを選択",
      "Pick a category first, then a case": "先にカテゴリを選び、次にケースを選択",
      "Close": "閉じる",
      "Close picker": "選択画面を閉じる",
      "Select": "選択",
      "Simulate Unbox": "開封をシミュレート",
      "Rare Special": "レア特殊アイテム",
      "Drop Result": "ドロップ結果",
      "Inspect Item": "アイテムを見る",
      "Standard Drops": "通常ドロップ",
      "These are the listed core drops in this container.": "このコンテナに含まれる主な通常ドロップです。",
      "Rare Specials": "レア特殊アイテム",
      "These are the extra rare pulls that can appear in place of a standard drop.": "通常ドロップの代わりに出現することがある非常にレアな報酬です。",
      "No loot data yet.": "ドロップデータはまだありません。",
      "No image": "画像なし",
      "No price": "価格なし",
      "Standard": "標準",
      "Base Grade": "基本グレード",
      "{count} items": "{count} 個のアイテム",
      "{count} items selected": "{count} 個のアイテムを選択中",
      "{count} stickers": "{count} 枚のステッカー"
    }
  };

  Object.values(UI_TRANSLATIONS).forEach((pack) => {
    if (pack && typeof pack === "object") {
      pack["CS2 Skin Atlas"] = "CS Exhibition";
      if (!pack["CS Exhibition"]) pack["CS Exhibition"] = "CS Exhibition";
    }
  });

  function pageName() {
    return location.pathname.split(/[\\/]/).pop() || "index.html";
  }

  function normalizeLang(value) {
    return String(value || "").trim() || DEFAULT_LANG;
  }

  function supportedLanguages() {
    const external = Array.isArray(globalThis.CS2_SUPPORTED_LANGUAGES) && globalThis.CS2_SUPPORTED_LANGUAGES.length
      ? globalThis.CS2_SUPPORTED_LANGUAGES
      : LANGUAGE_LABELS;
    const knownLabels = new Map(LANGUAGE_LABELS.map((entry) => [entry.code, entry.label]));
    return external.map((entry) => ({
      code: normalizeLang(entry.code),
      label: knownLabels.get(entry.code) || entry.label || entry.code
    }));
  }

  function readStoredLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch {
      return normalizeLang(document.documentElement.dataset.uiLang || document.documentElement.lang || DEFAULT_LANG);
    }
  }

  function currentLanguage() {
    const current = readStoredLang();
    const supported = new Set(supportedLanguages().map((entry) => entry.code));
    return supported.has(current) ? current : DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    const next = normalizeLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    document.documentElement.lang = next;
    document.documentElement.dataset.uiLang = next;
  }

  function translationPack(lang) {
    const normalized = normalizeLang(lang);
    const aliasMap = {
      "es-MX": ["es-MX", "es-ES", "en"],
      "es-ES": ["es-ES", "en"],
      "pt-PT": ["pt-PT", "pt-BR", "en"],
      "pt-BR": ["pt-BR", "pt-PT", "en"],
      "zh-TW": ["zh-TW", "zh-CN", "en"]
    };
    const candidates = aliasMap[normalized] || [normalized, normalized.split("-")[0], "en"];
    for (const candidate of candidates) {
      if (UI_TRANSLATIONS[candidate]) return UI_TRANSLATIONS[candidate];
    }
    return null;
  }

  function translateUiLiteral(en, zh) {
    const lang = currentLanguage();
    const pack = translationPack(lang);
    if (pack?.[en]) return pack[en];
    if (lang === "zh-CN") return zh || en;
    return en;
  }

  function uiTemplate(en, values = {}) {
    return translateUiLiteral(en, en).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  async function ensureLocaleLoaded(lang) {
    if (!lang || lang === "en" || lang === "zh-CN") return;
    if (globalThis.CS2_CATALOG_LOCALES?.[lang]) return;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-catalog-locale="${CSS.escape(lang)}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = `.data/catalog-locales/${encodeURIComponent(lang)}.js`;
      script.dataset.catalogLocale = lang;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load locale ${lang}`));
      document.head.appendChild(script);
    }).catch(() => {});
  }

  function applyTitle() {
    const key = PAGE_TITLE_KEYS[pageName()];
    if (!key) return;
    const siteName = translateUiLiteral("CS Exhibition", "CS Exhibition");
    document.title = key === "CS Exhibition" ? siteName : `${translateUiLiteral(key, key)} | ${siteName}`;
  }

  function applyNav() {
    const lang = currentLanguage();
    const nav = document.querySelector(".top-nav");
    const pack = NAV_TRANSLATIONS[lang] || NAV_TRANSLATIONS[lang.split("-")[0]] || NAV_TRANSLATIONS.en;
    if (nav) {
      nav.setAttribute("aria-label", pack.nav || "Primary Navigation");
      nav.querySelectorAll("a[data-nav-key]").forEach((link) => {
        const key = link.dataset.navKey;
        if (!key) return;
        if (pack[key]) link.textContent = pack[key]; else if (!link.textContent.trim()) link.textContent = key;
      });
    }
    const brand = document.querySelector(".brand");
    if (brand && !brand.textContent.trim()) {
      brand.textContent = pack.brand || "CS Exhibition";
    }
    document.documentElement.dataset.navReady = "true";
  }

  function bindSwitcher() {
    const select = document.querySelector(".lang-switch");
    if (!(select instanceof HTMLSelectElement)) return;
    const current = currentLanguage();
    const options = supportedLanguages()
      .map((entry) => `<option value="${entry.code}">${entry.label}</option>`)
      .join("");
    if (select.innerHTML !== options) select.innerHTML = options;
    select.value = current;
    select.setAttribute("aria-label", translateUiLiteral("Language", "\u8bed\u8a00"));
    select.setAttribute("title", translateUiLiteral("Language", "\u8bed\u8a00"));
    if (!select.dataset.bound) {
      select.dataset.bound = "true";
      select.addEventListener("change", () => setLanguage(select.value));
    }
  }

  async function rerenderAfterLanguageChange() {
    applyNav();
    applyTitle();
    bindSwitcher();
    await ensureLocaleLoaded(currentLanguage());
    globalThis.renderCurrentPage?.();
  }

  async function setLanguage(lang) {
    setStoredLang(lang);
    await rerenderAfterLanguageChange();
  }

  async function boot() {
    setStoredLang(currentLanguage());
    await rerenderAfterLanguageChange();
  }

  globalThis.getCurrentLanguage = currentLanguage;
  globalThis.isEnglishUI = () => currentLanguage() === "en";
  globalThis.uiText = translateUiLiteral;
  globalThis.uiTemplate = uiTemplate;
  globalThis.translateTextToEnglish = (value) => Promise.resolve(String(value || ""));
  globalThis.ensureCatalogLocaleLoaded = ensureLocaleLoaded;
  globalThis.applyLanguageChrome = () => {
    applyNav();
    applyTitle();
    bindSwitcher();
  };

  boot().catch(() => {
    applyNav();
    applyTitle();
    bindSwitcher();
  });
})();


