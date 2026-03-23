import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440, writable: true });
  });

  it('renders the title', () => {
    render(<Tooltip title="5 contributions" content="Monday, Mar 10, 2025" x={100} y={200} />);
    expect(screen.getByText('5 contributions')).toBeInTheDocument();
  });

  it('renders the content', () => {
    render(<Tooltip title="5 contributions" content="Monday, Mar 10, 2025" x={100} y={200} />);
    expect(screen.getByText('Monday, Mar 10, 2025')).toBeInTheDocument();
  });

  it('renders into document.body via portal', () => {
    const { container } = render(
      <Tooltip title="5 contributions" content="Monday, Mar 10, 2025" x={100} y={200} />,
    );
    // The tooltip is portaled — it must not be inside the render container
    expect(container.querySelector('[class*="fixed"]')).toBeNull();
    expect(document.body.querySelector('[class*="fixed"]')).toBeInTheDocument();
  });

  it('applies x and y positioning styles', () => {
    render(<Tooltip title="5 contributions" content="Monday, Mar 10, 2025" x={150} y={300} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.left).toBe('150px');
    expect(el.style.top).toBe('292px'); // y - 8 = 300 - 8
  });

  it('clamps left to viewport right edge', () => {
    const viewportWidth = 400;
    const tooltipWidth = 120;
    const viewportMargin = 8;
    const anchorX = 390;
    const anchorY = 300;
    const expectedClampedLeft = viewportWidth - tooltipWidth - viewportMargin;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: viewportWidth,
      writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => tooltipWidth,
    });
    render(<Tooltip title="Test" content="Content" x={anchorX} y={anchorY} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.left).toBe(`${expectedClampedLeft}px`);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 0 });
  });

  it('clamps left to viewport left edge', () => {
    const viewportWidth = 400;
    const tooltipWidth = 120;
    const viewportMargin = 8;
    const anchorX = 10;
    const anchorY = 300;
    const expectedClampedLeft = viewportMargin;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: viewportWidth,
      writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => tooltipWidth,
    });
    render(<Tooltip title="Test" content="Content" x={anchorX} y={anchorY} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.left).toBe(`${expectedClampedLeft}px`);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 0 });
  });

  it('does not clamp when anchor is centered', () => {
    const tooltipWidth = 120;
    const anchorX = 720;
    const anchorY = 300;
    const expectedLeft = anchorX - tooltipWidth / 2;

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => tooltipWidth,
    });
    render(<Tooltip title="Test" content="Content" x={anchorX} y={anchorY} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.left).toBe(`${expectedLeft}px`);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 0 });
  });

  it('is visible after measurement', () => {
    render(<Tooltip title="Test" content="Content" x={200} y={300} />);
    const el = document.body.querySelector('[class*="fixed"]') as HTMLElement;
    expect(el.style.visibility).toBe('visible');
  });
});
