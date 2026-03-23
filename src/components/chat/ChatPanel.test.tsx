import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatPanel } from './ChatPanel';
import * as contributionsHook from '../../hooks/useContributions';
import * as profileHook from '../../hooks/useGithubProfile';
import * as chatHook from '../../hooks/useChat';
import type { ContributionData } from '../../api/github.types';

const MOCK_CONTRIBUTIONS: ContributionData = {
  totalContributions: 0,
  weeks: [],
};

const MOCK_CHAT_STATE = {
  messages: [],
  isTyping: false,
  sendMessage: vi.fn(),
  regenerateLastMessage: vi.fn(),
};

beforeEach(() => {
  vi.spyOn(profileHook, 'useGithubProfile').mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
  } as unknown as ReturnType<typeof profileHook.useGithubProfile>);

  vi.spyOn(contributionsHook, 'useContributions').mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: MOCK_CONTRIBUTIONS,
  } as unknown as ReturnType<typeof contributionsHook.useContributions>);

  vi.spyOn(chatHook, 'useChat').mockReturnValue(MOCK_CHAT_STATE);
});

describe('ChatPanel', () => {
  it('renders the panel header', () => {
    render(<ChatPanel />);
    expect(screen.getByText('Profile Chat')).toBeInTheDocument();
  });

  it('shows suggestion chips in empty state', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/what languages/i)).toBeInTheDocument();
  });

  it('renders the chat input', () => {
    render(<ChatPanel />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
