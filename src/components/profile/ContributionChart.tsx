import { useState, useRef } from 'react';
import clsx from 'clsx';
import { useContributions } from '../../hooks/useContributions';
import type { ContributionDay } from '../../api/github.types';
import { Skeleton } from '../ui/Skeleton';
import { ContributionTooltip } from './ContributionTooltip';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const LEVEL_BG = {
  0: 'bg-level-0',
  1: 'bg-level-1',
  2: 'bg-level-2',
  3: 'bg-level-3',
  4: 'bg-level-4',
} as const;

function Cell({ day }: { day: ContributionDay }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);

  function showTooltip() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }

  function hideTooltip() {
    setTooltipPos(null);
  }

  return (
    <div
      ref={ref}
      data-testid="contribution-cell"
      className="relative w-[10px] h-[10px]"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={(e) => {
        e.preventDefault();
        showTooltip();
      }}
      onTouchEnd={hideTooltip}
      onTouchCancel={hideTooltip}
    >
      <div
        className={clsx(
          'w-[10px] h-[10px] rounded-[2px] transition-all duration-150 cursor-pointer',
          LEVEL_BG[day.level],
          tooltipPos && 'ring-2 ring-text/20 ring-offset-1 ring-offset-bg',
        )}
      />
      {tooltipPos && (
        <ContributionTooltip
          date={day.date}
          count={day.count}
          x={tooltipPos.x}
          y={tooltipPos.y}
        />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted">
      <span>Less</span>
      <div className="flex gap-0.5">
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={clsx('w-[10px] h-[10px] rounded-[2px]', LEVEL_BG[level])}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

export function ContributionChart() {
  const { data, isLoading } = useContributions();

  if (isLoading || !data) {
    return (
      <div className="flex-1 p-6 flex flex-col gap-3">
        <Skeleton width={220} height={16} />
        <Skeleton width="100%" height={112} />
      </div>
    );
  }

  // Build month labels from weekly data
  const monthLabels: Array<{ label: string; startWeek: number }> = [];
  let lastMonth = -1;
  data.weeks.forEach((week, weekIndex) => {
    const firstDay = week.days[0];
    if (firstDay) {
      const month = new Date(`${firstDay.date}T12:00:00`).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], startWeek: weekIndex });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col gap-2">
      {/* Header */}
      <span className="text-sm font-medium text-text">
        {data.totalContributions} contributions in the last year
      </span>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        <div className="inline-block min-w-max">
          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: 28 }}>
            {monthLabels.map((label, index) => {
              const nextLabel = monthLabels[index + 1];
              const spanWeeks = nextLabel
                ? nextLabel.startWeek - label.startWeek
                : data.weeks.length - label.startWeek;
              return (
                <div
                  key={`${label.label}-${label.startWeek}`}
                  className="text-xs text-text-muted"
                  style={{
                    width: `${spanWeeks * 12}px`,
                    minWidth: spanWeeks > 2 ? 'auto' : '0',
                    overflow: 'hidden',
                  }}
                >
                  {spanWeeks > 2 && label.label}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 pr-1">
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  style={{ height: 10, fontSize: 9, lineHeight: '10px' }}
                  className="text-text-muted"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {data.weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.days.map((day) => (
                    <Cell key={day.date} day={day} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <button
          className="hover:text-accent transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          Learn how we count contributions
        </button>
        <Legend />
      </div>
    </div>
  );
}
