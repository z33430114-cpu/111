import test from "node:test";
import assert from "node:assert/strict";

import { generateLoadoutCandidatesFromIndex } from "./recommendation-engine.mjs";

function candidate({
  id,
  weaponId,
  weapon,
  price,
  searchText,
  tone = "white",
  type = "rifle",
  group = "rifle"
}) {
  return {
    id,
    wearId: "factory-new",
    weaponId,
    weapon,
    weaponLabel: weapon,
    type,
    group,
    nameEn: id,
    nameZh: id,
    price,
    marketHashName: id,
    image: "",
    tone,
    colorTags: [tone],
    colorConfidence: 1,
    dominantColors: [{ name: tone, share: 0.6 }],
    rarity: "",
    rarityId: "",
    quality: "",
    collection: "",
    description: "",
    patternId: "",
    paintIndex: "",
    traitIds: ["clean"],
    searchText,
    wearLabel: "Factory New",
    source: "test"
  };
}

test("generateLoadoutCandidatesFromIndex does not blow past budget for preset-style slot defaults", () => {
  const index = {
    weapons: [
      { id: "ak-47", weapon: "AK-47", group: "rifle" },
      { id: "awp", weapon: "AWP", group: "rifle" },
      { id: "m4a4", weapon: "M4A4", group: "rifle" },
      { id: "m4a1-s", weapon: "M4A1-S", group: "rifle" },
      { id: "usp-s", weapon: "USP-S", group: "pistol" },
      { id: "glock-18", weapon: "Glock-18", group: "pistol" },
      { id: "bayonet", weapon: "Bayonet", group: "knife" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "ak", weaponId: "ak-47", weapon: "AK-47", price: 1110, searchText: "neon ak" }),
      candidate({ id: "awp", weaponId: "awp", weapon: "AWP", price: 570, searchText: "neon awp" }),
      candidate({ id: "m4a4", weaponId: "m4a4", weapon: "M4A4", price: 285, searchText: "neon m4a4" }),
      candidate({ id: "m4a1s", weaponId: "m4a1-s", weapon: "M4A1-S", price: 22, searchText: "neon m4a1s" }),
      candidate({ id: "usp", weaponId: "usp-s", weapon: "USP-S", price: 8, searchText: "neon usp", type: "pistol", group: "pistol" }),
      candidate({ id: "glock", weaponId: "glock-18", weapon: "Glock-18", price: 2, searchText: "neon glock", type: "pistol", group: "pistol" }),
      candidate({ id: "expensive-knife", weaponId: "bayonet", weapon: "Bayonet", price: 3844, searchText: "fade knife", type: "knife", group: "knife" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 2000,
    weaponPreferences: ["AK-47", "AWP", "M4A4", "M4A1-S", "USP-S", "Glock-18"],
    mustInclude: ["knife"],
    styles: ["neon"],
    budgetMode: "maximize"
  });

  assert.ok(result.loadouts[0].totalPrice <= 2000);
  assert.deepEqual(result.loadouts[0].items.map((item) => item.weaponId), ["ak-47", "awp", "m4a4", "m4a1-s", "usp-s", "glock-18"]);
});

test("generateLoadoutCandidatesFromIndex keeps one skin per weapon unless extra copies were explicitly requested", () => {
  const index = {
    weapons: [
      { id: "ak-47", weapon: "AK-47", group: "rifle" },
      { id: "m4a1-s", weapon: "M4A1-S", group: "rifle" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "ak-main", weaponId: "ak-47", weapon: "AK-47", price: 500, searchText: "clean ak main" }),
      candidate({ id: "ak-alt", weaponId: "ak-47", weapon: "AK-47", price: 300, searchText: "clean ak alt" }),
      candidate({ id: "m4-main", weaponId: "m4a1-s", weapon: "M4A1-S", price: 400, searchText: "clean m4 main" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 1500,
    requestedItems: [{ weapon: "AK-47", quantity: 1 }],
    weaponPreferences: ["AK-47", "M4A1-S"],
    styles: ["clean"],
    budgetMode: "maximize"
  });

  assert.deepEqual(result.loadouts[0].items.map((item) => item.weaponId), ["ak-47", "m4a1-s"]);
});

test("generateLoadoutCandidatesFromIndex prioritizes an explicitly requested knife ahead of lower priority guns", () => {
  const index = {
    weapons: [
      { id: "karambit", weapon: "Karambit", group: "knife" },
      { id: "ak-47", weapon: "AK-47", group: "rifle" },
      { id: "awp", weapon: "AWP", group: "rifle" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "knife", weaponId: "karambit", weapon: "Karambit", price: 1200, searchText: "lore knife", type: "knife", group: "knife" }),
      candidate({ id: "ak", weaponId: "ak-47", weapon: "AK-47", price: 700, searchText: "ak" }),
      candidate({ id: "awp", weaponId: "awp", weapon: "AWP", price: 600, searchText: "awp" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 1800,
    mustInclude: ["knife"],
    weaponPreferences: ["AK-47", "AWP"],
    budgetMode: "maximize"
  });

  assert.ok(result.loadouts[0].items.some((item) => item.weaponId === "karambit"));
  assert.equal(result.loadouts[0].totalPrice <= 1800, true);
});

test("generateLoadoutCandidatesFromIndex avoids repeating the same skin by default", () => {
  const index = {
    weapons: [
      { id: "ak-47", weapon: "AK-47", group: "rifle" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "ak-elite", weaponId: "ak-47", weapon: "AK-47", price: 300, searchText: "white clean printstream ak" }),
      candidate({ id: "ak-vulcan", weaponId: "ak-47", weapon: "AK-47", price: 280, searchText: "white clean ak" }),
      candidate({ id: "ak-slate", weaponId: "ak-47", weapon: "AK-47", price: 260, searchText: "white ak" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 650,
    requestedItems: [
      { weapon: "AK-47", quantity: 2 }
    ],
    color: "white",
    styles: ["clean"],
    budgetMode: "maximize"
  });

  const itemIds = result.loadouts[0].items.map((item) => item.id);
  assert.equal(itemIds.length, 2);
  assert.equal(new Set(itemIds).size, 2);
});

test("generateLoadoutCandidatesFromIndex upgrades picks to better use the budget", () => {
  const index = {
    weapons: [
      { id: "ak-47", weapon: "AK-47", group: "rifle" },
      { id: "m4a1-s", weapon: "M4A1-S", group: "rifle" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "ak-cheap", weaponId: "ak-47", weapon: "AK-47", price: 100, searchText: "white clean printstream ak" }),
      candidate({ id: "ak-expensive", weaponId: "ak-47", weapon: "AK-47", price: 450, searchText: "white clean ak" }),
      candidate({ id: "m4-cheap", weaponId: "m4a1-s", weapon: "M4A1-S", price: 120, searchText: "white clean printstream m4" }),
      candidate({ id: "m4-expensive", weaponId: "m4a1-s", weapon: "M4A1-S", price: 350, searchText: "white clean m4" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 800,
    weaponPreferences: ["AK-47", "M4A1-S"],
    color: "white",
    styles: ["clean"],
    budgetMode: "maximize"
  });

  assert.equal(result.loadouts[0].totalPrice, 800);
  assert.equal(result.loadouts[0].budgetUsage, 1);
});

test("generateLoadoutCandidatesFromIndex honors a preferred named glove instead of defaulting to hand wraps", () => {
  const index = {
    weapons: [
      { id: "hand-wraps", weapon: "Hand Wraps", group: "glove" },
      { id: "sport-gloves", weapon: "Sport Gloves", group: "glove" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "plum-fn", weaponId: "driver-gloves", weapon: "Driver Gloves", price: 7467.9, searchText: "purple glove driver gloves plum quill factory new", tone: "violet", type: "glove", group: "glove" }),
      candidate({ id: "giraffe-fn", weaponId: "hand-wraps", weapon: "Hand Wraps", price: 3345.01, searchText: "purple glove hand wraps giraffe", tone: "violet", type: "glove", group: "glove" }),
      candidate({ id: "vice-ft", weaponId: "sport-gloves", weapon: "Sport Gloves", price: 12888, searchText: "purple glove sport gloves vice miami vice field tested", tone: "violet", type: "glove", group: "glove" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 800000,
    color: "purple",
    mustInclude: ["glove"],
    preferredItems: [{ slot: "glove", query: "Vice" }],
    budgetMode: "maximize"
  });

  assert.equal(result.loadouts[0].items[0].weaponId, "sport-gloves");
  assert.equal(result.loadouts[0].items[0].id, "vice-ft");
});

test("generateLoadoutCandidatesFromIndex prefers field-tested gloves first for generic glove requests", () => {
  const index = {
    weapons: [
      { id: "hand-wraps", weapon: "Hand Wraps", group: "glove" },
      { id: "sport-gloves", weapon: "Sport Gloves", group: "glove" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "wraps-fn", weaponId: "hand-wraps", weapon: "Hand Wraps", price: 1800, searchText: "white glove hand wraps overprint factory new", tone: "white", type: "glove", group: "glove" }),
      candidate({ id: "sport-ft", weaponId: "sport-gloves", weapon: "Sport Gloves", price: 1700, searchText: "white glove sport gloves omega field tested", tone: "white", type: "glove", group: "glove" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 3000,
    color: "white",
    mustInclude: ["glove"],
    budgetMode: "maximize"
  });

  assert.equal(result.loadouts[0].items[0].weaponId, "sport-gloves");
  assert.equal(result.loadouts[0].items[0].id, "sport-ft");
});

test("generateLoadoutCandidatesFromIndex treats generic glove as a category instead of first glove weapon", () => {
  const index = {
    weapons: [
      { id: "hand-wraps", weapon: "Hand Wraps", group: "glove" },
      { id: "sport-gloves", weapon: "Sport Gloves", group: "glove" }
    ],
    aliasIndex: [],
    candidates: [
      candidate({ id: "wraps-ft", weaponId: "hand-wraps", weapon: "Hand Wraps", price: 1600, searchText: "white glove hand wraps overprint field tested", tone: "white", type: "glove", group: "glove" }),
      candidate({ id: "sport-ft", weaponId: "sport-gloves", weapon: "Sport Gloves", price: 1500, searchText: "white glove sport gloves omega field tested", tone: "white", type: "glove", group: "glove" })
    ]
  };

  const result = generateLoadoutCandidatesFromIndex(index, {
    budget: 2600,
    color: "white",
    mustInclude: ["glove"],
    budgetMode: "maximize"
  });

  assert.equal(result.requiredSlots[0], "glove");
  assert.equal(result.loadouts[0].items[0].weaponId, "sport-gloves");
});
