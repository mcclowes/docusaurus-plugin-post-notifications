# Code review: `docusaurus-plugin-new-post-toast`

**Reviewer:** Principal engineer, onboarding
**Scope:** Holistic review of `src/` and adjacent build/test infrastructure
**Audience:** Junior/mid engineers on the team — framed to teach, not just tear down

This review is intentionally blunt. The plugin works for the happy path, but there are meaningful bugs, a duplicated architecture, and a lot of defensive code that mostly exists to compensate for unclear ownership between two parallel rendering paths. Fixing these is mostly about _deleting_ code.

---

## 1. The biggest problem: two systems doing the same job

There are **two entirely separate toast-initialisation pipelines**:

1. **Client module** — `src/client/index.ts` listens on `onRouteDidUpdate`, computes `newPosts`, dispatches a `new-posts-available` `CustomEvent`, and updates `lastVisit`.
2. **React container** — `src/theme/NewPostToast/index.tsx` uses `usePluginData`, computes `newPosts` _again_ inside `useMemo`, sets state after a `setTimeout`, updates `lastVisit` _again_, **and** also listens for the `new-posts-available` event as "backward compatibility."

They both:

- Read `getLastVisit(...)` and then write `updateLastVisit(...)` with the current time
- Apply `shouldExcludePath`
- Apply `getNewPosts`
- Respect `behavior.delay` via `setTimeout`

### Why this is bad

- **Race condition on `lastVisit`.** Whichever runs first overwrites the timestamp. If the client module fires first (common — it hooks into `onRouteDidUpdate` which runs before component effects settle), `getLastVisit()` inside the `useMemo` now returns "just now", and `getNewPosts` returns `[]`. Result: toasts never render via the React path. The event listener is effectively the only thing keeping the UI alive — and that event fires only once per route change, before the listener may even be mounted on first load.
- **Double `updateLastVisit` writes** — two JSON parse/serialize round trips per navigation for no reason.
- **Comprehension tax.** A reader has to hold both models in their head and figure out which one is authoritative. The answer appears to be "both, accidentally."
- **Tests lie.** Because the two paths compute the same thing, unit tests pass while the integration is broken.

### What to do

Pick one. Given you already depend on `usePluginData`, delete `src/client/index.ts` entirely, plus `getClientModules()` in `plugin.ts`, plus the `new-posts-available` event plumbing in the container. The container alone is sufficient and lives inside React's lifecycle where it belongs.

### Teaching point

When two mechanisms converge on the same responsibility, that's not redundancy for robustness — it's a bug farm. "Backward compatibility with ourselves" inside a single package is a code smell. Pick the owner, delete the other.

---

## 2. Correctness bugs and missed edge cases

### 2.1 `lastVisit` is updated **before** the user has seen anything

In both paths, `updateLastVisit` runs as soon as toasts are dispatched/rendered — not when the user acknowledges them. Consequences:

- User opens tab, toast starts its 1000ms delay, user closes tab at 999ms → `lastVisit` got updated by the _other_ path and the posts are now marked "seen" forever.
- User navigates between two pages quickly; the second navigation's `lastVisit` write prevents the first page's toasts from ever being considered new again.
- User has JS disabled on the page where the route fires but not elsewhere → inconsistent.

**Fix:** update `lastVisit` only when a toast is actually rendered _and_ visible for some minimum threshold (or on dismissal / click / page unload). Consider decoupling "I've seen the site" from "I've seen these specific posts" — you already have `dismissedPosts`, use it as the source of truth and stop treating `lastVisit` as the filter.

### 2.2 `new Date(post.date)` on untrusted input

`post.date` comes from the blog plugin's metadata. If a post has a malformed date in frontmatter, `new Date(...)` returns `Invalid Date`, and `postDate > lastVisitDate` is always `false` silently. No warning, no test coverage. Validate or filter invalid dates in `plugin.ts` where you map metadata, and log the offending post id.

### 2.3 `maxAgeDays` uses `setDate` — DST and month-end hazards

```ts
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - maxAge);
```

This is mutation-based arithmetic that crosses DST boundaries incorrectly and can land on nonexistent dates in edge cases. Use millisecond math:

```ts
const cutoffDate = new Date(Date.now() - maxAge * 86_400_000);
```

Cleaner, faster, correct.

### 2.4 `setDate` mutates `cutoffDate` **and** you don't clamp `maxAge`

Validation rejects `< 1` but doesn't reject `NaN`, `Infinity`, or non-integer floats. `resolveOptions` then propagates garbage. Always validate at the boundary, coerce in the resolver.

### 2.5 `SSR leakage` in `useMemo`

```ts
if (typeof window !== 'undefined') {
  const pathname = window.location.pathname;
  if (shouldExcludePath(pathname, options)) return [];
}
```

During SSR, `window` is undefined, so `shouldExcludePath` is skipped and `getNewPosts` runs — but `getLastVisit` wraps `localStorage` and returns `null` on the server, so you get "all posts look new" server-side. Then on hydration, the client value differs. This is a classic **hydration mismatch** waiting to happen. The container renders `null` today only because `toasts.length === 0` initially, but the underlying logic is fragile. Gate the entire computation behind a mounted state.

### 2.6 The `new-posts-available` listener never cleans up `lastInitializedPath`

`lastInitializedPath` in `client/index.ts` lives at module scope and is never reset. If the user's SPA navigates away and comes back via browser back/forward to the same path, no toasts will fire. If `onRouteDidUpdate` fires on hard reloads too, this may also suppress first-load toasts after a client-only nav to same pathname.

### 2.7 `shouldExcludePath` uses `startsWith`

`/blog` matches `/blog-archive`. Either require exact segment boundaries (`/blog` or `/blog/`) or document the footgun. Users providing `excludePaths: ['/d']` will block `/docs` and be confused.

### 2.8 `positionClasses` silently falls back to `bottomRight`

If validation is bypassed (e.g., `throwOnError: false` is the default), a typo in `position` silently moves the toast to the bottom right. Either assert after resolve, or return an explicit warning at runtime.

### 2.9 Accessibility regressions

- `role="alert"` + `aria-live="polite"` is contradictory. `role="alert"` implies `aria-live="assertive"`. Pick one — for toasts, use `role="status"` with `aria-live="polite"`.
- The close button renders `×` as its only label. Screen readers in some locales read "multiplication sign." The `aria-label="Dismiss notification"` helps, but prefer a visually-hidden text child too.
- No focus management: toasts appear and disappear without announcing, and keyboard users can't easily dismiss (no `Escape` handler, no focus trap, tab order undefined).
- `prefers-reduced-motion` is not honoured anywhere in the CSS — users with vestibular disorders get the full slide animation.
- No minimum colour contrast guarantees; `rgba(0,0,0,0.15)` box shadow is the only separator in dark mode.

### 2.10 `showImage` has no `loading="lazy"`, no dimensions, no error fallback

A broken `post.image` URL renders a broken-image icon with empty `alt=""`. Either omit the image on error or default `alt` to the post title.

### 2.11 `storage.key` collisions across multi-instance blogs

If a site has two blog instances (`blog.pluginId: 'default'` and `'engineering'`), both write to `docusaurus-new-post-toast` unless the user remembers to set distinct keys. The plugin could namespace by `pluginId` automatically.

### 2.12 `dismissedPosts` grows forever

There is no garbage collection. A site with weekly posts over 3 years ends up with ~150 ids in localStorage forever. Prune entries not present in the current manifest on write.

### 2.13 Storage quota handling is wishful

`setStorageData` swallows all errors. If the user is at quota, the plugin silently stops persisting dismissals and every refresh re-shows "dismissed" toasts. Detect `QuotaExceededError` and clear `dismissedPosts` as a recovery.

### 2.14 JSON shape is not validated on read

`getStorageData` casts whatever it parsed to `StorageData`. If a previous version wrote a different shape, or a user manually edited their localStorage, you hand unvalidated data to `getDismissedPosts` which does `??  []` — that's fine — but `lastVisit` is handed to `new Date(...)` with no guardrail. The `version` field exists but is never read.

---

## 3. Architecture and API design

### 3.1 `resolveOptions` is hand-written merge boilerplate

37 lines of `options.toast?.position ?? DEFAULT_OPTIONS.toast.position`. One typo and a key silently defaults. A 2-line `deepMerge(DEFAULT_OPTIONS, options)` (or Zod with `.default()` everywhere) is safer and tests itself.

### 3.2 `validation.ts` and `options.ts` duplicate knowledge

Two places encode "what fields exist and what their types are": the validator and the resolver. Plus a third — `types.ts`. Introduce **one** schema (Zod, Valibot, TypeBox) and derive both the TS types and the runtime validator. This is exactly the case schemas exist for.

### 3.3 `custom.formatDate` is declared in the type but never wired up

`types.ts` promises a `custom.formatDate` option; `comparison.ts` hardcodes `toLocaleDateString`. Dead API surface — either remove or implement. Leaving it advertises a feature users will file bugs against.

### 3.4 `NewPostToastPluginContent` vs `NewPostToastGlobalData`

`plugin.ts` sets global data but never returns content from `loadContent`. The `NewPostToastPluginContent` type is exported in `index.ts` but unused. Delete it.

### 3.5 `validatePeerDependencies` runs at **module load**

This fires as soon as Docusaurus imports the plugin, before user config is even read. If a peer is missing, the error message lands far from the code that caused the problem. Move it into the plugin factory.

### 3.6 `postBuild` just logs a banner

```ts
async postBuild({ outDir }) { console.log(...); }
```

This is noise. Docusaurus already logs build completion. Delete.

### 3.7 Global event bus for in-process communication

`window.dispatchEvent(new CustomEvent('new-posts-available', ...))` is the wrong primitive. Within a single React app, pass data via props or context. Window events are for cross-realm or third-party integration.

### 3.8 `tsup.config.ts` exists but the build uses `tsc + node scripts/build.js`

Remove the unused config file — it will absolutely be grepped and "fixed" by someone unfamiliar, with hours lost.

---

## 4. Testing gaps

You have Jest + RTL + Playwright, which is great. Coverage of behaviour is thin:

- **No test** for the client module ↔ React container race described in §1.
- **No test** for the `lastVisit`-written-before-seen bug (§2.1).
- **No test** for malformed post dates (§2.2).
- **No test** for `maxAgeDays` DST boundary.
- **No test** for SSR render output (server-side string contains no toast).
- **No test** for hydration mismatch (server HTML vs first client render).
- **No test** for the storage quota recovery path.
- **No test** for the `startsWith` path collision (`/blog` vs `/blog-archive`).
- **No test** on the CSS module — Playwright could assert `prefers-reduced-motion` respects user settings.
- The `.test.tsx` next to the component pretty much only asserts it renders.

### Teaching point

Tests that exercise modules in isolation catch regressions in those modules; they don't catch _integration_ bugs. The single most useful test for this codebase is one that mounts the full app with a fake `localStorage`, stubbed `usePluginData`, and asserts "given X state, Y toasts render after Z ms, and localStorage ends in state W." That test would have caught every P1 I listed.

---

## 5. Smaller code-quality items

- `// eslint-disable-next-line @typescript-eslint/no-explicit-any` in `plugin.ts` — Docusaurus _does_ type `allContent` (`LoadContext`'s `Props`). Even if not, define your own narrow type rather than `any`.
- `comparison.ts` imports `getDismissedPosts`, so `getNewPosts` is no longer pure — it touches localStorage as a side effect. Pass `dismissedPosts` in; keep the function pure and easier to test.
- `getPluginData` in `client/index.ts` reaches into `window.__DOCUSAURUS__.globalData` manually — Docusaurus exposes helpers for this. Reaching into private fields invites breakage on minor Docusaurus upgrades.
- Stagger via `options.duration + index * 200`: a toast with `duration: 500` and `index: 3` lives 1100ms — that's surprising. Stagger should add a _small_ offset, not ~40% of duration.
- Toast `setTimeout(() => { ... }, 300)` hardcodes the CSS animation duration. If someone tweaks the CSS to `0.5s`, the state updates fire before the animation ends. Drive it from the animation's `onAnimationEnd` event instead.
- `useCallback(handleDismiss, [post.id, storageKey, onDismiss])` — `post.id` and `storageKey` are stable for the life of the toast, so the memo does nothing useful. Not wrong, just noise.
- `initialized` state flag is used to prevent the effect from re-running; using a `useRef` is cheaper and avoids a render.
- `positionClasses` lookup object defined at module scope outside the component — good. But `position` in global data isn't narrowed, so `options.toast.position` is `string`. Type it as the union.
- `src/index.ts` re-exports a lot. Export surface is your contract — every extra export is a thing you can't change without a major version. Prune to the types/functions users genuinely need.

---

## 6. Recommended priority

| #   | Item                                                                                                                 | Severity | Effort |
| --- | -------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| 1   | Collapse the two init pipelines into one                                                                             | P0       | M      |
| 2   | Don't update `lastVisit` before user sees toasts                                                                     | P0       | S      |
| 3   | Validate/handle malformed dates                                                                                      | P1       | S      |
| 4   | SSR / hydration safety in `NewPostToastContainer`                                                                    | P1       | S      |
| 5   | Replace `setDate` arithmetic with ms math                                                                            | P1       | XS     |
| 6   | Unify schema (Zod) — collapse options/validation/types                                                               | P2       | M      |
| 7   | Accessibility: `role`/`aria-live`, reduced motion, Escape key                                                        | P2       | S      |
| 8   | Prune `dismissedPosts` against current manifest                                                                      | P2       | S      |
| 9   | Path boundary matching in `shouldExcludePath`                                                                        | P2       | XS     |
| 10  | Remove dead code (`tsup.config.ts`, `postBuild` log, `NewPostToastPluginContent`, unimplemented `custom.formatDate`) | P3       | XS     |

---

## 7. What this codebase does well

Being fair: the layering is sensible, types are mostly honest, SSR guards exist in storage, dark mode is handled via CSS variables, and validation produces useful field-level messages. The test scaffolding (Jest mocks for `@docusaurus/Link` etc.) is done correctly — most plugins get that wrong. The design doc and the `AGENTS.md`/`CLAUDE.md` files suggest someone is thinking about maintainability. That's a good foundation.

The core issues are all consequences of **one decision**: building client-module and theme-component pathways in parallel instead of choosing. Delete half the code and most of this review goes away.

---

## 8. Lessons for the team

1. **One owner per responsibility.** If you find yourself writing "for backward compatibility" comments inside your own package, stop — delete the old path instead.
2. **Writes are harder than reads.** Any piece of state written in multiple places will eventually disagree. Centralise writes.
3. **Validate at boundaries, trust internally.** Every function defending itself with `typeof x === 'number'` is a symptom of validation happening too late. Validate once at the edge; let the type system carry it from there.
4. **Pure functions test themselves.** `getNewPosts` reaching into localStorage is the reason its tests are awkward. Separate IO from logic.
5. **Integration tests beat unit tests for this kind of bug.** Unit tests pass, feature is broken — that's a test pyramid inverted for your risk profile.
6. **Dead code lies.** `tsup.config.ts`, `custom.formatDate`, `NewPostToastPluginContent` — each one will cost someone an afternoon. Delete aggressively.
