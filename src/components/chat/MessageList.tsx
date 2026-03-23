import { useEffect, useRef } from 'react';
import { isAssistantMessage, type Message } from '../../api/chat.types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onRegenerate?: () => void;
}

export function MessageList({
  messages,
  isTyping,
  onRegenerate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const lastAssistantIndex = messages.reduce(
    (lastIdx, msg, idx) => (isAssistantMessage(msg) ? idx : lastIdx),
    -1,
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="flex flex-col gap-4 p-6 pb-2">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRegenerate={onRegenerate}
            isLatestAssistant={
              isAssistantMessage(msg) &&
              index === lastAssistantIndex &&
              !isTyping
            }
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
