import { z } from 'zod'
import {
  GithubProfileSchema,
  ContributionDaySchema,
  ContributionWeekSchema,
  ContributionDataSchema,
} from './github.schemas'

export type GithubProfile = z.infer<typeof GithubProfileSchema>
export type ContributionDay = z.infer<typeof ContributionDaySchema>
export type ContributionWeek = z.infer<typeof ContributionWeekSchema>
export type ContributionData = z.infer<typeof ContributionDataSchema>
