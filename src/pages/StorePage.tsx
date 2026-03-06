import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Store, ShoppingList } from '../lib/database.types';
import toast from 'react-hot-toast';
import { StorePageSkeleton } from '../components/ui/Skeleton';
import SwipeableRow from '../components/ui/SwipeableRow';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const fetchData = async () => {
    const [storeRes, listsRes] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId!).single(),
      supabase
        .from('shopping_lists')
        .select('*')
        .eq('store_id', storeId!)
        .order('created_at', { ascending: false }),
    ]);

    if (storeRes.error) {
      toast.error('Nie znaleziono sklepu');
      navigate('/');
      return;
    }

    setStore(storeRes.data);
    setLists(listsRes.data || []);
    setLoading(false);
  };

  const createList = async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        store_id: storeId!,
        user_id: user!.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      toast.error('Nie udało się utworzyć listy');
    } else {
      navigate(`/list/${data.id}`);
    }
  };

  const archiveList = async (listId: string) => {
    setArchiveTarget(null);
    const { error } = await supabase
      .from('shopping_lists')
      .update({ status: 'archived' })
      .eq('id', listId);

    if (error) {
      toast.error('Nie udało się zarchiwizować listy');
    } else {
      setLists(lists.map((l) => (l.id === listId ? { ...l, status: 'archived' as const } : l)));
      toast.success('Lista zarchiwizowana');
    }
  };

  const restoreList = async (listId: string) => {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ status: 'active', completed_at: null })
      .eq('id', listId);

    if (error) {
      toast.error('Nie udalo sie przywrocic listy');
    } else {
      setLists(lists.map((l) => (l.id === listId ? { ...l, status: 'active' as const, completed_at: null } : l)));
      toast.success('Lista przywrocona');
    }
  };

  const deleteList = async (listId: string) => {
    setDeleteTarget(null);
    const { error: itemsError } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId);

    if (itemsError) {
      toast.error('Nie udalo sie usunac listy');
      return;
    }

    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId);

    if (error) {
      toast.error('Nie udalo sie usunac listy');
    } else {
      setLists(lists.filter((l) => l.id !== listId));
      toast.success('Lista usunieta');
    }
  };

  if (loading) return <StorePageSkeleton />;
  if (!store) return null;

  const activeLists = lists.filter((l) => l.status === 'active');
  const completedLists = lists.filter((l) => l.status === 'completed' || l.status === 'archived');

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${store.color}20` }}
        >
          {store.icon}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
            {store.name}
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {activeLists.length} {activeLists.length === 1 ? 'aktywna lista' : 'aktywnych list'}
          </p>
        </div>
      </div>

      <button onClick={createList} className="btn-primary w-full mb-6 flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nowa lista zakupów
      </button>

      {activeLists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
            Aktywne
          </h2>
          <div className="space-y-2">
            {activeLists.map((list) => (
              <SwipeableRow
                key={list.id}
                onSwipeLeft={() => setArchiveTarget(list.id)}
                leftLabel="Archiwizuj"
              >
                <ListCard
                  list={list}
                  storeColor={store.color}
                  onClick={() => navigate(`/list/${list.id}`)}
                  onArchive={() => setArchiveTarget(list.id)}
                />
              </SwipeableRow>
            ))}
          </div>
        </section>
      )}

      {completedLists.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
            Historia
          </h2>
          <div className="space-y-2">
            {completedLists.map((list) => (
              <SwipeableRow
                key={list.id}
                onSwipeLeft={() => setDeleteTarget(list.id)}
                onSwipeRight={() => restoreList(list.id)}
                leftLabel="Usun"
                rightLabel="Przywroc"
              >
                <ListCard
                  list={list}
                  storeColor={store.color}
                  onClick={() => navigate(`/list/${list.id}`)}
                  onRestore={() => restoreList(list.id)}
                  onDelete={() => setDeleteTarget(list.id)}
                  dimmed
                />
              </SwipeableRow>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archiwizuj liste"
        message="Przeniesc te liste do archiwum?"
        confirmLabel="Archiwizuj"
        onConfirm={() => archiveTarget && archiveList(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Usun liste"
        message="Czy na pewno chcesz trwale usunac te liste? Tej operacji nie mozna cofnac."
        confirmLabel="Usun"
        danger
        onConfirm={() => deleteTarget && deleteList(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ListCard({
  list,
  storeColor,
  onClick,
  onArchive,
  onRestore,
  onDelete,
  dimmed,
}: {
  list: ShoppingList;
  storeColor: string;
  onClick: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  dimmed?: boolean;
}) {
  const date = new Date(list.created_at).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel =
    list.status === 'completed' ? 'Zakonczona' : list.status === 'archived' ? 'Archiwalna' : null;

  return (
    <div
      className={`card p-4 flex items-center justify-between cursor-pointer
                  hover:border-surface-300 dark:hover:border-surface-600 transition-all active:scale-[0.99]
                  ${dimmed ? 'opacity-60 hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-2 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: list.status === 'active' ? storeColor : '#475569' }}
        />
        <div className="min-w-0">
          <p className="text-surface-700 dark:text-surface-200 font-medium text-sm truncate">
            {list.title || `Lista z ${date}`}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-surface-400 dark:text-surface-500">{date}</p>
            {statusLabel && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                {statusLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        {onArchive && list.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="btn-ghost text-xs text-surface-500 px-2 py-1"
          >
            Archiwizuj
          </button>
        )}
        {onRestore && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="btn-ghost text-xs text-brand-500 px-2 py-1"
            aria-label="Przywroc liste"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn-ghost text-xs text-surface-400 hover:text-red-500 px-2 py-1"
            aria-label="Usun liste"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
