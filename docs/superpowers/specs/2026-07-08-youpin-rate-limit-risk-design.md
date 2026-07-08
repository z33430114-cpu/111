# YouPin Single-Item Lookup Rate-Limit Risk Reduction

Date: 2026-07-08

## Goal

Reduce YouPin rate-limit risk during single-item price lookup without collapsing price accuracy.

The current problem is that one user-visible "check this item" action can fan out into multiple YouPin requests across many wear tiers. That makes single-item lookup behave like a hidden batch operation and raises the chance of server-side rate limiting.

## Approved Direction

Use a low-risk, accuracy-preserving lookup flow:

1. Query the currently selected wear tier first.
2. Only if that lookup does not match, try at most 1-2 fallback wear tiers.
3. Stop immediately after the first successful match.
4. Never scan every wear tier for a single visible lookup.

This keeps the common case to one YouPin request, while still allowing a narrow fallback path when YouPin naming or listing coverage does not line up perfectly with the selected wear.

## Current Root Cause

The present single-item path builds a list of wear-based jobs from `buildYoupinWearSearchJobs(...)` and then iterates every generated job in `fetchYoupinSingleRecordForUser(...)`.

That means:

- a single item detail load may trigger multiple YouPin API requests
- multiple wear variants are explored even when the user only asked for one visible wear
- rate limiting is amplified by hidden fan-out rather than explicit user batch actions

## Proposed Behavior

### Lookup order

For a single-item YouPin lookup, the server will create a capped, ordered candidate list:

1. selected wear tier
2. nearest fallback wear tier
3. one final conservative fallback wear tier

The server will attempt them in order and stop as soon as one candidate produces a valid matched record.

### Hard request cap

Single-item YouPin lookup will have a strict maximum of 3 candidate jobs.

This cap applies per visible lookup request, regardless of how many wear tiers exist for the item.

### Match-stop behavior

Once one candidate returns a valid matched YouPin record for the requested item, no further candidate jobs will be requested.

### Cache behavior

When a candidate succeeds:

- write the matched YouPin record to the existing YouPin link snapshot
- write the matched platform record to the persistent market snapshot
- update the permanent reference price using the already approved "last successful platform price wins" rule

When a candidate fails:

- keep any existing cached YouPin price intact
- do not clear previously persisted reference data

## Fallback selection strategy

The fallback list should be small and deterministic.

Recommended rule:

1. selected wear first
2. if selected wear is not the cheapest wear, try the nearest cheaper canonical wear
3. if still unresolved, try the nearest more worn canonical wear

For example:

- `Field-Tested` -> `Minimal Wear` -> `Well-Worn`
- `Minimal Wear` -> `Factory New` -> `Field-Tested`
- `Factory New` -> `Minimal Wear`
- `Battle-Scarred` -> `Well-Worn`

This is intentionally limited. The goal is risk reduction first, not exhaustive search.

## Service changes

### `buildYoupinWearSearchJobs(...)`

Change this helper so the single-item flow receives a capped and ordered candidate list instead of the full expanded wear set.

Expected behavior:

- selected wear always first when present
- maximum of 3 unique candidate jobs
- no duplicate wear candidates
- stable output for the same input

### `fetchYoupinSingleRecordForUser(...)`

Change the loop so it becomes "first success wins":

- iterate ordered candidate jobs
- request one candidate at a time
- if no record is matched, continue
- if a record is matched, persist it and return immediately
- if all candidates fail, return `null`

The function should no longer aggregate matches from every candidate before deciding what to return.

### Rate-limit handling

Keep the current cooldown mechanism, but only as a protection layer after a real YouPin rate-limit response.

This work does not remove cooldown behavior. It reduces how often cooldown is entered by lowering request fan-out.

## UI behavior

No new user-facing controls are required.

The item detail page will continue to show a single "checking selected wear price" loading state. Internal fallback attempts remain invisible to the user.

If rate limiting still happens:

- cached YouPin prices remain usable when available
- rate-limit messaging remains localized and non-fatal when cache exists

## Testing

Add regression coverage for:

1. selected wear hit stops further YouPin requests
2. selected wear miss falls back to at most 2 extra candidates
3. candidate list never exceeds 3 jobs
4. successful fallback still persists cache and permanent reference updates
5. failed lookup keeps previous cached/persisted data intact

## Scope boundaries

In scope:

- single-item YouPin lookup fan-out reduction
- capped fallback ordering
- early-stop behavior
- regression tests

Out of scope:

- redesigning YouPin auth/session handling
- changing BUFF lookup behavior
- introducing queue workers or distributed rate-limit coordination
- adding manual UI toggles for lookup aggressiveness

## Risks and mitigations

Risk: some items may lose matches that were previously found only by broad wear scanning.

Mitigation: keep 1-2 targeted fallback tiers instead of collapsing to selected-wear-only.

Risk: fallback ordering may choose a less useful second candidate for some wear groups.

Mitigation: keep the ordering deterministic and covered by tests so we can tune it safely later.

Risk: cache quality could hide true lookup misses.

Mitigation: preserve existing cached-price messaging so the user can tell when a cached result is being shown.
