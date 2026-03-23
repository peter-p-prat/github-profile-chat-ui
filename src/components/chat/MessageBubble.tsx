import { useState } from 'react';
import { Check, Copy, RefreshCw, Sparkles, User } from 'lucide-react';
import type { Message } from '@/api/chat.types';
import { isUserMessage } from '@/api/chat.types';
import { formatMessageContent } from '@/lib/messageFormatting';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isLatestAssistant?: boolean;
}

export function MessageBubble({
  message,
  onRegenerate,
  isLatestAssistant,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = isUserMessage(message);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`size-8 shrink-0 rounded-full ring-1 flex items-center justify-center ${
          isUser ? 'ring-border bg-surface-2' : 'ring-accent/20 bg-accent/10'
        }`}
      >
        {isUser ? (
          <User className="size-4 text-text-muted" />
        ) : (
          <Sparkles className="size-4 text-accent" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-accent text-white rounded-tr-sm'
              : 'bg-surface border border-border rounded-tl-sm text-text'
          }`}
        >
          {formatMessageContent(message.content)}
        </div>

        {/* Actions — only for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy message'}
              className="flex items-center justify-center size-7 rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>

            {isLatestAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                aria-label="Regenerate response"
                className="flex items-center justify-center size-7 rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors"
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
