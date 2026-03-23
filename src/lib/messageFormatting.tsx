import type { ReactNode } from 'react'

export function formatMessageContent(content: string): ReactNode {
  const lines = content.split('\n')

  return lines.map((line, index) => {
    let processedLine: ReactNode = line

    // Bold: **text**
    if (line.includes('**')) {
      const parts = line.split(/\*\*([^*]+)\*\*/g)
      processedLine = parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold">
            {part}
          </strong>
        ) : (
          part
        ),
      )
    }

    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return (
        <div key={index} className="flex gap-2 ml-2">
          <span className="text-text-muted">•</span>
          <span>
            {typeof processedLine === 'string'
              ? processedLine.replace(/^[•-]\s*/, '')
              : processedLine}
          </span>
        </div>
      )
    }

    // Empty line
    if (line.trim() === '') {
      return <div key={index} className="h-3" />
    }

    return <div key={index}>{processedLine}</div>
  })
}
