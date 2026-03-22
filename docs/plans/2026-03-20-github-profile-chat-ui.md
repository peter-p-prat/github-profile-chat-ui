# GitHub Profile Chat UI — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished two-panel GitHub Profile Chat UI — contribution heatmap on the left, conversational chat on the right — with fully mocked data, skeleton loading, animations, and dark mode.

**Architecture:** Type-first folder structure (`api/ → hooks/ → components/`). Zod schemas are the single source of truth for types (never hand-write interfaces). React Query manages async state even over mock data — simulates real API behavior (cache, staleTime, loading/error states). CSS variables + Tailwind v4 handle theming; `prefers-color-scheme` dark mode requires zero JavaScript.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`), TanStack React Query 5, React Router 7, Zod 3, Vitest 2, @testing-library/react 16

---

## Stage 0 — Project Setup

### Task 0.1: Scaffold + Vitest Configuration

**Files:**

- Create: `package.json` (full replacement)
- Create: `vite.config.ts`
- Create: `tsconfig.app.json` (add vitest types)
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Delete: `src/App.css`, `src/assets/react.svg`, contents of `src/App.tsx`

**Step 1: Scaffold the project**

```bash
npm create vite@latest . -- --template react-ts
```

Expected:

```
Scaffolding project in /path/to/github-profile-chat-ui...
Done.
```

**Step 2: Replace `package.json` with the full dependency set**

```json
{
  "name": "github-profile-chat-ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.62.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

**Step 3: Replace `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**Step 4: Add vitest types to `tsconfig.app.json`**

In the `compilerOptions` object add `"types": ["vitest/globals"]`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

**Step 5: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

**Step 6: Install dependencies**

```bash
npm install
```

Expected: no errors, `node_modules/` populated.

**Step 7: Write the smoke test**

Create `src/test/smoke.test.ts`:

```ts
describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Step 8: Run test to verify it passes**

```bash
npm test
```

Expected:

```
 PASS  src/test/smoke.test.ts
  smoke
    ✓ runs (1 ms)

Test Files  1 passed (1)
Tests       1 passed (1)
```

**Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: `http://localhost:5173/` opens in browser with no console errors.

**Step 10: Clean scaffold**

- Delete `src/App.css`
- Delete `src/assets/react.svg`
- Replace `src/App.tsx` with an empty export:

```tsx
export default function App() {
  return null
}
```

**Step 11: Commit**

`feat(setup): scaffold project with Vite, React 19, Vitest, and Tailwind v4`

---

## Stage 1 — Zod Schemas and Mock Data

### Task 1.1: Schemas and Types

**Files:**

- Create: `src/api/github.schemas.ts`
- Create: `src/api/github.types.ts`
- Create: `src/api/github.schemas.test.ts`

**Step 1: Write the failing tests**

Create `src/api/github.schemas.test.ts`:

```ts
import { GithubProfileSchema, ContributionDaySchema, ContributionsSchema } from './github.schemas'

describe('GithubProfileSchema', () => {
  it('parses a valid profile', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://github.com/images/octocat.png',
      bio: 'A misterious cat.',
      publicRepos: 8,
      followers: 9000,
      following: 9,
    })
    expect(result.success).toBe(true)
  })

  it('accepts null bio', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'ghost',
      name: 'Ghost',
      avatarUrl: 'https://github.com/images/ghost.png',
      bio: null,
      publicRepos: 0,
      followers: 0,
      following: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid avatar URL', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'bad',
      name: 'Bad',
      avatarUrl: 'not-a-url',
      bio: null,
      publicRepos: 0,
      followers: 0,
      following: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative publicRepos', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'x',
      name: 'X',
      avatarUrl: 'https://example.com/a.png',
      bio: null,
      publicRepos: -1,
      followers: 0,
      following: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('ContributionDaySchema', () => {
  it('accepts all levels 0 through 4', () => {
    for (const level of [0, 1, 2, 3, 4] as const) {
      const result = ContributionDaySchema.safeParse({ date: '2024-03-15', count: level * 3, level })
      expect(result.success).toBe(true)
    }
  })

  it('rejects level 5', () => {
    const result = ContributionDaySchema.safeParse({ date: '2024-03-15', count: 0, level: 5 })
    expect(result.success).toBe(false)
  })
})

describe('ContributionsSchema', () => {
  it('parses an array of contribution days', () => {
    const days = Array.from({ length: 365 }, (_, i) => ({
      date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      count: i % 10,
      level: (i % 5) as 0 | 1 | 2 | 3 | 4,
    }))
    const result = ContributionsSchema.safeParse(days)
    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/api/github.schemas.test.ts
```

Expected:

```
FAIL  src/api/github.schemas.test.ts
  × Cannot find module './github.schemas'
```

**Step 3: Write the implementation**

Create `src/api/github.schemas.ts`:

```ts
import { z } from 'zod'

export const GithubProfileSchema = z.object({
  login: z.string(),
  name: z.string(),
  avatarUrl: z.string().url(),
  bio: z.string().nullable(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
})

export const ContributionDaySchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
})

export const ContributionsSchema = z.array(ContributionDaySchema)
```

Create `src/api/github.types.ts`:

```ts
import { z } from 'zod'
import { GithubProfileSchema, ContributionDaySchema, ContributionsSchema } from './github.schemas'

export type GithubProfile = z.infer<typeof GithubProfileSchema>
export type ContributionDay = z.infer<typeof ContributionDaySchema>
export type Contributions = z.infer<typeof ContributionsSchema>
```

**Step 4: Run test to verify it passes**

```bash
npm test src/api/github.schemas.test.ts
```

Expected:

```
 PASS  src/api/github.schemas.test.ts
  GithubProfileSchema
    ✓ parses a valid profile
    ✓ accepts null bio
    ✓ rejects an invalid avatar URL
    ✓ rejects negative publicRepos
  ContributionDaySchema
    ✓ accepts all levels 0 through 4
    ✓ rejects level 5
  ContributionsSchema
    ✓ parses an array of contribution days
```

**Step 5: Commit**

`feat(api): add Zod schemas for GithubProfile and ContributionDay`

---

### Task 1.2: Mock Data and Fetch Functions

**Files:**

- Create: `src/api/github.keys.ts`
- Create: `src/api/github.ts`
- Create: `src/api/github.test.ts`

**Step 1: Write the failing tests**

Create `src/api/github.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchProfile, fetchContributions } from './github'
import { GithubProfileSchema, ContributionsSchema } from './github.schemas'

describe('fetchProfile', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('resolves with schema-valid data', async () => {
    const promise = fetchProfile()
    vi.runAllTimers()
    const data = await promise
    const result = GithubProfileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('fetchContributions', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('resolves with 364–365 days', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    expect(data.length).toBeGreaterThanOrEqual(364)
    expect(data.length).toBeLessThanOrEqual(365)
  })

  it('all days have level in range 0–4', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    const allValid = data.every(d => d.level >= 0 && d.level <= 4)
    expect(allValid).toBe(true)
  })

  it('resolves with schema-valid data', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    const result = ContributionsSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/api/github.test.ts
```

Expected:

```
FAIL  src/api/github.test.ts
  × Cannot find module './github'
```

**Step 3: Write the implementation**

Create `src/api/github.keys.ts`:

```ts
export const githubKeys = {
  all: ['github'] as const,
  profile: () => [...githubKeys.all, 'profile'] as const,
  contributions: () => [...githubKeys.all, 'contributions'] as const,
}
```

Create `src/api/github.ts`:

```ts
import { GithubProfile, ContributionDay, Contributions } from './github.types'
import { GithubProfileSchema, ContributionsSchema } from './github.schemas'

const MOCK_PROFILE: GithubProfile = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
  bio: 'Building the tools that build the future.',
  publicRepos: 8,
  followers: 14800,
  following: 9,
}

function buildContributions(): ContributionDay[] {
  const days: ContributionDay[] = []
  const end = new Date('2025-03-20')
  const start = new Date(end)
  start.setDate(start.getDate() - 364)

  // Seeded pseudo-random to keep data deterministic across reloads
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return Math.abs(seed) / 0xffffffff
  }

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const activityChance = isWeekend ? 0.35 : 0.75
    const count = rand() < activityChance ? Math.floor(rand() * 14) + 1 : 0
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4
    days.push({ date: d.toISOString().split('T')[0], count, level })
  }

  return days
}

const MOCK_CONTRIBUTIONS = buildContributions()

export async function fetchProfile(): Promise<GithubProfile> {
  await new Promise(resolve => setTimeout(resolve, 800))
  return GithubProfileSchema.parse(MOCK_PROFILE)
}

export async function fetchContributions(): Promise<Contributions> {
  await new Promise(resolve => setTimeout(resolve, 600))
  return ContributionsSchema.parse(MOCK_CONTRIBUTIONS)
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/api/github.test.ts
```

Expected:

```
 PASS  src/api/github.test.ts
  fetchProfile
    ✓ resolves with schema-valid data
  fetchContributions
    ✓ resolves with 364–365 days
    ✓ all days have level in range 0–4
    ✓ resolves with schema-valid data
```

**Step 5: Commit**

`feat(api): add mock fetch functions for profile and contributions`

---

### Task 1.3: Chat Response Simulator

**Files:**

- Create: `src/api/chat.ts`
- Create: `src/api/chat.test.ts`

**Step 1: Write the failing tests**

Create `src/api/chat.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { simulateResponse } from './chat'
import { ContributionDay } from './github.types'

// Deterministic contributions: Mon–Fri active, Sat–Sun quiet
const CONTRIBUTIONS: ContributionDay[] = Array.from({ length: 365 }, (_, i) => {
  const date = new Date('2024-03-20')
  date.setDate(date.getDate() - (364 - i))
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const count = isWeekend ? 0 : (i % 5) + 1
  const level: 0 | 1 | 2 | 3 | 4 =
    count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4
  return { date: date.toISOString().split('T')[0], count, level }
})

describe('simulateResponse', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns a non-empty string for any input', async () => {
    const promise = simulateResponse('hello', CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns string containing a day name for "busiest day" query', async () => {
    const promise = simulateResponse('What is their busiest day of the week?', CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result).toMatch(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i)
  })

  it('returns string containing "weekend" for weekend query', async () => {
    const promise = simulateResponse('Do they contribute on weekends?', CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result.toLowerCase()).toContain('weekend')
  })

  it('returns string containing "streak" for streak query', async () => {
    const promise = simulateResponse('What is their longest streak?', CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result.toLowerCase()).toContain('streak')
  })

  it('returns fallback string for unrecognized query', async () => {
    const promise = simulateResponse('xyzzy', CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result.length).toBeGreaterThan(20)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/api/chat.test.ts
```

Expected:

```
FAIL  src/api/chat.test.ts
  × Cannot find module './chat'
```

**Step 3: Write the implementation**

Create `src/api/chat.ts`:

```ts
import { Contributions } from './github.types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function simulateResponse(
  question: string,
  contributions: Contributions,
): Promise<string> {
  const delay = 1200 + Math.random() * 800
  await new Promise(resolve => setTimeout(resolve, delay))

  const q = question.toLowerCase()

  if (q.includes('active') || q.includes('last 3 months') || q.includes('recent')) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const recent = contributions.filter(d => new Date(d.date) >= cutoff)
    const total = recent.reduce((sum, d) => sum + d.count, 0)
    const activeDays = recent.filter(d => d.count > 0).length
    const avg = (total / 90).toFixed(1)
    const intensity = total > 200 ? 'very active' : total > 100 ? 'moderately active' : 'relatively quiet'
    return `In the last 90 days, this developer made ${total} contributions across ${activeDays} active days — that's ${avg} per day on average. Overall: ${intensity}.`
  }

  if (q.includes('busiest') || q.includes('day of the week')) {
    const byDay = [0, 0, 0, 0, 0, 0, 0]
    contributions.forEach(d => {
      byDay[new Date(d.date).getDay()] += d.count
    })
    const maxCount = Math.max(...byDay)
    const busiestDay = DAY_NAMES[byDay.indexOf(maxCount)]
    return `${busiestDay} is their busiest day of the week with ${maxCount} total contributions over the past year.`
  }

  if (q.includes('weekend')) {
    const weekendTotal = contributions
      .filter(d => {
        const day = new Date(d.date).getDay()
        return day === 0 || day === 6
      })
      .reduce((sum, d) => sum + d.count, 0)
    const total = contributions.reduce((sum, d) => sum + d.count, 0)
    const pct = total > 0 ? ((weekendTotal / total) * 100).toFixed(1) : '0'
    const verdict = parseFloat(pct) > 20 ? 'They clearly code on weekends!' : 'They mostly stick to weekdays.'
    return `Weekend contributions account for ${pct}% of all activity (${weekendTotal} total). ${verdict}`
  }

  if (q.includes('streak')) {
    let maxStreak = 0
    let current = 0
    for (const day of contributions) {
      if (day.count > 0) {
        current++
        maxStreak = Math.max(maxStreak, current)
      } else {
        current = 0
      }
    }
    const comment =
      maxStreak > 30 ? 'Impressive dedication!' : maxStreak > 14 ? 'A solid two-week run.' : 'Short but consistent bursts.'
    return `Their longest streak is ${maxStreak} consecutive days with at least one contribution. ${comment}`
  }

  // Fallback
  const total = contributions.reduce((sum, d) => sum + d.count, 0)
  const activeDays = contributions.filter(d => d.count > 0).length
  return `Over the past year, this developer made ${total} contributions across ${activeDays} active days. Try asking about their busiest day, weekend activity, recent months, or longest streak!`
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/api/chat.test.ts
```

Expected:

```
 PASS  src/api/chat.test.ts
  simulateResponse
    ✓ returns a non-empty string for any input
    ✓ returns string containing a day name for "busiest day" query
    ✓ returns string containing "weekend" for weekend query
    ✓ returns string containing "streak" for streak query
    ✓ returns fallback string for unrecognized query
```

**Step 5: Commit**

`feat(api): add chat response simulator with keyword-based contextual replies`

---

## Stage 2 — React Infrastructure

### Task 2.1: Query Client

**Files:**

- Create: `src/lib/queryClient.ts`

No test needed — this is a configuration singleton. The hooks that use it are tested in Task 2.2.

**Step 1: Write the implementation**

Create `src/lib/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})
```

**Step 2: Commit**

`feat(lib): add singleton QueryClient with staleTime and retry config`

---

### Task 2.2: Data Fetching Hooks

**Files:**

- Create: `src/hooks/useGithubProfile.ts`
- Create: `src/hooks/useContributions.ts`
- Create: `src/hooks/useGithubProfile.test.tsx`
- Create: `src/hooks/useContributions.test.tsx`
- Create: `src/test/queryWrapper.tsx`

**Step 1: Write the test wrapper helper**

Create `src/test/queryWrapper.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
```

**Step 2: Write the failing tests**

Create `src/hooks/useGithubProfile.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useGithubProfile } from './useGithubProfile'
import * as githubApi from '../api/github'
import { createQueryWrapper } from '../test/queryWrapper'

const MOCK_PROFILE = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Hello world',
  publicRepos: 8,
  followers: 100,
  following: 5,
}

describe('useGithubProfile', () => {
  it('returns isLoading true initially', () => {
    vi.spyOn(githubApi, 'fetchProfile').mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useGithubProfile(), { wrapper: createQueryWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('returns data after the fetch resolves', async () => {
    vi.spyOn(githubApi, 'fetchProfile').mockResolvedValue(MOCK_PROFILE)
    const { result } = renderHook(() => useGithubProfile(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_PROFILE)
  })
})
```

Create `src/hooks/useContributions.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useContributions } from './useContributions'
import * as githubApi from '../api/github'
import { createQueryWrapper } from '../test/queryWrapper'

const MOCK_CONTRIBUTIONS = [
  { date: '2024-03-15', count: 5, level: 2 as const },
  { date: '2024-03-16', count: 0, level: 0 as const },
]

describe('useContributions', () => {
  it('returns isLoading true initially', () => {
    vi.spyOn(githubApi, 'fetchContributions').mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useContributions(), { wrapper: createQueryWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('returns data after the fetch resolves', async () => {
    vi.spyOn(githubApi, 'fetchContributions').mockResolvedValue(MOCK_CONTRIBUTIONS)
    const { result } = renderHook(() => useContributions(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_CONTRIBUTIONS)
  })
})
```

**Step 3: Run tests to verify they fail**

```bash
npm test src/hooks/useGithubProfile.test.tsx src/hooks/useContributions.test.tsx
```

Expected:

```
FAIL  src/hooks/useGithubProfile.test.tsx
  × Cannot find module './useGithubProfile'
FAIL  src/hooks/useContributions.test.tsx
  × Cannot find module './useContributions'
```

**Step 4: Write the implementations**

Create `src/hooks/useGithubProfile.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchProfile } from '../api/github'
import { githubKeys } from '../api/github.keys'

export function useGithubProfile() {
  return useQuery({
    queryKey: githubKeys.profile(),
    queryFn: fetchProfile,
  })
}
```

Create `src/hooks/useContributions.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchContributions } from '../api/github'
import { githubKeys } from '../api/github.keys'

export function useContributions() {
  return useQuery({
    queryKey: githubKeys.contributions(),
    queryFn: fetchContributions,
  })
}
```

**Step 5: Run tests to verify they pass**

```bash
npm test src/hooks/useGithubProfile.test.tsx src/hooks/useContributions.test.tsx
```

Expected:

```
 PASS  src/hooks/useGithubProfile.test.tsx
  useGithubProfile
    ✓ returns isLoading true initially
    ✓ returns data after the fetch resolves
 PASS  src/hooks/useContributions.test.tsx
  useContributions
    ✓ returns isLoading true initially
    ✓ returns data after the fetch resolves
```

**Step 6: Commit**

`feat(hooks): add useGithubProfile and useContributions React Query hooks`

---

### Task 2.3: Chat State Hook

**Files:**

- Create: `src/hooks/useChat.ts`
- Create: `src/hooks/useChat.test.tsx`

**Step 1: Write the failing tests**

Create `src/hooks/useChat.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useChat } from './useChat'
import * as chatApi from '../api/chat'

const NO_CONTRIBUTIONS = [] as const

describe('useChat', () => {
  it('starts with empty messages and isTyping false', () => {
    const { result } = renderHook(() => useChat([]))
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.isTyping).toBe(false)
  })

  it('adds user message immediately on sendMessage', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockResolvedValue('Hello back')
    const { result } = renderHook(() => useChat([]))
    act(() => { result.current.sendMessage('Hi there') })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({ role: 'user', content: 'Hi there' })
  })

  it('sets isTyping to true while waiting for response', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useChat([]))
    act(() => { result.current.sendMessage('Hello') })
    expect(result.current.isTyping).toBe(true)
  })

  it('appends assistant message and clears isTyping after resolve', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockResolvedValue('Got it!')
    const { result } = renderHook(() => useChat([]))
    await act(async () => { result.current.sendMessage('Hello') })
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toMatchObject({ role: 'assistant', content: 'Got it!' })
    expect(result.current.isTyping).toBe(false)
  })

  it('ignores empty or whitespace-only input', async () => {
    const spy = vi.spyOn(chatApi, 'simulateResponse')
    const { result } = renderHook(() => useChat([]))
    await act(async () => { result.current.sendMessage('   ') })
    expect(result.current.messages).toHaveLength(0)
    expect(spy).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/hooks/useChat.test.tsx
```

Expected:

```
FAIL  src/hooks/useChat.test.tsx
  × Cannot find module './useChat'
```

**Step 3: Write the implementation**

Create `src/hooks/useChat.ts`:

```ts
import { useState, useCallback } from 'react'
import { simulateResponse } from '../api/chat'
import { Contributions } from '../api/github.types'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function useChat(contributions: Contributions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMsg])
      setIsTyping(true)

      try {
        const response = await simulateResponse(content, contributions)
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMsg])
      } finally {
        setIsTyping(false)
      }
    },
    [contributions],
  )

  return { messages, isTyping, sendMessage }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/hooks/useChat.test.tsx
```

Expected:

```
 PASS  src/hooks/useChat.test.tsx
  useChat
    ✓ starts with empty messages and isTyping false
    ✓ adds user message immediately on sendMessage
    ✓ sets isTyping to true while waiting for response
    ✓ appends assistant message and clears isTyping after resolve
    ✓ ignores empty or whitespace-only input
```

**Step 5: Commit**

`feat(hooks): add useChat hook with message state and async send flow`

---

### Task 2.4: CSS Variables, Dark Mode, and Keyframes

**Files:**

- Modify: `src/index.css`

No automated test. Verify visually via dev server.

**Step 1: Replace `src/index.css`**

```css
@import "tailwindcss";

/* ─── Theme tokens ─────────────────────────────────────────── */
:root {
  --color-bg: #ffffff;
  --color-surface: #f6f8fa;
  --color-surface-2: #eaeef2;
  --color-border: #d0d7de;
  --color-text: #1f2328;
  --color-text-muted: #656d76;
  --color-accent: #1f883d;
  --color-accent-hover: #1a7f37;

  /* Contribution chart levels — light mode */
  --level-0: #ebedf0;
  --level-1: #9be9a8;
  --level-2: #40c463;
  --level-3: #30a14e;
  --level-4: #216e39;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0d1117;
    --color-surface: #161b22;
    --color-surface-2: #21262d;
    --color-border: #30363d;
    --color-text: #e6edf3;
    --color-text-muted: #8b949e;
    --color-accent: #3fb950;
    --color-accent-hover: #56d364;

    /* Contribution chart levels — dark mode */
    --level-0: #161b22;
    --level-1: #0e4429;
    --level-2: #006d32;
    --level-3: #26a641;
    --level-4: #39d353;
  }
}

/* ─── Base ──────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* ─── Keyframes ─────────────────────────────────────────────── */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%            { transform: translateY(-5px); }
}

/* ─── Animation utility classes ─────────────────────────────── */
.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out both;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out both;
}

.animate-bounce-dot {
  animation: bounce 1.2s ease-in-out infinite;
}
```

**Step 2: Verify visually**

```bash
npm run dev
```

Open `http://localhost:5173`. Toggle system dark/light mode — background color should switch between `#ffffff` and `#0d1117`.

**Step 3: Commit**

`feat(styles): add CSS variables, dark mode tokens, and animation keyframes`

---

## Stage 3 — Profile Panel

### Task 3.1: Skeleton and Spinner Primitives

**Files:**

- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/Spinner.tsx`
- Create: `src/components/ui/Skeleton.test.tsx`
- Create: `src/components/ui/Spinner.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/ui/Skeleton.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies inline width and height', () => {
    const { container } = render(<Skeleton width="120px" height="16px" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('16px')
  })

  it('merges extra className', () => {
    const { container } = render(<Skeleton className="rounded-full" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('renders with data-testid skeleton', () => {
    const { getByTestId } = render(<Skeleton />)
    expect(getByTestId('skeleton')).toBeInTheDocument()
  })
})
```

Create `src/components/ui/Spinner.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('accepts a className prop', () => {
    const { container } = render(<Spinner className="text-green-500" />)
    expect(container.querySelector('svg')).toHaveClass('text-green-500')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm test src/components/ui/Skeleton.test.tsx src/components/ui/Spinner.test.tsx
```

Expected:

```
FAIL  src/components/ui/Skeleton.test.tsx
  × Cannot find module './Skeleton'
FAIL  src/components/ui/Spinner.test.tsx
  × Cannot find module './Spinner'
```

**Step 3: Write the implementations**

Create `src/components/ui/Skeleton.tsx`:

```tsx
interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    />
  )
}
```

Create `src/components/ui/Spinner.tsx`:

```tsx
interface SpinnerProps {
  className?: string
  size?: number
}

export function Spinner({ className = '', size = 16 }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`animate-spin ${className}`}
      aria-label="Loading"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test src/components/ui/Skeleton.test.tsx src/components/ui/Spinner.test.tsx
```

Expected:

```
 PASS  src/components/ui/Skeleton.test.tsx
  Skeleton
    ✓ renders with animate-pulse class
    ✓ applies inline width and height
    ✓ merges extra className
    ✓ renders with data-testid skeleton
 PASS  src/components/ui/Spinner.test.tsx
  Spinner
    ✓ renders an SVG element
    ✓ accepts a className prop
```

**Step 5: Commit**

`feat(ui): add Skeleton and Spinner primitive components`

---

### Task 3.2: ProfileCard

**Files:**

- Create: `src/components/profile/ProfileCard.tsx`
- Create: `src/components/profile/ProfileCard.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/profile/ProfileCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ProfileCard } from './ProfileCard'
import * as hooks from '../../hooks/useGithubProfile'

const MOCK_PROFILE = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Building cool stuff.',
  publicRepos: 8,
  followers: 9000,
  following: 9,
}

describe('ProfileCard', () => {
  it('shows skeletons while loading', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: true, isError: false, error: null, data: undefined,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('renders name and login when data is available', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getByText('The Octocat')).toBeInTheDocument()
    expect(screen.getByText('@octocat')).toBeInTheDocument()
  })

  it('renders bio when present', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getByText('Building cool stuff.')).toBeInTheDocument()
  })

  it('renders stats: repos, followers, following', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9000')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('renders avatar with correct src', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/avatar.png')
  })

  it('shows error state when fetch fails', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false, isError: true, error: new Error('Network error'), data: undefined,
    } as ReturnType<typeof hooks.useGithubProfile>)
    render(<ProfileCard />)
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/profile/ProfileCard.test.tsx
```

Expected:

```
FAIL  src/components/profile/ProfileCard.test.tsx
  × Cannot find module './ProfileCard'
```

**Step 3: Write the implementation**

Create `src/components/profile/ProfileCard.tsx`:

```tsx
import { useGithubProfile } from '../../hooks/useGithubProfile'
import { Skeleton } from '../ui/Skeleton'

export function ProfileCard() {
  const { data, isLoading, isError } = useGithubProfile()

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton width={64} height={64} className="rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton width={140} height={16} />
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
        <div className="flex gap-6">
          <Skeleton width={50} height={32} />
          <Skeleton width={50} height={32} />
          <Skeleton width={50} height={32} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
        <p>Failed to load profile. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img
          src={data.avatarUrl}
          alt={data.name}
          width={64}
          height={64}
          loading="lazy"
          className="rounded-full border-2"
          style={{ borderColor: 'var(--color-border)' }}
        />
        <div>
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            {data.name}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            @{data.login}
          </p>
        </div>
      </div>

      {data.bio && (
        <p className="text-sm" style={{ color: 'var(--color-text)' }}>
          {data.bio}
        </p>
      )}

      <div className="flex gap-6 text-sm">
        <Stat label="Repos" value={data.publicRepos} />
        <Stat label="Followers" value={data.followers} />
        <Stat label="Following" value={data.following} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
        {value.toLocaleString()}
      </span>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/profile/ProfileCard.test.tsx
```

Expected:

```
 PASS  src/components/profile/ProfileCard.test.tsx
  ProfileCard
    ✓ shows skeletons while loading
    ✓ renders name and login when data is available
    ✓ renders bio when present
    ✓ renders stats: repos, followers, following
    ✓ renders avatar with correct src
    ✓ shows error state when fetch fails
```

**Step 5: Commit**

`feat(profile): add ProfileCard with skeleton loading and error state`

---

### Task 3.3: ContributionTooltip

**Files:**

- Create: `src/components/profile/ContributionTooltip.tsx`
- Create: `src/components/profile/ContributionTooltip.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/profile/ContributionTooltip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ContributionTooltip } from './ContributionTooltip'

describe('ContributionTooltip', () => {
  it('shows "No contributions" when count is 0', () => {
    render(<ContributionTooltip date="2024-03-15" count={0} />)
    expect(screen.getByText('No contributions')).toBeInTheDocument()
  })

  it('uses singular form for count 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={1} />)
    expect(screen.getByText('1 contribution')).toBeInTheDocument()
  })

  it('uses plural form for count > 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={7} />)
    expect(screen.getByText('7 contributions')).toBeInTheDocument()
  })

  it('formats date as "Month Day, Year"', () => {
    render(<ContributionTooltip date="2024-03-15" count={3} />)
    expect(screen.getByText('March 15, 2024')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/profile/ContributionTooltip.test.tsx
```

Expected:

```
FAIL  src/components/profile/ContributionTooltip.test.tsx
  × Cannot find module './ContributionTooltip'
```

**Step 3: Write the implementation**

Create `src/components/profile/ContributionTooltip.tsx`:

```tsx
interface ContributionTooltipProps {
  date: string
  count: number
}

export function ContributionTooltip({ date, count }: ContributionTooltipProps) {
  // date is "YYYY-MM-DD"; append T12:00:00 to avoid UTC vs local timezone shifts
  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const label =
    count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`

  return (
    <div
      className="absolute z-10 bottom-full left-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
      style={{
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-text)',
        color: 'var(--color-bg)',
      }}
    >
      <div className="font-medium">{label}</div>
      <div style={{ color: 'var(--color-surface)' }}>{formatted}</div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/profile/ContributionTooltip.test.tsx
```

Expected:

```
 PASS  src/components/profile/ContributionTooltip.test.tsx
  ContributionTooltip
    ✓ shows "No contributions" when count is 0
    ✓ uses singular form for count 1
    ✓ uses plural form for count > 1
    ✓ formats date as "Month Day, Year"
```

**Step 5: Commit**

`feat(profile): add ContributionTooltip with count label and formatted date`

---

### Task 3.4: ContributionChart

**Files:**

- Create: `src/components/profile/ContributionChart.tsx`
- Create: `src/components/profile/ContributionChart.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/profile/ContributionChart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ContributionChart } from './ContributionChart'
import * as hooks from '../../hooks/useContributions'
import { ContributionDay } from '../../api/github.types'

const MOCK_CONTRIBUTIONS: ContributionDay[] = Array.from({ length: 365 }, (_, i) => ({
  date: (() => {
    const d = new Date('2024-03-20')
    d.setDate(d.getDate() - (364 - i))
    return d.toISOString().split('T')[0]
  })(),
  count: i % 5,
  level: (i % 5) as 0 | 1 | 2 | 3 | 4,
}))

describe('ContributionChart', () => {
  it('shows skeletons while loading', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: true, isError: false, error: null, data: undefined,
    } as ReturnType<typeof hooks.useContributions>)
    render(<ContributionChart />)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('renders the "Contribution activity" heading when loaded', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_CONTRIBUTIONS,
    } as ReturnType<typeof hooks.useContributions>)
    render(<ContributionChart />)
    expect(screen.getByText('Contribution activity')).toBeInTheDocument()
  })

  it('renders one cell per contribution day', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false, isError: false, error: null, data: MOCK_CONTRIBUTIONS,
    } as ReturnType<typeof hooks.useContributions>)
    render(<ContributionChart />)
    expect(screen.getAllByTestId('contribution-cell')).toHaveLength(365)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/profile/ContributionChart.test.tsx
```

Expected:

```
FAIL  src/components/profile/ContributionChart.test.tsx
  × Cannot find module './ContributionChart'
```

**Step 3: Write the implementation**

Create `src/components/profile/ContributionChart.tsx`:

```tsx
import { useState } from 'react'
import { useContributions } from '../../hooks/useContributions'
import { ContributionDay } from '../../api/github.types'
import { Skeleton } from '../ui/Skeleton'
import { ContributionTooltip } from './ContributionTooltip'

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ContributionChart() {
  const { data, isLoading } = useContributions()

  if (isLoading || !data) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton width={180} height={16} />
        <Skeleton width="100%" height={112} />
      </div>
    )
  }

  // Group days into weeks (columns)
  const weeks: ContributionDay[][] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  // Extract month labels: detect when month changes between weeks
  const monthLabels: Array<{ label: string; col: number }> = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const month = new Date(`${week[0].date}T12:00:00`).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({
        label: new Date(`${week[0].date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' }),
        col,
      })
      lastMonth = month
    }
  })

  return (
    <div className="p-6 flex flex-col gap-2">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Contribution activity
      </h3>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div
          className="flex text-xs mb-1"
          style={{ color: 'var(--color-text-muted)', paddingLeft: 28 }}
        >
          {monthLabels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              style={{ minWidth: 0, position: 'absolute', left: col * 13 + 28 + 24 }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5 relative" style={{ paddingTop: 20 }}>
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {DAY_LABELS.map((label, i) => (
              <span key={i} style={{ height: 10, fontSize: 9, lineHeight: '10px' }}>
                {label}
              </span>
            ))}
          </div>

          {/* Grid columns */}
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="flex flex-col gap-0.5"
              style={{ animationDelay: `${weekIdx * 15}ms` }}
            >
              {week.map((day) => (
                <Cell key={day.date} day={day} />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-1 mt-2 text-xs justify-end"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map(level => (
            <div
              key={level}
              style={{ width: 10, height: 10, backgroundColor: `var(--level-${level})`, borderRadius: 2 }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

function Cell({ day }: { day: ContributionDay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      data-testid="contribution-cell"
      className="relative"
      style={{ width: 10, height: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: `var(--level-${day.level})`,
          transition: 'opacity 150ms',
          opacity: hovered ? 0.8 : 1,
          cursor: 'pointer',
        }}
      />
      {hovered && <ContributionTooltip date={day.date} count={day.count} />}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/profile/ContributionChart.test.tsx
```

Expected:

```
 PASS  src/components/profile/ContributionChart.test.tsx
  ContributionChart
    ✓ shows skeletons while loading
    ✓ renders the "Contribution activity" heading when loaded
    ✓ renders one cell per contribution day
```

**Step 5: Commit**

`feat(profile): add ContributionChart with CSS grid, hover tooltips, and stagger animation`

---

## Stage 4 — Chat Panel

### Task 4.1: MessageBubble

**Files:**

- Create: `src/components/chat/MessageBubble.tsx`
- Create: `src/components/chat/MessageBubble.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/chat/MessageBubble.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MessageBubble } from './MessageBubble'
import { Message } from '../../hooks/useChat'

const userMsg: Message = {
  id: '1',
  role: 'user',
  content: 'Hello!',
  timestamp: new Date('2024-03-15T10:30:00'),
}
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hi there.',
  timestamp: new Date('2024-03-15T10:31:00'),
}

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={userMsg} />)
    expect(screen.getByText('Hello!')).toBeInTheDocument()
  })

  it('user message has right-align wrapper class', () => {
    const { container } = render(<MessageBubble message={userMsg} />)
    expect(container.firstChild).toHaveClass('justify-end')
  })

  it('assistant message has left-align wrapper class', () => {
    const { container } = render(<MessageBubble message={assistantMsg} />)
    expect(container.firstChild).toHaveClass('justify-start')
  })

  it('renders formatted timestamp', () => {
    render(<MessageBubble message={userMsg} />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/chat/MessageBubble.test.tsx
```

Expected:

```
FAIL  src/components/chat/MessageBubble.test.tsx
  × Cannot find module './MessageBubble'
```

**Step 3: Write the implementation**

Create `src/components/chat/MessageBubble.tsx`:

```tsx
import { Message } from '../../hooks/useChat'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div className={`flex animate-slide-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-xs px-4 py-2 rounded-2xl text-sm"
        style={
          isUser
            ? { backgroundColor: 'var(--color-accent)', color: '#ffffff' }
            : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)' }
        }
      >
        <p style={{ margin: 0, lineHeight: 1.5 }}>{message.content}</p>
        <p
          className="text-right text-xs mt-1"
          style={{ opacity: 0.7, margin: 0 }}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/chat/MessageBubble.test.tsx
```

Expected:

```
 PASS  src/components/chat/MessageBubble.test.tsx
  MessageBubble
    ✓ renders message content
    ✓ user message has right-align wrapper class
    ✓ assistant message has left-align wrapper class
    ✓ renders formatted timestamp
```

**Step 5: Commit**

`feat(chat): add MessageBubble with role-based alignment and slide-in animation`

---

### Task 4.2: TypingIndicator

**Files:**

- Create: `src/components/chat/TypingIndicator.tsx`
- Create: `src/components/chat/TypingIndicator.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/chat/TypingIndicator.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { TypingIndicator } from './TypingIndicator'

describe('TypingIndicator', () => {
  it('renders exactly 3 dots', () => {
    render(<TypingIndicator />)
    expect(screen.getAllByTestId('typing-dot')).toHaveLength(3)
  })

  it('applies staggered animation delays: 0ms, 150ms, 300ms', () => {
    render(<TypingIndicator />)
    const dots = screen.getAllByTestId('typing-dot')
    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' })
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' })
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/chat/TypingIndicator.test.tsx
```

Expected:

```
FAIL  src/components/chat/TypingIndicator.test.tsx
  × Cannot find module './TypingIndicator'
```

**Step 3: Write the implementation**

Create `src/components/chat/TypingIndicator.tsx`:

```tsx
const DELAYS = [0, 150, 300]

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
      >
        {DELAYS.map((delay, i) => (
          <span
            key={i}
            data-testid="typing-dot"
            className="animate-bounce-dot rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: 'var(--color-text-muted)',
              animationDelay: `${delay}ms`,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/chat/TypingIndicator.test.tsx
```

Expected:

```
 PASS  src/components/chat/TypingIndicator.test.tsx
  TypingIndicator
    ✓ renders exactly 3 dots
    ✓ applies staggered animation delays: 0ms, 150ms, 300ms
```

**Step 5: Commit**

`feat(chat): add TypingIndicator with staggered bounce animation`

---

### Task 4.3: ChatInput

**Files:**

- Create: `src/components/chat/ChatInput.tsx`
- Create: `src/components/chat/ChatInput.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/chat/ChatInput.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  it('sends message and clears input on Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled={false} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello{Enter}')
    expect(onSend).toHaveBeenCalledWith('Hello')
    expect(input).toHaveValue('')
  })

  it('sends message on button click', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), 'Test message')
    await user.click(screen.getByRole('button'))
    expect(onSend).toHaveBeenCalledWith('Test message')
  })

  it('does not send empty or whitespace-only input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), '   {Enter}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('disables input and button when disabled prop is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/chat/ChatInput.test.tsx
```

Expected:

```
FAIL  src/components/chat/ChatInput.test.tsx
  × Cannot find module './ChatInput'
```

**Step 3: Write the implementation**

Create `src/components/chat/ChatInput.tsx`:

```tsx
import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask about this profile…"
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: 'var(--color-text)' }}
      />
      <button
        onClick={submit}
        disabled={disabled}
        aria-label="Send message"
        className="p-1.5 rounded-lg transition-opacity disabled:opacity-40"
        style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1.5l13 6.5-13 6.5V9.5l9-1.5-9-1.5V1.5z" />
        </svg>
      </button>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/chat/ChatInput.test.tsx
```

Expected:

```
 PASS  src/components/chat/ChatInput.test.tsx
  ChatInput
    ✓ sends message and clears input on Enter
    ✓ sends message on button click
    ✓ does not send empty or whitespace-only input
    ✓ disables input and button when disabled prop is true
```

**Step 5: Commit**

`feat(chat): add ChatInput with Enter-to-send, send button, and disabled state`

---

### Task 4.4: MessageList

**Files:**

- Create: `src/components/chat/MessageList.tsx`
- Create: `src/components/chat/MessageList.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/chat/MessageList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MessageList } from './MessageList'
import { Message } from '../../hooks/useChat'

const MESSAGES: Message[] = [
  { id: '1', role: 'user', content: 'First message', timestamp: new Date() },
  { id: '2', role: 'assistant', content: 'Second message', timestamp: new Date() },
]

describe('MessageList', () => {
  it('renders all messages', () => {
    render(<MessageList messages={MESSAGES} isTyping={false} />)
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })

  it('shows TypingIndicator when isTyping is true', () => {
    render(<MessageList messages={MESSAGES} isTyping={true} />)
    expect(screen.getAllByTestId('typing-dot')).toHaveLength(3)
  })

  it('hides TypingIndicator when isTyping is false', () => {
    render(<MessageList messages={MESSAGES} isTyping={false} />)
    expect(screen.queryAllByTestId('typing-dot')).toHaveLength(0)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/chat/MessageList.test.tsx
```

Expected:

```
FAIL  src/components/chat/MessageList.test.tsx
  × Cannot find module './MessageList'
```

**Step 3: Write the implementation**

Create `src/components/chat/MessageList.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { Message } from '../../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/chat/MessageList.test.tsx
```

Expected:

```
 PASS  src/components/chat/MessageList.test.tsx
  MessageList
    ✓ renders all messages
    ✓ shows TypingIndicator when isTyping is true
    ✓ hides TypingIndicator when isTyping is false
```

**Step 5: Commit**

`feat(chat): add MessageList with auto-scroll and conditional TypingIndicator`

---

### Task 4.5: ChatPanel

**Files:**

- Create: `src/components/chat/ChatPanel.tsx`
- Create: `src/components/chat/ChatPanel.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/chat/ChatPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ChatPanel } from './ChatPanel'
import * as contributionsHook from '../../hooks/useContributions'
import * as chatHook from '../../hooks/useChat'

const MOCK_CHAT_STATE = {
  messages: [],
  isTyping: false,
  sendMessage: vi.fn(),
}

beforeEach(() => {
  vi.spyOn(contributionsHook, 'useContributions').mockReturnValue({
    isLoading: false, isError: false, error: null, data: [],
  } as ReturnType<typeof contributionsHook.useContributions>)
  vi.spyOn(chatHook, 'useChat').mockReturnValue(MOCK_CHAT_STATE)
})

describe('ChatPanel', () => {
  it('renders the panel header', () => {
    render(<ChatPanel />)
    expect(screen.getByText(/ask about this profile/i)).toBeInTheDocument()
  })

  it('shows suggestion chips in empty state', () => {
    render(<ChatPanel />)
    expect(screen.getByText(/busiest day/i)).toBeInTheDocument()
  })

  it('renders the chat input', () => {
    render(<ChatPanel />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/chat/ChatPanel.test.tsx
```

Expected:

```
FAIL  src/components/chat/ChatPanel.test.tsx
  × Cannot find module './ChatPanel'
```

**Step 3: Write the implementation**

Create `src/components/chat/ChatPanel.tsx`:

```tsx
import { useContributions } from '../../hooks/useContributions'
import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

const SUGGESTIONS = [
  "What's their busiest day of the week?",
  'How active were they in the last 3 months?',
  'Do they contribute on weekends?',
  "What's their longest streak?",
]

export function ChatPanel() {
  const { data: contributions = [] } = useContributions()
  const { messages, isTyping, sendMessage } = useChat(contributions)

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b font-semibold text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        Ask about this profile
      </div>

      {/* Messages or empty state */}
      {messages.length === 0 && !isTyping ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10">
          <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
            Ask me anything about this GitHub profile and contribution history.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left px-4 py-2 rounded-xl text-sm border transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isTyping={isTyping} />
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test src/components/chat/ChatPanel.test.tsx
```

Expected:

```
 PASS  src/components/chat/ChatPanel.test.tsx
  ChatPanel
    ✓ renders the panel header
    ✓ shows suggestion chips in empty state
    ✓ renders the chat input
```

**Step 5: Commit**

`feat(chat): add ChatPanel with empty state suggestions and full chat flow`

---

## Stage 5 — Layout, Routing, and Polish

### Task 5.1: RootLayout, Router, and Providers

**Files:**

- Create: `src/RootLayout.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css` (add layout classes)
- Modify: `src/App.tsx` (delete — replaced by RootLayout)

No automated test — verify manually at three breakpoints.

**Step 1: Create `src/RootLayout.tsx`**

```tsx
import { ProfileCard } from './components/profile/ProfileCard'
import { ContributionChart } from './components/profile/ContributionChart'
import { ChatPanel } from './components/chat/ChatPanel'

export function RootLayout() {
  return (
    <main className="layout">
      <aside className="profile-panel">
        <ProfileCard />
        <ContributionChart />
      </aside>
      <section className="chat-panel">
        <ChatPanel />
      </section>
    </main>
  )
}
```

**Step 2: Add layout CSS to `src/index.css`**

Append to the end of `index.css`:

```css
/* ─── Layout ────────────────────────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: 35% 65%;
  height: 100dvh;
  overflow: hidden;
}

.profile-panel {
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: 100dvh;
  }

  .profile-panel {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    max-height: 40dvh;
    overflow-y: auto;
    order: 2;
  }

  .chat-panel {
    order: 1;
    min-height: 0;
  }
}
```

**Step 3: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { RootLayout } from './RootLayout'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
```

**Step 4: Run all tests to verify nothing regressed**

```bash
npm test
```

Expected:

```
Test Files  X passed (X)
Tests       X passed (X)
```

**Step 5: Manual visual verification**

```bash
npm run dev
```

Check at three viewport widths (use browser DevTools responsive mode):

- 375px (mobile): chat panel on top, profile panel below, no horizontal overflow
- 768px (tablet): two columns begin to appear
- 1280px (desktop): 35%/65% grid, both panels scroll independently, no overflow

**Step 6: Commit**

`feat(layout): add RootLayout with responsive 35/65 grid, router, and providers`

---

### Task 5.2: Polish Pass and Final Build

**Files:**

- Modify: `src/index.css` (fine-tune transitions)
- No test changes needed

**Step 1: Add focus-visible and transition polish to `index.css`**

Append to `index.css`:

```css
/* ─── Focus and interaction polish ──────────────────────────── */
input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Smooth hover on suggestion chips */
.suggestion-chip:hover {
  background-color: var(--color-surface-2) !important;
  border-color: var(--color-accent) !important;
  color: var(--color-accent) !important;
}

/* Contribution chart column fade-in on load */
.chart-col {
  animation: fadeIn 0.4s ease-out both;
}
```

**Step 2: Run full test suite one final time**

```bash
npm test
```

Expected: all tests pass, zero failures.

**Step 3: Run production build**

```bash
npm run build
```

Expected:

```
vite v6.x.x building for production...
✓ X modules transformed.
dist/index.html     X kB
dist/assets/...     X kB
✓ built in Xs
```

Zero TypeScript errors, zero warnings about `any`.

**Step 4: Full manual verification checklist**

Run `npm run preview` and check:

- [ ] Skeleton loading visible during initial ~800ms delay
- [ ] Smooth transition from skeleton to profile data
- [ ] Contribution chart renders with correct colors per level
- [ ] Hovering a chart cell shows tooltip with date and count
- [ ] Typing a message and pressing Enter: user bubble appears immediately
- [ ] Typing indicator appears while assistant is "thinking"
- [ ] Assistant message appears with slide-in animation
- [ ] Input is disabled while assistant is typing
- [ ] Clicking a suggestion chip sends the question
- [ ] Dark mode: toggle system preference, all colors adapt correctly
- [ ] 375px viewport: chat on top, profile below, no horizontal scroll
- [ ] 1280px viewport: 35/65 grid, panels scroll independently

**Step 5: Final commit**

`feat(ui): polish pass — focus-visible, hover transitions, and chart stagger animation`

---

## Verification Summary

After all tasks are complete, run:

```bash
npm test && npm run build
```

Expected:

```
Test Files  ~15 passed
Tests       ~50 passed

vite v6.x.x building for production...
✓ built in Xs
```

Zero TypeScript errors (`tsc --noEmit` passes). Zero `any` types. Zero console errors at runtime.
