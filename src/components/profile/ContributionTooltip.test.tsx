import { render, screen } from '@testing-library/react';
import { ContributionTooltip } from './ContributionTooltip';

describe('ContributionTooltip', () => {
  it('shows "No contributions" when count is 0', () => {
    render(<ContributionTooltip date="2024-03-15" count={0} />);
    expect(screen.getByText('No contributions')).toBeInTheDocument();
  });

  it('uses singular form for count 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={1} />);
    expect(screen.getByText('1 contribution')).toBeInTheDocument();
  });

  it('uses plural form for count > 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={7} />);
    expect(screen.getByText('7 contributions')).toBeInTheDocument();
  });

  it('formats date as "Month Day, Year"', () => {
    render(<ContributionTooltip date="2024-03-15" count={3} />);
    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
  });
});
