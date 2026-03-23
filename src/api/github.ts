import { buildMockContributions } from '@/lib/mocks';
import type { GithubProfile, ContributionData } from './github.types';
import { GithubProfileSchema, ContributionDataSchema } from './github.schemas';

const MOCK_PROFILE: GithubProfile = {
  login: 'peter-p-prat',
  name: 'Pedro Peirano Prat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/62166899?v=4',
  bio: 'Senior Frontend Engineer. Passionate about crafting clean, maintainable and understandable code that solves real-world problems.',
  publicRepos: 14,
  followers: 127,
  following: 42,
  stars: 7,
  company: 'Vercel',
  location: 'San Francisco, CA',
  pronouns: 'he/him',
  createdAt: '2019-03-15T00:00:00Z',
};

const MOCK_CONTRIBUTIONS = buildMockContributions();

export async function fetchProfile(): Promise<GithubProfile> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return GithubProfileSchema.parse(MOCK_PROFILE);
}

export async function fetchContributions(): Promise<ContributionData> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return ContributionDataSchema.parse(MOCK_CONTRIBUTIONS);
}
