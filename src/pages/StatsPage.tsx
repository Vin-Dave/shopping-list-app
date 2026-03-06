import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { guessCategory, getCategoryById } from '../lib/categories';

interface TopProduct {
  name: string;
  count: number;
  category: string;
}

interface MonthlyActivity {
  month: string;
  count: number;
}

interface StoreStats {
  name: string;
  icon: string;
  listCount: number;
}

export default function StatsPage() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activity, setActivity] = useState<MonthlyActivity[]>([]);
  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [productsRes, listsRes, storesRes] = await Promise.all([
      supabase
        .from('products')
        .select('name, usage_count, category')
        .order('usage_count', { ascending: false })
        .limit(10),
      supabase
        .from('shopping_lists')
        .select('completed_at, store_id')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(100),
      supabase.from('stores').select('id, name, icon'),
    ]);

    if (productsRes.data) {
      setTopProducts(
        productsRes.data.map((p) => ({
          name: p.name,
          count: p.usage_count,
          category: p.category || guessCategory(p.name),
        }))
      );
    }

    if (listsRes.data) {
      const monthMap = new Map<string, number>();
      for (const list of listsRes.data) {
        if (!list.completed_at) continue;
        const date = new Date(list.completed_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }

      const months: MonthlyActivity[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('pl-PL', { month: 'short' });
        months.push({ month: label, count: monthMap.get(key) || 0 });
      }
      setActivity(months);

      if (storesRes.data) {
        const storeMap = new Map<string, number>();
        for (const list of listsRes.data) {
          storeMap.set(list.store_id, (storeMap.get(list.store_id) || 0) + 1);
        }

        setStoreStats(
          storesRes.data
            .map((s) => ({ name: s.name, icon: s.icon, listCount: storeMap.get(s.id) || 0 }))
            .filter((s) => s.listCount > 0)
            .sort((a, b) => b.listCount - a.listCount)
        );
      }
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

  const maxActivity = Math.max(...activity.map((a) => a.count), 1);

  return (
    <div className="page-container">
      <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50 mb-6">
        Statystyki
      </h1>

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Aktywność (ostatnie 6 mies.)
        </h2>
        {activity.every((a) => a.count === 0) ? (
          <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">
            Brak danych — zakończ pierwszą listę zakupów
          </p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {activity.map((a) => (
              <div key={a.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-surface-500 dark:text-surface-400 tabular-nums">
                  {a.count || ''}
                </span>
                <div
                  className="w-full bg-brand-500/80 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max((a.count / maxActivity) * 64, a.count > 0 ? 4 : 0)}px`,
                  }}
                />
                <span className="text-[10px] text-surface-400 dark:text-surface-500">
                  {a.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Najczęściej kupowane
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">
            Brak danych
          </p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((product, i) => {
              const cat = getCategoryById(product.category);
              return (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-surface-400 dark:text-surface-500 w-5 text-right">
                    {i + 1}
                  </span>
                  <span className="text-sm">{cat.icon}</span>
                  <span className="flex-1 text-sm text-surface-700 dark:text-surface-200 truncate">
                    {product.name}
                  </span>
                  <span className="text-xs text-surface-400 dark:text-surface-500 tabular-nums">
                    {product.count}x
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {storeStats.length > 0 && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
            Ulubione sklepy
          </h2>
          <div className="space-y-2">
            {storeStats.map((store) => (
              <div key={store.name} className="flex items-center gap-3">
                <span className="text-lg">{store.icon}</span>
                <span className="flex-1 text-sm text-surface-700 dark:text-surface-200">
                  {store.name}
                </span>
                <span className="text-xs text-surface-400 dark:text-surface-500">
                  {store.listCount} {store.listCount === 1 ? 'lista' : 'list'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
