import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useContributions } from './useContributions';
import * as githubApi from '../api/github';
import { createQueryWrapper } from '../test/queryWrapper';

const MOCK_CONTRIBUTIONS = [
  { date: '2024-03-15', count: 5, level: 2 as const },
  { date: '2024-03-16', count: 0, level: 0 as const },
];

describe('useContributions', () => {
  it('returns isLoading true initially', () => {
    vi.spyOn(githubApi, 'fetchContributions').mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() => useContributions(), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data after the fetch resolves', async () => {
    vi.spyOn(githubApi, 'fetchContributions').mockResolvedValue(
      MOCK_CONTRIBUTIONS,
    );
    const { result } = renderHook(() => useContributions(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_CONTRIBUTIONS);
  });
});
