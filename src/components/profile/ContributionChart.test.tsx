import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ContributionChart } from './ContributionChart';
import * as hooks from '../../hooks/useContributions';
import type { ContributionDay } from '../../api/github.types';

const MOCK_CONTRIBUTIONS: ContributionDay[] = Array.from(
  { length: 365 },
  (_, i) => ({
    date: (() => {
      const date = new Date('2024-03-20');
      date.setDate(date.getDate() - (364 - i));
      return date.toISOString().split('T')[0];
    })(),
    count: i % 5,
    level: (i % 5) as 0 | 1 | 2 | 3 | 4,
  }),
);

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

  it('renders the "Contribution activity" heading when loaded', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_CONTRIBUTIONS,
    } as ReturnType<typeof hooks.useContributions>);
    render(<ContributionChart />);
    expect(screen.getByText('Contribution activity')).toBeInTheDocument();
  });

  it('renders one cell per contribution day', () => {
    vi.spyOn(hooks, 'useContributions').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_CONTRIBUTIONS,
    } as ReturnType<typeof hooks.useContributions>);
    render(<ContributionChart />);
    expect(screen.getAllByTestId('contribution-cell')).toHaveLength(365);
  });
});
