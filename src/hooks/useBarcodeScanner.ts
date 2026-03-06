import { useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerState {
  scanning: boolean;
  error: string | null;
}

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [state, setState] = useState<ScannerState>({ scanning: false, error: null });

  const start = useCallback(async (elementId: string) => {
    if (scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;
      setState({ scanning: true, error: null });

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          onScan(decodedText);
          stop();
        },
        () => {}
      );
    } catch (err) {
      setState({ scanning: false, error: 'Nie udało się uruchomić kamery' });
      scannerRef.current = null;
    }
  }, [onScan]);

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setState({ scanning: false, error: null });
  }, []);

  return { ...state, start, stop };
}
