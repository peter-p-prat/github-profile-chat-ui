import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts a className prop', () => {
    const { container } = render(<Spinner className="text-green-500" />);
    expect(container.querySelector('svg')).toHaveClass('text-green-500');
  });
});
