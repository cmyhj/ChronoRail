# AGENTS.md

## Overview

ChronoRail is a Chinese-language game version timeline visualizer (React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4 + antd 6). Deployed to GitHub Pages at base path `/ChronoRail/`.

## Commands

- `npm run dev` — dev server at `localhost:5173/ChronoRail/`
- `npm run build` — runs `tsc -b && vite build` (typecheck + bundle)
- `npm run lint` — ESLint (flat config, `.ts`/`.tsx` only)
- No test framework is configured. Verify changes via lint + build.

Always run `npm run lint` then `npm run build` before considering work done.

## Project Structure

- `src/components/{Calendar,Common,Game,Layout,Timeline,Version}/` — UI components
- `src/hooks/` — `useGames`, `useVersions`, `useResponsive`, `useGitHub`
- `src/services/storage.ts` — localStorage persistence (games, versions, GitHub config)
- `src/services/mihoyo.ts` — fetches version data from `public/data/game-versions.json` with 5-min cache
- `src/services/github.ts` — GitHub API sync
- `src/utils/parser.ts` — `GAME_CONFIGS` defines all preset games, `MihoyoGameId` type
- `src/types/index.ts` — all shared TypeScript interfaces
- `src/styles/theme.ts` — color/spacing constants (mostly superseded by CSS vars in `index.css`)
- `scripts/check-versions.js` — CI-only Node script that fetches mihoyo API and writes `public/data/game-versions.json`
- `public/data/game-versions.json` — version data (auto-updated by CI for mihoyo games, manually maintained for others)
- `public/data/chronorail.json` — default game list for presets

## Architecture Notes

- **No router basename config needed** — `BrowserRouter` uses `basename="/ChronoRail"` in `App.tsx:234`. Vite's `base` is set in `vite.config.ts:8`.
- **SPA routing for GitHub Pages** — `public/404.html` handles redirect; matching script in `index.html` restores the URL.
- **Data flow**: user data (games/versions) lives in localStorage via `storage.ts`. Server-side version data lives in `public/data/game-versions.json` and is fetched at runtime by `mihoyo.ts`. These are separate data stores.
- **Adding a new preset game**: update `GAME_CONFIGS` in `src/utils/parser.ts`, add entry in `src/services/mihoyo.ts` `getSupportedGames()`, and add data in `public/data/game-versions.json`.
- **Mihoyo game IDs** (`genshin`, `starrail`, `zzz`) are the only ones with auto-fetch. Other games use `fetchSource: 'manual'`.

## TypeScript Quirks

- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports (e.g. `import type { Game } from './types'`).
- `noUnusedLocals` and `noUnusedParameters` are enforced. The build will fail on unused variables.
- `erasableSyntaxOnly` is enabled — no `enum` declarations (use `as const` objects instead).

## Tailwind CSS

- Tailwind v4 with the `@tailwindcss/vite` plugin (no `tailwind.config.js` — config is in CSS).
- Entry point: `src/index.css` uses `@import "tailwindcss"`.
- Dark theme colors are CSS custom properties defined in `index.css`, not Tailwind theme tokens.

## Data Update

Version data for manual games must be edited in `public/data/game-versions.json`. See `DATA_UPDATE_GUIDE.md` and `VERSION_MANAGEMENT.md` for format rules. Key constraint: `endDate` must come from official announcements, never estimated.

### `current` vs `nextVersion` — Critical Rules

`fetchBanners()` (`mihoyo.ts`) **only** reads banners from `gameData.banners` (current) and `gameData.nextVersion.banners`. It **never** reads banners from `history[]`.

When adding a future version (one that hasn't started yet):

1. **Keep `current` pointing to the version running today** — do NOT change it to the future version.
2. **Put the future version in the `nextVersion` field** (with its banners array).
3. **Do NOT put future versions in `history`** — history is for past/current versions only.
4. When the future version's `startDate` arrives, move it from `nextVersion` → `current` + `history`, and remove `nextVersion`.

Wrong pattern (banners disappear):
```json
"current": { "version": "3.5", "startDate": "2026-07-10", ... },
"banners": [ /* future banners — invisible because date filter hides them */ ]
```

Correct pattern (both current and upcoming banners visible):
```json
"current": { "version": "3.4", "startDate": "2026-06-08", ... },
"banners": [ /* current running banners */ ],
"nextVersion": { "version": "3.5", "startDate": "2026-07-10", ..., "banners": [ /* upcoming */ ] }
```

## UI Language

All user-facing text is Chinese (zh-CN). Component text, toasts, and confirm dialogs use Chinese. Keep new UI strings in Chinese.
