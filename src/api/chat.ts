import type { Contributions } from './github.types';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export async function simulateResponse(
  question: string,
  contributions: Contributions,
): Promise<string> {
  const delay = 1200 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const questionLower = question.toLowerCase();

  if (
    questionLower.includes('active') ||
    questionLower.includes('last 3 months') ||
    questionLower.includes('recent')
  ) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const recent = contributions.filter((d) => new Date(d.date) >= cutoff);
    const total = recent.reduce((sum, d) => sum + d.count, 0);
    const activeDays = recent.filter((d) => d.count > 0).length;
    const avg = (total / 90).toFixed(1);
    const intensity =
      total > 200
        ? 'very active'
        : total > 100
          ? 'moderately active'
          : 'relatively quiet';
    return `In the last 90 days, this developer made ${total} contributions across ${activeDays} active days — that's ${avg} per day on average. Overall: ${intensity}.`;
  }

  if (
    questionLower.includes('busiest') ||
    questionLower.includes('day of the week')
  ) {
    const byDay = [0, 0, 0, 0, 0, 0, 0];
    contributions.forEach((d) => {
      byDay[new Date(d.date).getDay()] += d.count;
    });
    const maxCount = Math.max(...byDay);
    const busiestDay = DAY_NAMES[byDay.indexOf(maxCount)];
    return `${busiestDay} is their busiest day of the week with ${maxCount} total contributions over the past year.`;
  }

  if (questionLower.includes('weekend')) {
    const weekendTotal = contributions
      .filter((d) => {
        const day = new Date(d.date).getDay();
        return day === 0 || day === 6;
      })
      .reduce((sum, d) => sum + d.count, 0);
    const total = contributions.reduce((sum, d) => sum + d.count, 0);
    const pct = total > 0 ? ((weekendTotal / total) * 100).toFixed(1) : '0';
    const verdict =
      parseFloat(pct) > 20
        ? 'They clearly code on weekends!'
        : 'They mostly stick to weekdays.';
    return `Weekend contributions account for ${pct}% of all activity (${weekendTotal} total). ${verdict}`;
  }

  if (questionLower.includes('streak')) {
    let maxStreak = 0;
    let current = 0;
    for (const day of contributions) {
      if (day.count > 0) {
        current++;
        maxStreak = Math.max(maxStreak, current);
      } else {
        current = 0;
      }
    }
    const comment =
      maxStreak > 30
        ? 'Impressive dedication!'
        : maxStreak > 14
          ? 'A solid two-week run.'
          : 'Short but consistent bursts.';
    return `Their longest streak is ${maxStreak} consecutive days with at least one contribution. ${comment}`;
  }

  // Fallback
  const total = contributions.reduce((sum, d) => sum + d.count, 0);
  const activeDays = contributions.filter((d) => d.count > 0).length;
  return `Over the past year, this developer made ${total} contributions across ${activeDays} active days. Try asking about their busiest day, weekend activity, recent months, or longest streak!`;
}
