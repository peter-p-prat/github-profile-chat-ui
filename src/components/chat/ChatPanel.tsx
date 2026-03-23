import { MessageSquare, Sparkles } from 'lucide-react';
import { useContributions } from '../../hooks/useContributions';
import { useGithubProfile } from '../../hooks/useGithubProfile';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { suggestedQuestions } from '../../api/chat';

const DISPLAY_QUESTIONS = suggestedQuestions.slice(0, 4);

const EMPTY_CONTRIBUTIONS = { totalContributions: 0, weeks: [] };

export function ChatPanel() {
  const { data: profile } = useGithubProfile();
  const { data: contributions = EMPTY_CONTRIBUTIONS } = useContributions();
  const { messages, isTyping, sendMessage, regenerateLastMessage } = useChat(
    profile,
    contributions,
  );

  const isEmpty = messages.length === 0 && !isTyping;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center">
          <MessageSquare className="size-5 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold text-text">Profile Chat</h2>
          <p className="text-xs text-text-muted">
            Ask questions about @{profile?.login ?? '…'}
          </p>
        </div>
      </div>

      {/* Messages or empty state */}
      <div className="flex-1 overflow-scroll scrollbar-thin">
        {isEmpty ? (
          <div className="flex flex-col items-center min-h-full p-6 text-center md:justify-center animate-in fade-in-0 duration-500">
            <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <MessageSquare className="size-8 text-accent" />
            </div>

            <h2 className="text-xl font-semibold text-text mb-2">
              Ask about this profile
            </h2>

            <p className="text-text-muted text-sm max-w-sm mb-8 leading-relaxed">
              I can analyze contribution patterns, repository details, and help
              you understand this developer's GitHub activity.
            </p>

            <div className="w-full max-w-md">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Suggested questions
              </p>
              <div className="grid gap-2">
                {DISPLAY_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="group flex items-start gap-3 p-3 rounded-lg text-left bg-surface border border-border hover:bg-surface-hover hover:border-surface-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Sparkles className="size-4 text-accent mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm text-text/90 group-hover:text-text transition-colors">
                      {question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isTyping={isTyping}
            onRegenerate={regenerateLastMessage}
          />
        )}
      </div>

      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
