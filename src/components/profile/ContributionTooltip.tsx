interface ContributionTooltipProps {
  date: string;
  count: number;
}

export function ContributionTooltip({ date, count }: ContributionTooltipProps) {
  // date is "YYYY-MM-DD"; append T12:00:00 to avoid UTC vs local timezone shifts
  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const label =
    count === 0
      ? 'No contributions'
      : `${count} contribution${count === 1 ? '' : 's'}`;

  return (
    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none bg-text text-bg">
      <div className="font-medium">{label}</div>
      <div className="text-surface">{formatted}</div>
    </div>
  );
}
