import { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallBanner() {
  const { canInstall, install, dismiss, showIOSInstructions } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (!canInstall) return null;

  return (
    <>
      <div className="card mb-4 p-4 flex items-center gap-3 animate-slide-up border-brand-500/30">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-xl flex-shrink-0">
          📲
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
            Zainstaluj aplikację
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Dodaj skrót na ekranie głównym
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={dismiss} className="btn-ghost text-xs py-1.5 px-2">
            Nie
          </button>
          <button
            onClick={showIOSInstructions ? () => setShowGuide(true) : install}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Instaluj
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuide(false)} />
          <div className="card p-6 w-full max-w-sm relative animate-slide-up mb-4 mx-4">
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-100 mb-4">
              Jak zainstalować na iOS
            </h3>
            <ol className="space-y-4 text-sm text-surface-600 dark:text-surface-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>
                  Kliknij ikonę <strong>Udostępnij</strong>{' '}
                  <svg className="inline w-5 h-5 -mt-0.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>{' '}
                  na dole ekranu
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Przewiń w dół i wybierz <strong>„Dodaj do ekranu początkowego"</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Kliknij <strong>„Dodaj"</strong> — gotowe!</span>
              </li>
            </ol>
            <button
              onClick={() => { setShowGuide(false); dismiss(); }}
              className="btn-primary w-full mt-6 text-sm"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}
    </>
  );
}
