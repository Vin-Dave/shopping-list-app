import { useRef, useState, useCallback } from 'react';
import type { ReactNode, TouchEvent } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  leftLabel?: string;
  disabled?: boolean;
}

const THRESHOLD = 80;

export default function SwipeableRow({
  children,
  onSwipeLeft,
  leftLabel = 'Usuń',
  disabled,
}: SwipeableRowProps) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setSwiping(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swiping || disabled) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    if (diff < 0) {
      setOffset(Math.max(diff, -120));
    }
  }, [swiping, disabled]);

  const handleTouchEnd = useCallback(() => {
    if (!swiping) return;
    setSwiping(false);
    if (offset < -THRESHOLD && onSwipeLeft) {
      setOffset(-120);
      onSwipeLeft();
    }
    setOffset(0);
  }, [swiping, offset, onSwipeLeft]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="absolute inset-y-0 right-0 w-28 bg-red-500 flex items-center justify-center text-white text-sm font-medium"
        style={{ opacity: Math.min(Math.abs(offset) / THRESHOLD, 1) }}
      >
        {leftLabel}
      </div>
      <div
        className="relative z-10 transition-transform"
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
