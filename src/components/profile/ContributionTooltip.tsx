import { formatDate } from '../../lib/dates';
import { Tooltip } from '../ui/Tooltip';

interface ContributionTooltipProps {
  date: string;
  count: number;
  x: number;
  y: number;
}

export function ContributionTooltip({
  date,
  count,
  x,
  y,
}: ContributionTooltipProps) {
  const formattedDate = formatDate(date);

  const contributions =
    count === 0
      ? 'No contributions'
      : `${count} contribution${count === 1 ? '' : 's'}`;

  return <Tooltip title={contributions} content={formattedDate} x={x} y={y} />;
}
