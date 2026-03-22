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
