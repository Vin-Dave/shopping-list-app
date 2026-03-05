import { useRef, useState, useCallback, useEffect } from 'react';
import type { ReactNode, TouchEvent as ReactTouchEvent } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
}

const LONG_PRESS_DURATION = 500;

export default function ContextMenu({ children, items, disabled }: ContextMenuProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      timerRef.current = setTimeout(() => {
        setPosition({ x: touch.clientX, y: touch.clientY });
        setOpen(true);
        if (navigator.vibrate) navigator.vibrate(30);
      }, LONG_PRESS_DURATION);
    },
    [disabled]
  );

  const handleTouchMove = useCallback(() => clear(), [clear]);
  const handleTouchEnd = useCallback(() => clear(), [clear]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          if (disabled) return;
          e.preventDefault();
          setPosition({ x: e.clientX, y: e.clientY });
          setOpen(true);
        }}
      >
        {children}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            ref={menuRef}
            className="absolute bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700
                       rounded-xl shadow-2xl overflow-hidden min-w-[180px] animate-scale-in z-10"
            style={{
              left: Math.min(position.x, window.innerWidth - 200),
              top: Math.min(position.y, window.innerHeight - items.length * 48 - 16),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors
                  ${item.danger
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
