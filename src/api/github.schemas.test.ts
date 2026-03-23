import {
  GithubProfileSchema,
  ContributionDaySchema,
  ContributionDataSchema,
} from './github.schemas'

describe('GithubProfileSchema', () => {
  it('parses a valid profile with required fields only', () => {
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

  it('parses optional fields when provided', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'pedro',
      name: 'Pedro',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Engineer',
      publicRepos: 10,
      followers: 100,
      following: 50,
      stars: 7,
      company: 'Vercel',
      location: 'San Francisco',
      pronouns: 'he/him',
      createdAt: '2019-03-15T00:00:00Z',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stars).toBe(7)
      expect(result.data.company).toBe('Vercel')
    }
  })

  it('applies defaults for optional fields when omitted', () => {
    const result = GithubProfileSchema.safeParse({
      login: 'x',
      name: 'X',
      avatarUrl: 'https://example.com/a.png',
      bio: null,
      publicRepos: 0,
      followers: 0,
      following: 0,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stars).toBe(0)
      expect(result.data.company).toBeNull()
      expect(result.data.location).toBeNull()
      expect(result.data.pronouns).toBeNull()
    }
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

describe('ContributionDataSchema', () => {
  it('parses a valid weekly contribution structure', () => {
    const week = {
      days: Array.from({ length: 7 }, (_, i) => ({
        date: `2024-03-${String(i + 1).padStart(2, '0')}`,
        count: i,
        level: Math.min(i, 4) as 0 | 1 | 2 | 3 | 4,
      })),
    }
    const result = ContributionDataSchema.safeParse({
      totalContributions: 21,
      weeks: Array.from({ length: 52 }, () => week),
    })
    expect(result.success).toBe(true)
  })

  it('parses an empty weeks array', () => {
    const result = ContributionDataSchema.safeParse({ totalContributions: 0, weeks: [] })
    expect(result.success).toBe(true)
  })
})
