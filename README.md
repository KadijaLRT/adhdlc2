# ADHD Life Coach

Offline-first, web-first, cross-platform (iOS/Android/Web) executive
function companion, powered by Expo, Expo Router, NativeWind, Zustand,
Supabase, SQLite, and Groq (via the OpenAI-compatible SDK).

## Architecture (restructured for scale)

The guiding rule: **adding a new feature should only ever mean adding new
files, never editing existing ones.**

```
adhd-life-coach/
├── app/                       # Expo Router: routes only, no business logic
├── src/
│   ├── core/                  # cross-cutting engine concerns
│   │   ├── storage/           # TaskRepository interface + sqlite/web impls
│   │   ├── ai/                # AvivaBrain (Groq) + groqSanitizer
│   │   └── supabase/          # client + optional profile sync
│   ├── store/
│   │   ├── slices/            # one small file per domain (task, streak,
│   │   │                      #   milestone, energy, stress, cycle,
│   │   │                      #   wellness, profile, ui, hydration)
│   │   ├── index.ts           # combines all slices into useAppStore
│   │   └── useOnboardingStore.ts  # transient, not persisted
│   ├── features/               # one folder per feature, owns its own UI
│   │   ├── home/ stuck-flow/ gamification/ energy/ wellness/ aviva/
│   ├── content/                 # static reference data (prompts,
│   │                            #   milestone tiers, blood type /
│   │                            #   cannabis reference data, meals)
│   └── shared/
│       └── components/          # ErrorBoundary, etc.
├── supabase/schema.sql
├── public/manifest.json
└── vercel.json / app.json / tailwind.config.js / metro.config.js / tsconfig.json
```

### Why this shape

- **`src/store/slices/`** — each domain (tasks, streaks, milestones,
  energy, stress, cycle tracking, wellness preferences, profile, UI
  state) is its own small file with its own type, default state, and
  actions. `store/index.ts` just combines them. Adding a new domain
  means: write `slices/xSlice.ts`, spread it into `index.ts`, add its
  storage keys to `core/storage`, and (if it should survive a restart)
  add one line to `slices/hydrationSlice.ts`. No existing slice file is
  ever touched.
- **`src/core/storage/`** — the only place that knows about SQLite vs.
  AsyncStorage. Everything else talks to the `TaskRepository` interface.
- **`src/content/`** — renamed from an earlier `src/data/` to avoid
  confusion with the storage layer. This folder is purely static
  reference content (prompt banks, milestone tier definitions, the
  blood-type and cannabis reference tables), never persistence code.
- **`src/features/`** — each feature folder owns its own components.
  `app/` routes stay thin, importing from here.

## Local Setup

```
npm install
cp .env.example .env   # fill in Supabase + Groq values
npm run web             # primary dev target
npm run ios
npm run android
npm run typecheck
npm run lint
```

## Product Notes

- **Zero-guilt by design**: streaks never reset to zero (they freeze),
  milestones only ever unlock, never lock.
- **Account-free by default**: onboarding and all core features work
  fully offline with zero sign-in. Supabase sync is an optional,
  silent-if-absent upgrade layer, not a requirement — see
  `src/core/supabase/client.ts`.
- **Wellness modules are opt-in and clearly labeled**: the blood-type
  meal lens and the cannabis strain explorer are both off by default and
  carry disclaimers directly in the UI, since neither is clinically
  validated science; they're offered as optional wellness lenses only.

## Not Yet Built (known open items)

- Sign-up/sign-in screens (deliberately deferred; app is account-free
  for now, per product decision).
- Multi-agent AI architecture, RPG-style gamification economy (XP/coins/
  avatars), and location/weather-aware notifications were proposed in
  planning documents but intentionally not built yet, each is a
  substantial scope decision that should be scoped and approved on its
  own before implementation.
