# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SheCare is a React Native 0.83 (React 19, TypeScript) women's-health app: period/cycle tracking, pregnancy mode, daily entries (mood/symptoms/flow/ratings), diary, hydration, nutrition, medication, blog. All data comes from a separate REST backend (not in this repo).

## Commands

```sh
npm start                      # Metro bundler
npm run ios                    # build & run iOS (run `bundle install` once, then `cd ios && bundle exec pod install` after native dep changes)
npm run android                # build & run Android
npm run lint                   # ESLint (@react-native config)
npm test                       # Jest (preset: react-native)
npx jest __tests__/App.test.tsx          # single test file
npx jest -t "renders correctly"          # single test by name
npx tsc --noEmit               # type-check
npx react-native-asset         # re-link fonts after changing src/assets/fonts/ (see react-native.config.js)
```

Prettier: single quotes, trailing commas, `arrowParens: 'avoid'`.

Baseline health (as of 2026-11-11) — don't assume failures are caused by your change:
- `npm test` fails: the only test (`__tests__/App.test.tsx`) imports the whole app, and `jest.config.js` has no `transformIgnorePatterns`/native-module mocks, so Jest chokes on ESM in `@react-navigation/*`. Testing pure modules (e.g. `src/utils/date.ts`) works.
- `npx tsc --noEmit` reports ~11 pre-existing errors (e.g. `OTPVerificationScreen.tsx`, `Hydration.tsx`, `PopupWizardManager.tsx`).
- `npm run lint` reports ~79 pre-existing problems (31 errors). Check only the files you touched.

## Backend / API

- The backend is a separate Django Ninja (ninja_extra + JWT) project at `../../../django/shecare/shecare_be` (from this repo root), using Postgres. Routes are `api_controller` classes in `<app>/apis/v1/controllers.py`, registered in each app's `apis/v1/api.py`. Run its tests with `venv/bin/python manage.py test accounts activities customers general periods pregnancies --noinput` (helpers in `core/testing/api.py`). Its `.gitignore` excludes `**/migrations/*`.
- Backend route paths must match the app's exactly, **including the trailing slash**. A missing slash returns 404, and the app may treat that 404 as "no data". To diff every `APIS` path against the backend's OpenAPI paths, export them with `api.get_openapi_schema()` and compare.
- `BASE_URL` is hard-coded in `src/constants/apis.tsx` as a LAN IP (the backend runs on the dev machine, port 7865). Physical devices/emulators need the machine's IP, not `localhost`.
- All endpoints are defined as path-builder functions under `APIS.v1.<group>.<name>(...)` in `src/constants/apis.tsx`. Add new endpoints there rather than inlining URLs.
- `src/services/ApiClient.ts` exports a singleton `apiClient` (native `fetch`, no Axios) with `get/post/put/patch/delete<T>(endpoint, options)`. Key behaviors:
  - Bearer token is attached automatically from the Zustand store; pass `is_auth: false` for public endpoints.
  - On 401 it silently refreshes via `APIS.v1.auth.refresh()`, queuing concurrent requests behind one refresh; if refresh fails it calls `clearToken()`, which flips navigation back to the login stack.
  - Errors are thrown as `APIError` with `type` (`network|server|cancelled`), `statusCode`, and `normalizedError {title, message}` derived from the backend's `detail`/`title`/`message` shape. Callers commonly treat 404 as "no data" and return `null`.
  - `params` builds the query string; `abortPrevious: true` cancels an in-flight request to the same endpoint; `FormData` bodies drop the JSON content-type.
- See `docs/API_CLIENT_GUIDE.md` and `docs/API_USAGE_EXAMPLES.md` for more (note: docs under `docs/` sometimes reference old paths like `src/utils/ApiClient.tsx` / `src/utils/Navigation.tsx` — these now live in `src/services/`).

## Architecture

- **Entry**: `index.js` → `App.tsx` (wraps in `ToastProvider`) → `RootNavigation` in `src/services/Navigation.tsx`.
- **Navigation** (`src/services/Navigation.tsx`): native stack whose screen set depends on `useStore().isLoggedIn()` (auth stack vs. app stack). Logged-in root is a Drawer containing a bottom-tab navigator; the tab navigator is swapped based on `isPregnant` — `TabNavigator` (cycle mode) vs `SecondaryTabNavigator` (pregnancy mode, using `screens/tabs/secondary/*`). The center "Today" tab is a dummy screen whose button opens the global daily-entry modal via `GlobalModalContext`, using the date from `CalendarDateContext`. Uses a custom `GlassTabBar` (`@callstack/liquid-glass`).
  - Screen names live in `SCREENS` (`src/constants/navigation.tsx`); `RootStackParamList` is derived from it, with params declared in `ScreenParams`. New screens: add to `SCREENS`, export from `src/screens/index.tsx`, register in `Navigation.tsx`.
- **Global state** (`src/store/useStore.tsx`): a single Zustand store persisted to AsyncStorage (`auth-storage`) holding only `token`/`refreshToken`, `isPregnant`, and `isDarkMode` (`undefined` = follow system; read via `useIsDarkMode()` in `src/services/theme.tsx`). Server data is NOT stored globally.
- **Server data pattern**: data fetching is done in custom hooks (`src/hooks/use*.ts`, e.g. `usePeriodData`, `useCalendarMarkers`, `useDailyEntry`) that call `apiClient` and return `{ data, isLoading, error, refetch }`-style objects, or in per-feature service modules colocated with screens (`screens/tabs/dailyEntryService.ts`, `screens/common/diary/service.tsx`, `screens/medication/useMedication.ts`). Response interfaces are declared alongside these.
- **Global providers** in `src/services/`: `UpdateManager` (`useUpdate()` — app update screen), `PopupWizardManager` (`usePopupWizard()` — multi-step popups, see `docs/POPUP_WIZARD_*.md`), `GlobalContext` (daily-entry modal), `CalendarDateContext` (selected date shared across tabs).
- **Dates**: the backend uses `YYYY-MM-DD` local dates. Always use `toLocalDateString` / `parseLocalDate` from `src/utils/date.ts` — never `toISOString()` or `new Date('YYYY-MM-DD')`, which shift the day via UTC.
- **Styling**: colors in `src/constants/colors.tsx` (`THEME_COLORS`), shared spacing/header styles in `STYLE` (`src/constants/app.tsx`). Icons come from a custom Fontello font: `FontelloIcon` in `src/services/FontelloIcons.ts` with a hand-maintained `glyphMap` (font file `src/assets/fonts/fontello.ttf`, source `docs/fontello.svg`) — only glyph names in that map are available.
- **Imports**: `@src/*` alias → `src/*` (configured in both `babel.config.js` and `tsconfig.json`). SVG files import as React components via `react-native-svg-transformer` (`metro.config.js`).
- Reanimated 4 + `react-native-worklets`: the `react-native-reanimated/plugin` must stay last in `babel.config.js`.
- Toasts: use `useToastMessage()` (`showToast`) or `useErrorToast(error)` from `src/utils/toastMessage.tsx` (wraps `react-native-toast-notifications`).
