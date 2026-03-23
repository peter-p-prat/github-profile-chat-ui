import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useContributions } from './useContributions';
import * as githubApi from '../api/github';
import { createQueryWrapper } from '../test/queryWrapper';
import { buildMockContributions } from '../lib/mocks';

const MOCK_CONTRIBUTIONS = buildMockContributions();

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
