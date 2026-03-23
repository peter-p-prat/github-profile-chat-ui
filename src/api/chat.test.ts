import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { simulateResponse } from './chat'
import type { GithubProfile, ContributionData } from './github.types'

const MOCK_PROFILE: GithubProfile = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
  bio: 'Building the tools that build the future.',
  publicRepos: 8,
  followers: 14800,
  following: 9,
  stars: 5,
  company: null,
  location: null,
  pronouns: null,
  createdAt: '2011-01-25T00:00:00Z',
}

// Deterministic contributions: Mon–Fri active, Sat–Sun quiet
function buildContributions(): ContributionData {
  const days = Array.from({ length: 364 }, (_, i) => {
    const date = new Date('2024-03-20')
    date.setDate(date.getDate() - (363 - i))
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const count = isWeekend ? 0 : (i % 5) + 1
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4
    return { date: date.toISOString().split('T')[0], count, level }
  })

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({ days: days.slice(i, i + 7) })
  }

  return {
    totalContributions: days.reduce((sum, d) => sum + d.count, 0),
    weeks,
  }
}

const CONTRIBUTIONS = buildContributions()

describe('simulateResponse', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns a non-empty string for any input', async () => {
    const promise = simulateResponse('hello', MOCK_PROFILE, CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns string containing a day name for "busiest day" query', async () => {
    const promise = simulateResponse(
      'What is their busiest day of the week?',
      MOCK_PROFILE,
      CONTRIBUTIONS,
    )
    vi.runAllTimers()
    const result = await promise
    expect(result).toMatch(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i)
  })

  it('returns string containing "weekend" for weekend query', async () => {
    const promise = simulateResponse('Do they contribute on weekends?', MOCK_PROFILE, CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result.toLowerCase()).toContain('weekend')
  })

  it('returns string containing "streak" for streak query', async () => {
    const promise = simulateResponse(
      'What is their longest streak?',
      MOCK_PROFILE,
      CONTRIBUTIONS,
    )
    vi.runAllTimers()
    const result = await promise
    expect(result.toLowerCase()).toContain('streak')
  })

  it('returns fallback string for unrecognized query', async () => {
    const promise = simulateResponse('xyzzy', MOCK_PROFILE, CONTRIBUTIONS)
    vi.runAllTimers()
    const result = await promise
    expect(result.length).toBeGreaterThan(20)
  })
})
