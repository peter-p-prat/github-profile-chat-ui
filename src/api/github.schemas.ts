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
