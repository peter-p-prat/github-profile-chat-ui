# GitHub Profile Chat UI

A conversational interface for exploring a GitHub profile and its contribution activity. Built as a take-home challenge for Concourse.

## How to run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## What it does

Two-panel layout:

- **Profile panel** — mocked GitHub user profile with avatar, bio, stats, and a contribution heatmap (the green grid GitHub shows on profile pages)
- **Chat panel** — conversational interface where you can ask questions about the profile and contribution data. Responses are mocked but contextual — they compute actual values from the mock data (activity in the last 3 months, busiest day of the week, longest streak, weekend contributions, etc.)

## Stack

| Technology | Why |
|---|---|
| React 19 + TypeScript | Required by the challenge |
| Vite 8 | Fastest build tool available, instant HMR |
| Tailwind CSS 4 | Utility-first CSS, dark mode without extra config, zero runtime JS |
| TanStack React Query 5 | Async state management with loading/error/stale states — makes mocked data behave exactly like a real API |
| React Router 7 | SPA routing, code splitting via `lazy()` |
| Zod 4 | Runtime schema validation, TypeScript types inferred automatically |
| React Compiler | Automatic memoization, no manual `useMemo`/`useCallback` |

## Key decisions and tradeoffs

**No component library (MUI, shadcn, etc.)** — The challenge evaluates visual polish and attention to detail. Using a component library would hide design decisions. Tailwind + custom components demonstrates visual judgement and CSS fluency.

**CSS Grid for the contribution chart, not a charting library** — The heatmap is a fixed-structure grid (53 columns x 7 rows). A charting library would add bundle weight and require overriding its default styles. A native CSS Grid with 5 data-driven color levels is simpler, faster, and more controllable.

**React Query even with mocked data** — The mock functions use simulated delays (600ms–800ms) to behave like real API calls. React Query handles cache, loading/error states, and stale-time — if a real API were connected, only the fetch functions change. No component changes needed.

**CSS keyframes for animations, not Framer Motion** — Keeps the bundle small. The animations needed (slide-in, fade-in, bounce, stagger) are straightforward to express in CSS without a library.

**Type-first folder structure, not feature-first** — The project has one domain (GitHub profile + chat). Feature-first would create folders with 2–3 files each. Type-first (`api/`, `hooks/`, `components/`) is simpler to navigate at this scale.

**Dark mode via `prefers-color-scheme`** — Respects the user's OS preference without JavaScript. CSS variables in `:root` override automatically in `@media (prefers-color-scheme: dark)`.

## What I would improve with more time

- **Real GitHub API integration** — Replace mock functions with actual GitHub API calls (public profiles + the contribution data via scraping or a proxy, since GitHub doesn't expose it in the REST API). The architecture is designed for this: only `src/api/github.ts` would change.
- **More sophisticated chat responses** — Current responses use keyword matching. A real AI integration (Claude API with tool use) could answer arbitrary questions about the profile with genuine reasoning.
- **Contribution chart month labels** — Currently approximated. With more time, I would compute exact column positions for each month label based on the actual dates in the data.
- **Virtualization for the message list** — Not needed for this scale, but for long conversations `react-virtual` would prevent DOM bloat.
- **Internationalization** — date formatting is currently hardcoded to English locale.
- **E2E tests** — Playwright tests for the core interaction flow (send message → typing indicator → response).
- **Accessibility audit** — ARIA labels for the contribution chart cells, screen reader announcements for new messages.
