import { useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border shrink-0">
      <div
        className={`flex items-end gap-2 rounded-xl border border-border bg-surface p-2 transition-all duration-200 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this profile…"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[16px] text-text placeholder:text-text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] max-h-[120px] py-2 px-2"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="shrink-0 size-9 rounded-lg flex items-center justify-center bg-accent text-white transition-opacity disabled:opacity-40 hover:bg-accent-hover"
        >
          <Send className="size-4" />
        </button>
      </div>
      <p className="text-[10px] text-text-muted text-center mt-2">
        <span className="hidden sm:inline">
          Press Enter to send, Shift+Enter for new line.{' '}
        </span>
        Responses are generated from mock data.
      </p>
    </div>
  );
}
