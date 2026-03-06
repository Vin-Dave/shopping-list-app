import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ShoppingList } from '../lib/database.types';
import { HistorySkeleton } from '../components/ui/Skeleton';
import SwipeableRow from '../components/ui/SwipeableRow';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface HistoryListItem extends ShoppingList {
  store_name?: string;
  store_icon?: string;
}

interface ListWithStore extends ShoppingList {
  stores: { name: string; icon: string } | null;
}

export default function HistoryPage() {
  const [lists, setLists] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('shopping_lists')
      .select('*, stores(name, icon)')
      .in('status', ['completed', 'archived'])
      .order('completed_at', { ascending: false })
      .limit(50);

    if (data) {
      setLists(
        (data as ListWithStore[]).map((item) => ({
          ...item,
          store_name: item.stores?.name,
          store_icon: item.stores?.icon,
        }))
      );
    }
    setLoading(false);
  };

  const restoreList = async (listId: string) => {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ status: 'active', completed_at: null })
      .eq('id', listId);

    if (error) {
      toast.error('Nie udalo sie przywrocic listy');
    } else {
      setLists(lists.filter((l) => l.id !== listId));
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

  if (loading) return <HistorySkeleton />;

  return (
    <div className="page-container">
      <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50 mb-6">
        Historia zakupow
      </h1>

      {lists.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-surface-500 dark:text-surface-400">Brak zakonczonych list</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map((list, i) => {
            const date = list.completed_at
              ? new Date(list.completed_at).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date(list.created_at).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });

            const statusLabel =
              list.status === 'completed' ? 'Zakonczona' : 'Archiwalna';

            return (
              <SwipeableRow
                key={list.id}
                onSwipeLeft={() => setDeleteTarget(list.id)}
                onSwipeRight={() => restoreList(list.id)}
                leftLabel="Usun"
                rightLabel="Przywroc"
              >
                <div
                  onClick={() => navigate(`/list/${list.id}`)}
                  className="card p-4 flex items-center gap-3 cursor-pointer
                             hover:border-surface-300 dark:hover:border-surface-600 transition-all active:scale-[0.99]
                             animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="text-xl flex-shrink-0">{list.store_icon || '🏪'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-700 dark:text-surface-200 font-medium text-sm truncate">
                      {list.store_name || 'Sklep'} — {list.title || 'Lista'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-surface-400 dark:text-surface-500">{date}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreList(list.id);
                      }}
                      className="btn-ghost text-brand-500 p-2"
                      aria-label="Przywroc liste"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(list.id);
                      }}
                      className="btn-ghost text-surface-400 hover:text-red-500 p-2"
                      aria-label="Usun liste"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </SwipeableRow>
            );
          })}
        </div>
      )}

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
