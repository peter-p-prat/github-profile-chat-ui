# GitHub Profile Chat UI

A conversational interface for exploring a GitHub profile and its contribution activity. Built as a take-home challenge for Concourse.

## How to run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## What it does

Desktop: a 35/65 split between the profile panel and the chat. Mobile: a tabbed layout with swipe gestures between panels — swipe left or right to switch tabs for a native-feeling experience.

**Profile panel** — mocked GitHub user with avatar, bio, stats (repos, followers, stars, following), and a full contribution heatmap. Hover any cell to see an exact date and contribution count in a smart tooltip that repositions to stay within the viewport.

**Chat panel** — type any question about the profile and get a contextual mocked response. Responses compute real values from the contribution data (activity in the last 3 months, busiest day of the week, longest streak, weekend contribution rate, etc.). First-time visitors see a set of suggested questions to help them get started. Every assistant response has copy-to-clipboard and retry buttons for a polished chat experience.

## Stack

| Technology             | Why                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| React 19 + TypeScript  | Required by the challenge                                                                                            |
| Vite 6                 | Fastest build tool available, instant HMR                                                                            |
| Tailwind CSS 4         | Utility-first CSS, dark mode without extra config, zero runtime JS                                                   |
| TanStack React Query 5 | Async state management with loading/error/stale states — makes mocked data behave exactly like a real API            |
| React Router 7         | SPA routing, code splitting via `lazy()`                                                                             |
| Zod 3                  | Runtime schema validation, TypeScript types inferred automatically                                                   |
| tw-animate-css         | Pre-built CSS keyframe classes for Tailwind — slide-in, fade-in, bounce, stagger — zero JavaScript animation runtime |

## Key decisions and tradeoffs

**No component library (MUI, shadcn, etc.)** — The challenge evaluates visual polish and attention to detail. Using a component library would hide design decisions. Tailwind + custom components demonstrates visual judgement and CSS fluency.

**CSS Grid for the contribution chart, not a charting library** — The heatmap is a fixed-structure grid (53 columns x 7 rows). A charting library would add bundle weight and require overriding its default styles. A native CSS Grid with 5 data-driven color levels is simpler, faster, and more controllable.

**React Query even with mocked data** — The mock functions use simulated delays (600ms–800ms) to behave like real API calls. React Query handles cache, loading/error states, and stale-time — if a real API were connected, only the fetch functions change. No component changes needed.

**`tw-animate-css` for animations, not Framer Motion** — `tw-animate-css` provides ready-made CSS keyframe classes that compose directly with Tailwind utilities. The bundle stays small (pure CSS, zero runtime JS) and every animation in the app — slide-in messages, fade-in bubbles, staggered typing indicator dots, tab sliding indicator — is an utility class, not imperative JavaScript.

**Type-first folder structure, not feature-first** — The project has one domain (GitHub profile + chat). Feature-first would create folders with 2–3 files each. Type-first (`api/`, `hooks/`, `components/`) is simpler to navigate at this scale.

**Testing: integration-first, following Kent C. Dodds** — Tests assert on visible output and user-facing behavior, not implementation details. API functions are mocked with `vi.spyOn()` at the module boundary — never at the network level, never at the hook level when the hook's own logic is under test. Hooks that use React Query get a real `QueryClient` configured for tests (`retry: false`). Unit tests exist only where pure logic is complex enough to warrant isolation.

**Dark mode via `useTheme` hook** — Persists the user's choice in `localStorage` and falls back to `prefers-color-scheme` on first load. State is managed with `useSyncExternalStore` so any component can subscribe without prop drilling. CSS custom properties in `:root` drive all theme tokens.

## What I would improve with more time

- **Mobile tooltip auto-close** — The contribution chart tooltip on mobile stays open after tapping; it should dismiss automatically when the user taps elsewhere or scrolls.
- **Component atomization** — Some components (e.g., `MobileTabNav`) bundle multiple responsibilities. Splitting them into smaller single-responsibility units would improve testability and reuse.
- **Separate MessageBubble variants** — Currently one component handles both user and assistant bubbles via conditional branches. Dedicated `UserBubble` and `AssistantBubble` components would be cleaner and easier to extend independently.
- **Error state mocking and UX/UI handling** — The app has no mocked API error states. Adding failure scenarios (network error, profile not found) with graceful UI feedback (error messages, retry actions) would complete the resilience story.
- **Real GitHub API integration** — Replace mock functions with actual GitHub API calls (public profiles + the contribution data via scraping or a proxy, since GitHub doesn't expose it in the REST API). The architecture is designed for this: only `src/api/github.ts` would change.
- **More sophisticated chat responses** — Current responses use keyword matching. A real AI integration (Claude API with tool use) could answer arbitrary questions about the profile with genuine reasoning.
- **Virtualization for the message list** — Not needed for this scale, but for long conversations `react-virtual` would prevent DOM bloat.
- **Internationalization** — date formatting is currently hardcoded to English locale.
- **E2E tests** — Playwright tests for the core interaction flow (send message → typing indicator → response).
- **Accessibility audit** — ARIA labels for the contribution chart cells, screen reader announcements for new messages
