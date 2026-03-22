import type { Message } from '../../hooks/useChat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      className={`flex animate-slide-in-up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isUser ? 'bg-accent text-white' : 'bg-surface-2 text-text'}`}
      >
        <p className="m-0 leading-normal">{message.content}</p>
        <p className="text-right text-xs mt-1 m-0 opacity-70">{time}</p>
      </div>
    </div>
  );
}
