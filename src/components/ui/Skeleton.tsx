interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse rounded bg-surface-2 ${className}`}
      style={{ width, height }}
    />
  )
}
