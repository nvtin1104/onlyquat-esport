import {
  useState,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  children: ReactNode;
  side?: TooltipSide;
  delayMs?: number;
}

function Tooltip({ content, children, side = 'top', delayMs = 300, className, ...props }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  function show() {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const GAP = 6;

      let x = 0;
      let y = 0;

      switch (side) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top - GAP;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom + GAP;
          break;
        case 'left':
          x = rect.left - GAP;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + GAP;
          y = rect.top + rect.height / 2;
          break;
      }

      setCoords({ x, y });
      setVisible(true);
    }, delayMs);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  const positionStyle = (() => {
    switch (side) {
      case 'top':
        return {
          left: coords.x,
          top: coords.y,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: coords.x,
          top: coords.y,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: coords.x,
          top: coords.y,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: coords.x,
          top: coords.y,
          transform: 'translate(0, -50%)',
        };
    }
  })();

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      {visible &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[9999] pointer-events-none"
            style={positionStyle}
          >
            <div className="bg-bg-card border border-border-subtle px-2 py-1 text-xs text-text-primary rounded-sm whitespace-nowrap shadow-lg">
              {content}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export { Tooltip };
export type { TooltipProps, TooltipSide };
