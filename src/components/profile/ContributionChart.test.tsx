import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as hooks from '@/hooks/useContributions';
import type { ContributionData } from '@/api/github.types';
import { ContributionChart } from './ContributionChart';

function buildMockContributionData(): ContributionData {
  const weeks = [];
  const start = new Date('2024-03-20');
  start.setDate(start.getDate() - 363);

  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const count = (w * 7 + d) % 5;
      days.push({
        date: date.toISOString().split('T')[0],
        count,
        level: (count % 5) as 0 | 1 | 2 | 3 | 4,
      });
    }
    weeks.push({ days });
  }

  return {
    totalContributions: 364,
    weeks,
  };
}

const MOCK_DATA = buildMockContributionData();

describe('ContributionChart', () => {
  it('shows skeletons while loading', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    } as ReturnType<typeof hooks.useContributions>);
    render(<ContributionChart />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders total contributions count when loaded', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_DATA,
    } as ReturnType<typeof hooks.useContributions>);
    render(<ContributionChart />);
    expect(
      screen.getByText(/contributions in the last year/i),
    ).toBeInTheDocument();
  });

  it('renders one cell per contribution day', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_DATA,
    } as ReturnType<typeof hooks.useContributions>);
    render(<ContributionChart />);
    expect(screen.getAllByTestId('contribution-cell')).toHaveLength(52 * 7);
  });
});
