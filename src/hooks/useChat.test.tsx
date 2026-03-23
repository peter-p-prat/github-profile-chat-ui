import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useChat } from './useChat';
import * as chatApi from '@/api/chat';
import type { ContributionData } from '@/api/github.types';

const EMPTY_CONTRIBUTIONS: ContributionData = {
  totalContributions: 0,
  weeks: [],
};

describe('useChat', () => {
  it('starts with empty messages and isTyping false', () => {
    const { result } = renderHook(() =>
      useChat(undefined, EMPTY_CONTRIBUTIONS),
    );
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isTyping).toBe(false);
  });

  it('adds user message immediately on sendMessage', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockResolvedValue('Hello back');
    const { result } = renderHook(() =>
      useChat(undefined, EMPTY_CONTRIBUTIONS),
    );
    act(() => {
      result.current.sendMessage('Hi there');
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Hi there',
    });
  });

  it('sets isTyping to true while waiting for response', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() =>
      useChat(undefined, EMPTY_CONTRIBUTIONS),
    );
    act(() => {
      result.current.sendMessage('Hello');
    });
    expect(result.current.isTyping).toBe(true);
  });

  it('appends assistant message and clears isTyping after resolve', async () => {
    vi.spyOn(chatApi, 'simulateResponse').mockResolvedValue('Got it!');
    const { result } = renderHook(() =>
      useChat(undefined, EMPTY_CONTRIBUTIONS),
    );
    await act(async () => {
      result.current.sendMessage('Hello');
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Got it!',
    });
    expect(result.current.isTyping).toBe(false);
  });

  it('ignores empty or whitespace-only input', async () => {
    const spy = vi.spyOn(chatApi, 'simulateResponse');
    const { result } = renderHook(() =>
      useChat(undefined, EMPTY_CONTRIBUTIONS),
    );
    await act(async () => {
      result.current.sendMessage('   ');
    });
    expect(result.current.messages).toHaveLength(0);
    expect(spy).not.toHaveBeenCalled();
  });
});
