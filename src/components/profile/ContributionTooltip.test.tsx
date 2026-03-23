import { render, screen } from '@testing-library/react';
import { ContributionTooltip } from './ContributionTooltip';

describe('ContributionTooltip', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440, writable: true });
  });

  it('shows "No contributions" when count is 0', () => {
    render(<ContributionTooltip date="2024-03-15" count={0} x={100} y={200} />);
    expect(screen.getByText('No contributions')).toBeInTheDocument();
  });

  it('uses singular form for count 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={1} x={100} y={200} />);
    expect(screen.getByText('1 contribution')).toBeInTheDocument();
  });

  it('uses plural form for count > 1', () => {
    render(<ContributionTooltip date="2024-03-15" count={7} x={100} y={200} />);
    expect(screen.getByText('7 contributions')).toBeInTheDocument();
  });

  it('formats date including day, month and year', () => {
    render(<ContributionTooltip date="2024-03-15" count={3} x={100} y={200} />);
    expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument();
  });

  it('positions the tooltip using x and y props', () => {
    render(<ContributionTooltip date="2024-03-15" count={3} x={80} y={250} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.left).toBe('80px');
    expect(el.style.top).toBe('242px'); // y - 8 = 250 - 8
  });
});
