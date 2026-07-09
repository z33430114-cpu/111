import test from "node:test";
import assert from "node:assert/strict";

import { applyFilterOverrides } from "./loadout-chat.mjs";
import { handleLoadoutChat } from "./loadout-chat.mjs";

test("applyFilterOverrides lets filter selections override conflicting prompt dimensions", () => {
  const merged = applyFilterOverrides(
    {
      color: "red",
      styles: ["aggressive", "neon"],
      weaponPreferences: ["Desert Eagle"],
      mustInclude: ["knife"],
      excludeSlots: [],
      budgetMode: "conservative"
    },
    {
      preset: "guns",
      color: "blue",
      style: "clean"
    }
  );

  assert.equal(merged.color, "blue");
  assert.deepEqual(merged.styles, ["clean"]);
  assert.equal(merged.budgetMode, "conservative");
  assert.deepEqual(merged.excludeSlots.sort(), ["glove", "knife"]);
  assert.ok(merged.weaponPreferences.includes("Desert Eagle"));
  assert.ok(merged.weaponPreferences.includes("AK-47"));
  assert.ok(!merged.mustInclude.includes("knife"));
});

test("handleLoadoutChat keeps a Miami glove follow-up as a preferred Vice glove", async () => {
  const response = await handleLoadoutChat(process.cwd(), {
    locale: "zh",
    messages: [
      { role: "user", content: "预算 800000 搭一套紫色饰品" },
      { role: "user", content: "手套换迈阿密手套" }
    ]
  }, { provider: "rules" });

  assert.ok(response.preferences.preferredItems.some((item) => item.slot === "glove" && item.query === "Vice"));
});
