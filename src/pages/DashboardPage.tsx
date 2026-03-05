import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Store } from '../lib/database.types';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContextMenu from '../components/ui/ContextMenu';
import InstallBanner from '../components/ui/InstallBanner';

const STORE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

const STORE_ICONS = [
  '🏪', '🛒', '🛍️', '🏬', '🥖', '🥩', '💊', '🏠',
];

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      toast.error('Nie udało się załadować sklepów');
    } else {
      setStores(data || []);
    }
    setLoading(false);
  };

  const addStore = async (name: string, color: string, icon: string) => {
    const { data, error } = await supabase
      .from('stores')
      .insert({
        name,
        color,
        icon,
        user_id: user!.id,
        position: stores.length,
      })
      .select()
      .single();

    if (error) {
      toast.error('Nie udało się dodać sklepu');
    } else {
      setStores([...stores, data]);
      setShowAddModal(false);
      toast.success(`Dodano ${name}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleteTarget(null);

    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) {
      toast.error('Nie udało się usunąć sklepu');
    } else {
      setStores(stores.filter((s) => s.id !== id));
      toast.success(`Usunięto ${name}`);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="page-container">
      <InstallBanner />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
          Twoje sklepy
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm py-2 px-4"
        >
          + Dodaj sklep
        </button>
      </div>

      {stores.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="text-4xl mb-4 block">🏪</span>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            Nie masz jeszcze żadnych sklepów.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-sm"
          >
            Dodaj pierwszy sklep
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stores.map((store, i) => (
            <ContextMenu
              key={store.id}
              items={[
                {
                  label: 'Otwórz',
                  onClick: () => navigate(`/store/${store.id}`),
                },
                {
                  label: 'Usuń sklep',
                  danger: true,
                  onClick: () => setDeleteTarget({ id: store.id, name: store.name }),
                },
              ]}
            >
              <StoreCard
                store={store}
                index={i}
                onClick={() => navigate(`/store/${store.id}`)}
                onDelete={() => setDeleteTarget({ id: store.id, name: store.name })}
              />
            </ContextMenu>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddStoreModal
          onAdd={addStore}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Usuń sklep"
        message={`Usunąć sklep "${deleteTarget?.name}" i wszystkie jego listy?`}
        confirmLabel="Usuń"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StoreCard({
  store,
  index,
  onClick,
  onDelete,
}: {
  store: Store;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="card p-4 cursor-pointer hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-200
                 active:scale-[0.97] animate-slide-up relative group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                   text-surface-400 dark:text-surface-500 hover:text-red-400 transition-all p-1"
        aria-label={`Usuń ${store.name}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
        style={{ backgroundColor: `${store.color}20`, borderColor: `${store.color}40` }}
      >
        {store.icon}
      </div>
      <h3 className="font-display font-semibold text-surface-800 dark:text-surface-100 truncate">
        {store.name}
      </h3>
      <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
        Kliknij aby otworzyć
      </p>
    </div>
  );
}

function AddStoreModal({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, color: string, icon: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(STORE_COLORS[0]);
  const [icon, setIcon] = useState(STORE_ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color, icon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="card p-6 w-full max-w-sm relative animate-slide-up">
        <h2 className="font-display text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">
          Nowy sklep
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
              Nazwa sklepu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="np. Biedronka, Lidl..."
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
              Ikona
            </label>
            <div className="flex gap-2 flex-wrap">
              {STORE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-brand-600/30 ring-2 ring-brand-500'
                      : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
              Kolor
            </label>
            <div className="flex gap-2 flex-wrap">
              {STORE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-800' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Anuluj
            </button>
            <button type="submit" className="btn-primary flex-1">
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
