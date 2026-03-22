import { z } from 'zod'
import { GithubProfileSchema, ContributionDaySchema, ContributionsSchema } from './github.schemas'

export type GithubProfile = z.infer<typeof GithubProfileSchema>
export type ContributionDay = z.infer<typeof ContributionDaySchema>
export type Contributions = z.infer<typeof ContributionsSchema>
