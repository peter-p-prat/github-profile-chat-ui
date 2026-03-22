import type {
  GithubProfile,
  ContributionDay,
  Contributions,
} from './github.types';
import { GithubProfileSchema, ContributionsSchema } from './github.schemas';

const MOCK_PROFILE: GithubProfile = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
  bio: 'Building the tools that build the future.',
  publicRepos: 8,
  followers: 14800,
  following: 9,
};

function buildContributions(): ContributionDay[] {
  const contributionDays: ContributionDay[] = [];
  const endDate = new Date('2025-03-20');
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);

  // Seeded pseudo-random to keep data deterministic across reloads
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0xffffffff;
  };

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const activityChance = isWeekend ? 0.35 : 0.75;
    const count = random() < activityChance ? Math.floor(random() * 14) + 1 : 0;
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
    contributionDays.push({
      date: date.toISOString().split('T')[0],
      count,
      level,
    });
  }

  return contributionDays;
}

const MOCK_CONTRIBUTIONS = buildContributions();

export async function fetchProfile(): Promise<GithubProfile> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return GithubProfileSchema.parse(MOCK_PROFILE);
}

export async function fetchContributions(): Promise<Contributions> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return ContributionsSchema.parse(MOCK_CONTRIBUTIONS);
}
