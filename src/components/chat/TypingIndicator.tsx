const DELAYS = [0, 150, 300]

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-surface-2">
        {DELAYS.map((delay, i) => (
          <span
            key={i}
            data-testid="typing-dot"
            className="animate-bounce-dot rounded-full block w-2 h-2 bg-text-muted"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
