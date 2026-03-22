import { useState } from 'react';
import clsx from 'clsx';
import { useContributions } from '../../hooks/useContributions';
import type { ContributionDay } from '../../api/github.types';
import { Skeleton } from '../ui/Skeleton';
import { ContributionTooltip } from './ContributionTooltip';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const LEVEL_BG = {
  0: 'bg-level-0',
  1: 'bg-level-1',
  2: 'bg-level-2',
  3: 'bg-level-3',
  4: 'bg-level-4',
} as const;

export function ContributionChart() {
  const { data, isLoading } = useContributions();

  if (isLoading || !data) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton width={180} height={16} />
        <Skeleton width="100%" height={112} />
      </div>
    );
  }

  // Group days into weeks (columns)
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Extract month labels: detect when month changes between weeks
  const monthLabels: Array<{ label: string; col: number }> = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const month = new Date(`${week[0].date}T12:00:00`).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: new Date(`${week[0].date}T12:00:00`).toLocaleDateString(
          'en-US',
          { month: 'short' },
        ),
        col,
      });
      lastMonth = month;
    }
  });

  return (
    <div className="p-6 flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-text">Contribution activity</h3>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div
          className="flex text-xs mb-1 text-text-muted"
          style={{ paddingLeft: 28 }}
        >
          {monthLabels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              style={{
                minWidth: 0,
                position: 'absolute',
                left: col * 13 + 28 + 24,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5 relative" style={{ paddingTop: 20 }}>
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1 text-xs text-text-muted">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                style={{ height: 10, fontSize: 9, lineHeight: '10px' }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid columns */}
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="flex flex-col gap-0.5"
              style={{ animationDelay: `${weekIdx * 15}ms` }}
            >
              {week.map((day) => (
                <Cell key={day.date} day={day} />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 text-xs justify-end text-text-muted">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <div
              key={level}
              className={clsx('w-[10px] h-[10px] rounded-sm', LEVEL_BG[level])}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function Cell({ day }: { day: ContributionDay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-testid="contribution-cell"
      className="relative w-[10px] h-[10px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={clsx(
          'w-[10px] h-[10px] rounded-sm transition-opacity duration-150 cursor-pointer',
          LEVEL_BG[day.level],
          hovered ? 'opacity-80' : 'opacity-100',
        )}
      />
      {hovered && <ContributionTooltip date={day.date} count={day.count} />}
    </div>
  );
}
