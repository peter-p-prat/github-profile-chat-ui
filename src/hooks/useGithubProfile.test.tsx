import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useGithubProfile } from './useGithubProfile';
import * as githubApi from '@/api/github';
import { createQueryWrapper } from '@/test/queryWrapper';
import type { GithubProfile } from '@/api/github.types';

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

describe('useGithubProfile', () => {
  it('returns isLoading true initially', () => {
    vi.spyOn(githubApi, 'fetchProfile').mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() => useGithubProfile(), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data after the fetch resolves', async () => {
    vi.spyOn(githubApi, 'fetchProfile').mockResolvedValue(MOCK_PROFILE);
    const { result } = renderHook(() => useGithubProfile(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_PROFILE);
  });
});
