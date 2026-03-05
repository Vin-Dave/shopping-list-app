import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Store, ShoppingList } from '../lib/database.types';
import toast from 'react-hot-toast';

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <h1 className="font-display text-xl font-bold text-surface-50">
            {store.name}
          </h1>
          <p className="text-sm text-surface-400">
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
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Aktywne
          </h2>
          <div className="space-y-2">
            {activeLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                storeColor={store.color}
                onClick={() => navigate(`/list/${list.id}`)}
                onArchive={() => archiveList(list.id)}
              />
            ))}
          </div>
        </section>
      )}

      {completedLists.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Historia
          </h2>
          <div className="space-y-2">
            {completedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                storeColor={store.color}
                onClick={() => navigate(`/list/${list.id}`)}
                dimmed
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ListCard({
  list,
  storeColor,
  onClick,
  onArchive,
  dimmed,
}: {
  list: ShoppingList;
  storeColor: string;
  onClick: () => void;
  onArchive?: () => void;
  dimmed?: boolean;
}) {
  const date = new Date(list.created_at).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`card p-4 flex items-center justify-between cursor-pointer
                  hover:border-surface-600 transition-all active:scale-[0.99]
                  ${dimmed ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full"
          style={{ backgroundColor: list.status === 'active' ? storeColor : '#475569' }}
        />
        <div>
          <p className="text-surface-200 font-medium text-sm">
            {list.title || `Lista z ${date}`}
          </p>
          <p className="text-xs text-surface-500">{date}</p>
        </div>
      </div>

      {onArchive && list.status === 'active' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          className="btn-ghost text-xs text-surface-500"
        >
          Archiwizuj
        </button>
      )}
    </div>
  );
}
