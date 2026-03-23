import type { ContributionData, ContributionDay } from '@/api/github.types';

export function buildMockContributions(): ContributionData {
  // Use a fixed reference date to avoid hydration mismatches
  const startDate = new Date('2025-03-24');
  startDate.setDate(startDate.getDate() - 364);

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  // Seeded pseudo-random for consistent results across reloads
  let seed = 42;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  let totalContributions = 0;
  const weeks: Array<{ days: ContributionDay[] }> = [];

  for (let week = 0; week < 52; week++) {
    const days: ContributionDay[] = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);

      const isWeekday = day >= 1 && day <= 5;
      const isInActivePeriod =
        (week >= 10 && week <= 15) ||
        (week >= 25 && week <= 30) ||
        (week >= 40 && week <= 48);

      let probability = 0.15;
      if (isWeekday) probability += 0.2;
      if (isInActivePeriod) probability += 0.3;

      const hasContribution = random() < probability;
      let count = 0;

      if (hasContribution) {
        const rand = random();
        if (rand < 0.5) count = Math.floor(random() * 3) + 1;
        else if (rand < 0.8) count = Math.floor(random() * 5) + 3;
        else if (rand < 0.95) count = Math.floor(random() * 5) + 7;
        else count = Math.floor(random() * 10) + 10;
      }

      totalContributions += count;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 1 && count <= 3) level = 1;
      else if (count >= 4 && count <= 6) level = 2;
      else if (count >= 7 && count <= 9) level = 3;
      else if (count >= 10) level = 4;

      days.push({
        date: currentDate.toISOString().split('T')[0],
        count,
        level,
      });
    }

    weeks.push({ days });
  }

  return { totalContributions, weeks };
}
