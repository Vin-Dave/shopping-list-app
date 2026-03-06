import { useEffect, useId } from 'react';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const elementId = useId().replace(/:/g, '-') + '-scanner';
  const { scanning, error, start, stop } = useBarcodeScanner(onScan);

  useEffect(() => {
    const timer = setTimeout(() => start(elementId), 100);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 animate-scale-in">
        <div className="card overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-surface-200 dark:border-surface-700">
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-100">
              Skanuj kod kreskowy
            </h3>
            <button onClick={onClose} className="btn-ghost p-2" aria-label="Zamknij">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative bg-black aspect-[3/2]">
            <div id={elementId} className="w-full h-full" />
            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button onClick={onClose} className="btn-secondary text-sm">
                Zamknij
              </button>
            </div>
          )}

          <p className="p-3 text-xs text-center text-surface-400 dark:text-surface-500">
            Skieruj kamerę na kod kreskowy produktu
          </p>
        </div>
      </div>
    </div>
  );
}
