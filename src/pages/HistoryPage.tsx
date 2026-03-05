import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ShoppingList } from '../lib/database.types';

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

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="font-display text-xl font-bold text-surface-50 mb-6">
        Historia zakupów
      </h1>

      {lists.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-surface-400">Brak zakończonych list</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map((list) => {
            const date = list.completed_at
              ? new Date(list.completed_at).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '';

            return (
              <div
                key={list.id}
                onClick={() => navigate(`/list/${list.id}`)}
                className="card p-4 flex items-center gap-3 cursor-pointer
                           hover:border-surface-600 transition-all active:scale-[0.99]"
              >
                <span className="text-xl">{list.store_icon || '🏪'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-surface-200 font-medium text-sm truncate">
                    {list.store_name || 'Sklep'} — {list.title || 'Lista'}
                  </p>
                  <p className="text-xs text-surface-500">{date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
