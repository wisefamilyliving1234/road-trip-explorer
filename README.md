# Wise Family Living Road Trip Explorer

A premium, mobile-first Progressive Web App for planning, tracking, and preserving a family road trip — trip setup, daily driving log, lodging/stops, adventure funds, a 50-state Learn section, a photo-rich travel journal, an offline-ready travel toolbox, and local-wisdom recommendations.

This project was converted from a single-file HTML prototype into a production-ready, multi-file static site with **zero functionality removed, no UI redesign, and the same Wise Family Living branding.**

---

## 1. The one thing you need to know before anything else

The original prototype depended on a **proprietary, platform-only backend** (`window.dataSdk`, loaded from private `/_sdk/...` script paths) that only exists inside the no-code tool the prototype was originally built in. That backend does not exist anywhere else — it would 404 on Cloudflare Pages, GitHub Pages, or any other host.

**`js/storage.js` replaces it** with a real, self-contained data layer backed by `localStorage`, using the *exact same call signature* the rest of the app already used:

```js
window.dataSdk.init(handler);              // -> handler.onDataChanged(records)
await window.dataSdk.create(record);        // -> { isOk: true/false }
await window.dataSdk.update(record);        // -> { isOk: true/false }
await window.dataSdk.delete(record);        // -> { isOk: true/false }
```

Because the signature is identical, **none of the feature code changed** — `budget.js`, `journal.js`, `campground.js`, `learn.js`, `local.js`, and `checklist.js` all call `window.dataSdk` exactly as before. This is also what makes the app genuinely usable **offline**: saving a trip, a journal entry, or a photo never touches the network.

The three other proprietary includes (`telemetry_sdk.js`, `resizing_sdk.js`, `editing_sdk.js`) and the platform's bootstrap snippet were removed — they were internal tooling for the original builder, not application functionality. The Lucide icon script was also removed, since the app is entirely emoji-icon driven and no `data-lucide` attributes exist anywhere in the markup — it was dead weight.

---

## 2. Project structure

```
road-trip-explorer/
│
├── index.html              Single-page app shell (all tabs/screens)
├── css/
│   ├── styles.css          App-specific styles (used today, in production)
│   └── input.css           Tailwind CLI source for the OPTIONAL future build (see §5)
├── js/
│   ├── storage.js           Real localStorage-backed data layer (replaces the old dataSdk)
│   ├── utilities.js          Shared state (allData, tripSetup) + showStatus() + shared state-list dropdowns
│   ├── budget.js              Adventure Funds tab
│   ├── journal.js             Travel Memories tab (stories, multi-photo galleries w/ cover photos, people, would-return)
│   ├── campground.js          Trip Stops tab (lodging/campground reservations)
│   ├── learn.js                Learn tab (50-state explorer, learnData object)
│   ├── local.js                 Local tab (tips, resources, transportation, food)
│   ├── checklist.js              Travel Toolbox tab (emergency info, checklists, Quick Find, conditions, tips)
│   ├── maps.js                    Map tab ("Today's Drive" mileage tracking)
│   └── app.js                      Tab switching, Adventure (Trip Setup) tab, and the app bootstrap
├── manifest.json            PWA manifest
├── service-worker.js        Offline caching (app shell + stale-while-revalidate for CDN assets)
├── icons/                   App icons (192, 512, and a maskable 512 variant)
├── images/                  (reserved for future use — currently empty)
├── assets/                  (reserved for future use — currently empty)
├── _headers                 Cloudflare Pages cache-control rules
├── package.json              Optional local dev server + future Tailwind build script
├── tailwind.config.js
├── .gitignore
└── README.md                 This file
```

### Why plain `<script src="...">` files instead of ES modules or a bundler?

So the project can be deployed **as-is**, with zero build step, to Cloudflare Pages (or any static host) the moment you upload it. Every module attaches its functions to the shared global scope, exactly like the original single-file prototype did — just split into logically named files instead of one 950-line blob.

**Load order matters.** `index.html` loads the files in this exact order, and `app.js` is deliberately loaded *last*, because its bootstrap code (`window.dataSdk.init(...)`) references functions defined in every other module (`renderJournalTimeline`, `renderTripStops`, `loadEmergencyInfo`, `renderLocalTips`, etc.). If you add a new script file, keep it **before** `app.js`.

---

## 3. Running locally

No build step is required — this is a static site.

```bash
# Option A: no installs needed, any static file server works, e.g.:
npx serve .

# Option B: using the provided npm script
npm install
npm run dev
```

Then open the printed local URL. The service worker only activates over HTTPS or `localhost`, so local development still gets full offline testing.

---

## 4. Deploying to Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, create a new project from that repository.
3. **Build command:** none / leave blank.
4. **Build output directory:** `/` (the repository root — this is a static site with no build step).
5. Deploy.

The included `_headers` file is a Cloudflare Pages convention picked up automatically — it sets long-lived caching for `css/`, `js/`, and `icons/`, while `index.html`, `manifest.json`, and `service-worker.js` are always revalidated so app updates reach users promptly.

`package.json` also includes an optional `npm run deploy` script using Wrangler, for teams who prefer deploying from the command line instead of the Cloudflare dashboard.

---

## 5. Known limitations & recommended next steps

Being direct about what's still a prototype-era shortcut, so it doesn't surprise anyone later:

- **Tailwind is still loaded from its CDN** (`cdn.tailwindcss.com`), exactly as the original did. Tailwind's own docs say this CDN build is meant for prototyping, not production — it compiles in the browser on every load, ships more CSS than needed, and can't be reliably cached for offline use. `tailwind.config.js` and `css/input.css` are already scaffolded so a real production build is one command away:
  ```bash
  npm install
  npm run build:css   # outputs css/styles.compiled.css
  ```
  Switching to it requires two manual edits to `index.html`: remove the `<script src="https://cdn.tailwindcss.com/...">` tag and add `<link rel="stylesheet" href="css/styles.compiled.css">`. This was left as a deliberate, explicit next step rather than something silently changed, since it could not be executed and verified in this environment (no package registry access here).
- **Google Fonts** (`fonts.googleapis.com`) is likewise still loaded from Google's CDN. The service worker will cache it after the first successful load (stale-while-revalidate), so offline use works after that — but self-hosting the font file would remove the external dependency entirely.
- **Data storage uses `localStorage`**, which is simple, synchronous, and has a per-origin size ceiling (typically 5-10MB depending on browser). Since journal photos are stored as compressed base64 images, a family that adds hundreds of photos could approach that ceiling. `js/storage.js` documents this and is written so a future migration to IndexedDB (much larger quota, asynchronous) would only require changing that one file — every other module calls `window.dataSdk` the same way regardless of what backs it.
- **App icons** (`icons/icon-*.png`) are simple, on-brand placeholder artwork (forest-green mountains, a gold sun accent, a road) generated for this conversion — not final designed brand assets. Swap them for real logo artwork before a public launch; keep the same filenames and sizes and nothing else needs to change.
- **No automated test suite ships in this folder.** Every feature was manually verified end-to-end during the conversion (see commit/conversation history), including a full simulated load of every module in the real script order, but there isn't a `tests/` folder here yet. Recommended next step for a team continuing this project: adopt Playwright for a handful of critical-path browser tests (create a trip, add a stop, save a journal entry with a photo, confirm offline reload).

---

## 6. Feature parity checklist

Every tab and feature from the original prototype is preserved exactly:

- ✅ Adventure (Trip Setup): trip details, 7 transportation types with their own detail forms, save/reload
- ✅ Map: daily drive log, morning/evening state & weather, automatic mileage calculation
- ✅ Stops: lodging/campground reservations, payment status, add/expand/delete
- ✅ Funds: 5 savings categories, payday calculator, progress illustration, deposits
- ✅ Learn: 50-state dropdown, 16 topics, extensible `learnData` content structure
- ✅ Journal: daily stories, multi-photo galleries per category with user-chosen cover photos, "Who Shared Today," "Would You Come Back Here," star ratings, Trip Book summary, final reflection
- ✅ Toolbox: emergency info, 4 checklists, Quick Find (29 categories), travel conditions, tips
- ✅ Local: questions to ask a local, saved tips, trusted resources, transportation info, food finds, "From Our Travels"

---

Built for the Wise Family Living brand. 🌲
