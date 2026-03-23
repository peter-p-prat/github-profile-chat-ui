import { Sparkles } from 'lucide-react'

const DELAYS = [0, 150, 300]

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="size-8 shrink-0 rounded-full ring-1 ring-accent/20 bg-accent/10 flex items-center justify-center">
        <Sparkles className="size-4 text-accent" />
      </div>

      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          {DELAYS.map((delay, i) => (
            <span
              key={i}
              data-testid="typing-dot"
              className="rounded-full block size-2 bg-text-muted/50 animate-pulse"
              style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
