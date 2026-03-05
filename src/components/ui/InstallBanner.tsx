import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="card mx-4 mb-4 p-4 flex items-center gap-3 animate-slide-up border-brand-500/30">
      <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-xl flex-shrink-0">
        📲
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
          Zainstaluj aplikację
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Dodaj do ekranu głównego
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={dismiss} className="btn-ghost text-xs py-1.5 px-2">
          Nie
        </button>
        <button onClick={install} className="btn-primary text-xs py-1.5 px-3">
          Instaluj
        </button>
      </div>
    </div>
  );
}
