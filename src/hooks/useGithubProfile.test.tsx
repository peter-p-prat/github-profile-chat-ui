import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useGithubProfile } from './useGithubProfile';
import * as githubApi from '../api/github';
import { createQueryWrapper } from '../test/queryWrapper';

const MOCK_PROFILE = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Hello world',
  publicRepos: 8,
  followers: 100,
  following: 5,
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
