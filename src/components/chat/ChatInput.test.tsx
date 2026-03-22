import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('sends message and clears input on Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello{Enter}');
    expect(onSend).toHaveBeenCalledWith('Hello');
    expect(input).toHaveValue('');
  });

  it('sends message on button click', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);
    await user.type(screen.getByRole('textbox'), 'Test message');
    await user.click(screen.getByRole('button'));
    expect(onSend).toHaveBeenCalledWith('Test message');
  });

  it('does not send empty or whitespace-only input', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);
    await user.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
