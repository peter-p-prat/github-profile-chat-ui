import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('applies inline width and height', () => {
    const { container } = render(<Skeleton width="120px" height="16px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('16px');
  });

  it('merges extra className', () => {
    const { container } = render(<Skeleton className="rounded-full" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('renders with data-testid skeleton', () => {
    const { getByTestId } = render(<Skeleton />);
    expect(getByTestId('skeleton')).toBeInTheDocument();
  });
});
