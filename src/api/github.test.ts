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
