import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const VIEWPORT_MARGIN = 8;

interface TooltipProps {
  title: string;
  content: string;
  x: number;
  y: number;
}

export function Tooltip({ title, content, x, y }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [clampedLeft, setClampedLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const width = ref.current.offsetWidth;
    const raw = x - width / 2;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    setClampedLeft(Math.max(VIEWPORT_MARGIN, Math.min(raw, maxLeft)));
  }, [x]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-50 px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none bg-text text-bg shadow-sm"
      style={{
        left: clampedLeft ?? x,
        top: y - 8,
        transform: clampedLeft !== null ? 'translateY(-100%)' : 'translateX(-50%) translateY(-100%)',
        visibility: clampedLeft !== null ? 'visible' : 'hidden',
      }}
    >
      <div className="font-semibold">{title}</div>
      <div className="opacity-80">{content}</div>
    </div>,
    document.body,
  );
}
