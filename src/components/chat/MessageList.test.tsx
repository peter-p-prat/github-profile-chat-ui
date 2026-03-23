import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { Message } from '../../api/chat.types';

const MESSAGES: Message[] = [
  { id: '1', role: 'user', content: 'First message', timestamp: new Date() },
  {
    id: '2',
    role: 'assistant',
    content: 'Second message',
    timestamp: new Date(),
  },
];

describe('MessageList', () => {
  it('renders all messages', () => {
    render(<MessageList messages={MESSAGES} isTyping={false} />);
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('shows TypingIndicator when isTyping is true', () => {
    render(<MessageList messages={MESSAGES} isTyping={true} />);
    expect(screen.getAllByTestId('typing-dot')).toHaveLength(3);
  });

  it('hides TypingIndicator when isTyping is false', () => {
    render(<MessageList messages={MESSAGES} isTyping={false} />);
    expect(screen.queryAllByTestId('typing-dot')).toHaveLength(0);
  });
});
