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
