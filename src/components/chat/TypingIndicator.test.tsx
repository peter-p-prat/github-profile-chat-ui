import { render, screen } from '@testing-library/react'
import { TypingIndicator } from './TypingIndicator'

describe('TypingIndicator', () => {
  it('renders exactly 3 dots', () => {
    render(<TypingIndicator />)
    expect(screen.getAllByTestId('typing-dot')).toHaveLength(3)
  })

  it('applies staggered animation delays: 0ms, 150ms, 300ms', () => {
    render(<TypingIndicator />)
    const dots = screen.getAllByTestId('typing-dot')
    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' })
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' })
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' })
  })
})
