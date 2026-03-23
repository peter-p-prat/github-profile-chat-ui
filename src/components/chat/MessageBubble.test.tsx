import { render, screen } from '@testing-library/react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../../api/chat.types'

const userMsg: Message = {
  id: '1',
  role: 'user',
  content: 'Hello!',
  timestamp: new Date('2024-03-15T10:30:00'),
}
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hi there.',
  timestamp: new Date('2024-03-15T10:31:00'),
}

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={userMsg} />)
    expect(screen.getByText('Hello!')).toBeInTheDocument()
  })

  it('user message uses reverse row layout', () => {
    const { container } = render(<MessageBubble message={userMsg} />)
    expect(container.firstChild).toHaveClass('flex-row-reverse')
  })

  it('assistant message uses normal row layout', () => {
    const { container } = render(<MessageBubble message={assistantMsg} />)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('user message bubble has accent background', () => {
    render(<MessageBubble message={userMsg} />)
    // The bubble div should contain accent class
    const bubble = document.querySelector('.bg-accent')
    expect(bubble).toBeInTheDocument()
  })

  it('renders copy button for assistant messages', () => {
    render(<MessageBubble message={assistantMsg} />)
    expect(screen.getByLabelText('Copy message')).toBeInTheDocument()
  })
})
