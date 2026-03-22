import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../hooks/useChat';

const userMsg: Message = {
  id: '1',
  role: 'user',
  content: 'Hello!',
  timestamp: new Date('2024-03-15T10:30:00'),
};
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hi there.',
  timestamp: new Date('2024-03-15T10:31:00'),
};

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={userMsg} />);
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });

  it('user message has right-align wrapper class', () => {
    const { container } = render(<MessageBubble message={userMsg} />);
    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('assistant message has left-align wrapper class', () => {
    const { container } = render(<MessageBubble message={assistantMsg} />);
    expect(container.firstChild).toHaveClass('justify-start');
  });

  it('renders formatted timestamp', () => {
    render(<MessageBubble message={userMsg} />);
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });
});
