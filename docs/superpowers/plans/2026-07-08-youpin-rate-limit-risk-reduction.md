# YouPin Rate-Limit Risk Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce YouPin single-item lookup fan-out so one visible item check usually issues one request, never scans all wears, and still preserves fallback accuracy plus cached/persistent price behavior.

**Architecture:** Constrain the single-item YouPin lookup path to a deterministic, capped candidate list built around the currently selected wear. Make the lookup loop stop on first match, keep persistence behavior unchanged for successful hits, and preserve cached fallback behavior when rate limiting occurs.

**Tech Stack:** Node.js ESM, built-in `node:test`, existing `scripts/serve.mjs` server flow, `server/market-sync.mjs` lookup helpers.

## Global Constraints

- Single-item YouPin lookup must query the selected wear first.
- Single-item YouPin lookup may try at most 1-2 fallback wears after the selected wear.
- Single-item YouPin lookup must stop immediately after the first successful match.
- Single-item YouPin lookup must never scan every wear tier for one visible item lookup.
- Successful fallback hits must still persist YouPin cache data and permanent reference price updates.
- Failed lookups must preserve previous cached and persisted reference data.

---

### Task 1: Cap YouPin Wear Candidates

**Files:**
- Modify: `C:\Users\35191\Documents\git1\server\market-sync.mjs`
- Modify: `C:\Users\35191\Documents\git1\server\market-sync.test.mjs`

**Interfaces:**
- Consumes: `buildYoupinWearSearchJobs({ itemId, wearId, variantId, snapshotRecord, marketHashName })`
- Produces: `buildYoupinWearSearchJobs(...) => Array<{ itemId: string, variantId: string, wearId: string, marketHashName: string }>` with max length `3`, selected wear first, unique candidates only

- [ ] **Step 1: Write the failing tests**

Add tests to `C:\Users\35191\Documents\git1\server\market-sync.test.mjs` covering:

```js
test("buildYoupinWearSearchJobs keeps the selected wear first and caps candidates to three", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "factory-new": { marketHashName: "AK-47 | Redline (Factory New)", price: 900 },
        "minimal-wear": { marketHashName: "AK-47 | Redline (Minimal Wear)", price: 700 },
        "field-tested": { marketHashName: "AK-47 | Redline (Field-Tested)", price: 480 },
        "well-worn": { marketHashName: "AK-47 | Redline (Well-Worn)", price: 430 },
        "battle-scarred": { marketHashName: "AK-47 | Redline (Battle-Scarred)", price: 300 }
      }
    }
  });

  assert.equal(jobs[0]?.wearId, "field-tested");
  assert.equal(jobs.length, 3);
  assert.deepEqual([...new Set(jobs.map((job) => job.wearId))], jobs.map((job) => job.wearId));
});

test("buildYoupinWearSearchJobs only adds conservative neighbors for edge wears", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "factory-new",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "factory-new": { marketHashName: "AK-47 | Redline (Factory New)", price: 900 },
        "minimal-wear": { marketHashName: "AK-47 | Redline (Minimal Wear)", price: 700 },
        "field-tested": { marketHashName: "AK-47 | Redline (Field-Tested)", price: 480 }
      }
    }
  });

  assert.deepEqual(jobs.map((job) => job.wearId), ["factory-new", "minimal-wear", "field-tested"]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test server/market-sync.test.mjs`

Expected: FAIL because `buildYoupinWearSearchJobs(...)` still expands the full wear set instead of capping to three deterministic candidates.

- [ ] **Step 3: Write the minimal implementation**

Update `C:\Users\35191\Documents\git1\server\market-sync.mjs` so `buildYoupinWearSearchJobs(...)`:

```js
const WEAR_PROGRESSIVE_ORDER = [
  "factory-new",
  "minimal-wear",
  "field-tested",
  "well-worn",
  "battle-scarred"
];

function nearestWearCandidates(selectedWearId = "", availableWearIds = []) {
  const selectedIndex = WEAR_PROGRESSIVE_ORDER.indexOf(selectedWearId);
  if (selectedIndex === -1) return availableWearIds.slice(0, 2);
  const neighbors = [];
  for (let distance = 1; distance < WEAR_PROGRESSIVE_ORDER.length; distance += 1) {
    const left = WEAR_PROGRESSIVE_ORDER[selectedIndex - distance];
    const right = WEAR_PROGRESSIVE_ORDER[selectedIndex + distance];
    if (left && availableWearIds.includes(left)) neighbors.push(left);
    if (right && availableWearIds.includes(right)) neighbors.push(right);
    if (neighbors.length >= 2) break;
  }
  return neighbors.slice(0, 2);
}
```

Then build jobs as:

```js
const availableWearIds = entries.map((entry) => entry.wearId).filter(Boolean);
const orderedWearIds = [
  selectedWearId,
  ...nearestWearCandidates(selectedWearId, availableWearIds)
].filter(Boolean);
```

Finally, return at most three unique jobs by wear id while preserving `marketHashName`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test server/market-sync.test.mjs`

Expected: PASS with the new wear-candidate tests and existing market-sync tests all green.

- [ ] **Step 5: Commit**

```bash
git add server/market-sync.mjs server/market-sync.test.mjs
git commit -m "test: cap youpin single-item wear candidates"
```

### Task 2: Stop On First Successful YouPin Match

**Files:**
- Modify: `C:\Users\35191\Documents\git1\scripts\serve.mjs`
- Create: `C:\Users\35191\Documents\git1\scripts\youpin-single-lookup-control.test.mjs`

**Interfaces:**
- Consumes: `fetchYoupinSingleRecordForUser(userId, { itemId, variantId, wearId, marketHashName })`
- Produces: single-item lookup behavior that requests candidates sequentially, returns the first matched record immediately, and does not continue once one match succeeds

- [ ] **Step 1: Write the failing tests**

Create `C:\Users\35191\Documents\git1\scripts\youpin-single-lookup-control.test.mjs` with helper extraction like the other `scripts/*.test.mjs` files, then add focused tests:

```js
test("fetchYoupinSingleRecordForUser stops after the first matched wear", async () => {
  const calls = [];
  const jobs = [
    { itemId: "skin-a", variantId: "standard", wearId: "field-tested", marketHashName: "ft" },
    { itemId: "skin-a", variantId: "standard", wearId: "minimal-wear", marketHashName: "mw" },
    { itemId: "skin-a", variantId: "standard", wearId: "well-worn", marketHashName: "ww" }
  ];

  // stub buildYoupinWearSearchJobs => jobs
  // stub fetchYoupinSaleTemplatePage => returns a matched page for "mw"
  // assert the loop stops before requesting "ww"
});

test("fetchYoupinSingleRecordForUser returns null after at most three candidates", async () => {
  // stub three misses and assert only those three candidates are requested
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/youpin-single-lookup-control.test.mjs`

Expected: FAIL because the current implementation accumulates across all generated jobs and only decides after finishing the full loop.

- [ ] **Step 3: Write the minimal implementation**

Refactor `fetchYoupinSingleRecordForUser(...)` in `C:\Users\35191\Documents\git1\scripts\serve.mjs` from "scan all jobs" to "first success wins".

Implementation shape:

```js
for (const job of jobs) {
  const page = await fetchYoupinSaleTemplatePage(auth, 1, youpinSaleTemplatePageSize, job.marketHashName);
  const matchedContent = /* existing match logic */;
  if (!matchedContent) continue;

  const resolvedMatch = /* existing resolution logic */;
  const storageKey = mergeYoupinCommodity(mergedItems, resolvedMatch, matchedContent, updatedAt);
  const matchedRecord = mergedItems[storageKey];

  await persistPlatformRecordsToMarketPrices([matchedRecord], { source: "YouPin", updatedAt });
  await writeFile(youpinLinksFile, JSON.stringify(output, null, 2), "utf8");
  return matchedRecord || null;
}

return mergedItems[requestedStorageKey] || null;
```

Keep the existing auth, market-index, and resolution logic intact; only change loop control and persistence timing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/youpin-single-lookup-control.test.mjs`

Expected: PASS, proving that matched lookups stop immediately and misses remain capped.

- [ ] **Step 5: Commit**

```bash
git add scripts/serve.mjs scripts/youpin-single-lookup-control.test.mjs
git commit -m "feat: stop youpin single-item lookup on first match"
```

### Task 3: Preserve Persistence And Rate-Limit UX

**Files:**
- Modify: `C:\Users\35191\Documents\git1\scripts\platform-reference-persistence.test.mjs`
- Modify: `C:\Users\35191\Documents\git1\scripts\youpin-rate-limit-behavior.test.mjs`
- Modify: `C:\Users\35191\Documents\git1\scripts\serve.mjs`
- Modify: `C:\Users\35191\Documents\git1\app.js`

**Interfaces:**
- Consumes: `buildPersistentReferenceRecord(...)`, `buildPlatformPricePayload(...)`, `localizePlatformMessage(...)`
- Produces: successful fallback hits still update cache/reference persistence; rate-limited states still surface cached YouPin prices and localized messaging

- [ ] **Step 1: Write the failing tests**

Extend the existing tests with one persistence case:

```js
test("fallback wear matches still produce a persistent YouPin reference write", () => {
  const result = buildPersistentReferenceRecord({
    syncedOverride: {
      itemId: "skin-a",
      wearId: "minimal-wear",
      variantId: "standard",
      effectivePrice: 405,
      effectiveSource: "youpin"
    },
    youpinRecord: {
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Minimal Wear)",
      sellNum: 12
    },
    snapshotEntry: null
  });

  assert.equal(result.source, "YouPin");
  assert.equal(result.record.wearId, "minimal-wear");
});
```

Keep the existing rate-limit test suite in `scripts/youpin-rate-limit-behavior.test.mjs` green as a guardrail.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs`

Expected: FAIL if the new fallback persistence case is not yet supported exactly as specified.

- [ ] **Step 3: Write the minimal implementation**

Ensure `buildPersistentReferenceRecord(...)` in `C:\Users\35191\Documents\git1\scripts\serve.mjs` accepts fallback-hit `syncedOverride` records without depending on a same-wear snapshot entry.

Keep `buildPlatformPricePayload(...)` and `localizePlatformMessage(...)` behavior from the current rate-limit UX fix:

```js
message: usingCachedPrice
  ? `${label} request was rate limited, showing the last cached price.`
  : ...
```

and:

```js
if (/YouPin request was rate limited, showing the last cached price/i.test(text)) ...
if (/YouPin request was rate limited/i.test(text)) ...
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs`

Expected: PASS with fallback persistence and localized rate-limit behavior intact.

- [ ] **Step 5: Commit**

```bash
git add scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs scripts/serve.mjs app.js
git commit -m "fix: preserve fallback persistence and youpin rate-limit messaging"
```

### Task 4: Full Regression Verification

**Files:**
- Modify: `C:\Users\35191\Documents\git1\docs\superpowers\specs\2026-07-08-youpin-rate-limit-risk-design.md` (only if implementation constraints differ from approved design)
- Test: `C:\Users\35191\Documents\git1\server\market-sync.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\platform-reference-persistence.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\youpin-rate-limit-behavior.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\youpin-single-lookup-control.test.mjs`

**Interfaces:**
- Consumes: all updated lookup, persistence, and UI-localization behavior from Tasks 1-3
- Produces: verified end-to-end regression coverage for the approved single-item rate-limit reduction approach

- [ ] **Step 1: Run the focused regression suite**

Run:

```bash
node --test server/market-sync.test.mjs scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs scripts/youpin-single-lookup-control.test.mjs
```

Expected: PASS with all lookup-order, stop-on-hit, persistence, and rate-limit UX tests green.

- [ ] **Step 2: Inspect the final diff for unintended scope**

Run:

```bash
git diff -- server/market-sync.mjs server/market-sync.test.mjs scripts/serve.mjs scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs scripts/youpin-single-lookup-control.test.mjs app.js
```

Expected: Only the approved YouPin single-item lookup, persistence, and rate-limit UX files changed.

- [ ] **Step 3: Update spec only if behavior changed**

If implementation differs from the approved spec, update:

```md
C:\Users\35191\Documents\git1\docs\superpowers\specs\2026-07-08-youpin-rate-limit-risk-design.md
```

with the exact final fallback ordering or stop condition.

- [ ] **Step 4: Commit**

```bash
git add server/market-sync.mjs server/market-sync.test.mjs scripts/serve.mjs scripts/platform-reference-persistence.test.mjs scripts/youpin-rate-limit-behavior.test.mjs scripts/youpin-single-lookup-control.test.mjs app.js docs/superpowers/specs/2026-07-08-youpin-rate-limit-risk-design.md
git commit -m "feat: reduce youpin single-item rate-limit risk"
```

## Self-Review

### Spec coverage

- Selected wear first: covered in Task 1 tests and implementation.
- At most 1-2 fallback wears: covered by capped candidate generation in Task 1.
- Stop after first success: covered in Task 2.
- No full wear scanning: covered by Task 1 cap and Task 2 loop control.
- Persist successful fallback hits: covered in Task 3.
- Preserve cached/rate-limit UX: covered in Task 3.

### Placeholder scan

- No `TODO`, `TBD`, or "appropriate handling" placeholders remain.
- Each task includes concrete file paths, commands, and expected outcomes.

### Type consistency

- `buildYoupinWearSearchJobs(...)` remains an array of `{ itemId, variantId, wearId, marketHashName }`.
- `fetchYoupinSingleRecordForUser(...)` still returns `record | null`.
- `buildPersistentReferenceRecord(...)` still returns `{ source, record } | null`.

Plan complete and saved to `docs/superpowers/plans/2026-07-08-youpin-rate-limit-risk-reduction.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
