import { useContributions } from '../../hooks/useContributions';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const SUGGESTIONS = [
  "What's their busiest day of the week?",
  'How active were they in the last 3 months?',
  'Do they contribute on weekends?',
  "What's their longest streak?",
];

export function ChatPanel() {
  const { data: contributions = [] } = useContributions();
  const { messages, isTyping, sendMessage } = useChat(contributions);

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="px-6 py-4 border-b border-border font-semibold text-sm text-text">
        Ask about this profile
      </div>

      {/* Messages or empty state */}
      {messages.length === 0 && !isTyping ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10">
          <p className="text-sm text-center text-text-muted">
            Ask me anything about this GitHub profile and contribution history.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left px-4 py-2 rounded-xl text-sm border transition-colors border-border text-text bg-surface"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isTyping={isTyping} />
      )}

      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
