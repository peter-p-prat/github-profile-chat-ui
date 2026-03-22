import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatPanel } from './ChatPanel';
import * as contributionsHook from '../../hooks/useContributions';
import * as chatHook from '../../hooks/useChat';

const MOCK_CHAT_STATE = {
  messages: [],
  isTyping: false,
  sendMessage: vi.fn(),
};

beforeEach(() => {
  vi.spyOn(contributionsHook, 'useContributions').mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  } as unknown as ReturnType<typeof contributionsHook.useContributions>);
  vi.spyOn(chatHook, 'useChat').mockReturnValue(MOCK_CHAT_STATE);
});

describe('ChatPanel', () => {
  it('renders the panel header', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/ask about this profile/i)).toBeInTheDocument();
  });

  it('shows suggestion chips in empty state', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/busiest day/i)).toBeInTheDocument();
  });

  it('renders the chat input', () => {
    render(<ChatPanel />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
