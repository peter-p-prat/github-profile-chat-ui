import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchProfile, fetchContributions } from './github'
import { GithubProfileSchema, ContributionDataSchema } from './github.schemas'

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

  it('resolves with 52 weeks', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    expect(data.weeks).toHaveLength(52)
  })

  it('each week has 7 days', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    const allHave7 = data.weeks.every((w) => w.days.length === 7)
    expect(allHave7).toBe(true)
  })

  it('all days have level in range 0–4', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    const allValid = data.weeks
      .flatMap((w) => w.days)
      .every((d) => d.level >= 0 && d.level <= 4)
    expect(allValid).toBe(true)
  })

  it('resolves with schema-valid data', async () => {
    const promise = fetchContributions()
    vi.runAllTimers()
    const data = await promise
    const result = ContributionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
