import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { ShoppingList, ListItem, Product } from '../lib/database.types';
import toast from 'react-hot-toast';
import { ShoppingListSkeleton } from '../components/ui/Skeleton';
import SwipeableRow from '../components/ui/SwipeableRow';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function ShoppingListPage() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('szt');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listId) fetchData();
  }, [listId]);

  const fetchData = async () => {
    const [listRes, itemsRes, productsRes] = await Promise.all([
      supabase.from('shopping_lists').select('*').eq('id', listId!).single(),
      supabase
        .from('list_items')
        .select('*')
        .eq('list_id', listId!)
        .order('position', { ascending: true }),
      supabase
        .from('products')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(200),
    ]);

    if (listRes.error) {
      toast.error('Nie znaleziono listy');
      navigate('/');
      return;
    }

    setList(listRes.data);
    setItems(itemsRes.data || []);
    setProducts(productsRes.data || []);
    setLoading(false);
  };

  const handleNameChange = useCallback(
    (value: string) => {
      setNewItemName(value);
      if (value.length >= 2) {
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    },
    [products]
  );

  const selectSuggestion = (product: Product) => {
    setNewItemName(product.name);
    setNewItemUnit(product.default_unit);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const name = newItemName.trim();
    const quantity = parseFloat(newItemQty) || 1;

    let productId: string | null = null;
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (existingProduct) {
      productId = existingProduct.id;
      await supabase
        .from('products')
        .update({ usage_count: existingProduct.usage_count + 1 })
        .eq('id', existingProduct.id);
    } else {
      const { data: newProduct } = await supabase
        .from('products')
        .insert({
          name,
          default_unit: newItemUnit,
          usage_count: 1,
          user_id: user!.id,
        })
        .select()
        .single();

      if (newProduct) {
        productId = newProduct.id;
        setProducts([newProduct, ...products]);
      }
    }

    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId!,
        product_id: productId,
        name,
        quantity,
        unit: newItemUnit,
        is_checked: false,
        position: items.length,
      })
      .select()
      .single();

    if (error) {
      toast.error('Nie udało się dodać produktu');
    } else {
      setItems([...items, data]);
      setNewItemName('');
      setNewItemQty('1');
      setNewItemUnit('szt');
      inputRef.current?.focus();
    }
  };

  const toggleCheck = async (item: ListItem) => {
    const newChecked = !item.is_checked;
    setItems(items.map((i) => (i.id === item.id ? { ...i, is_checked: newChecked } : i)));

    const { error } = await supabase
      .from('list_items')
      .update({ is_checked: newChecked })
      .eq('id', item.id);

    if (error) {
      setItems(items.map((i) => (i.id === item.id ? { ...i, is_checked: !newChecked } : i)));
      toast.error('Błąd przy aktualizacji');
    }
  };

  const deleteItem = async (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);
    if (error) {
      toast.error('Nie udało się usunąć');
      fetchData();
    }
  };

  const completeList = async () => {
    setShowCompleteDialog(false);

    const { error } = await supabase
      .from('shopping_lists')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', listId!);

    if (error) {
      toast.error('Nie udało się zakończyć listy');
    } else {
      toast.success('Lista zakończona!');
      navigate(-1);
    }
  };

  const handleComplete = () => {
    const unchecked = items.filter((i) => !i.is_checked);
    if (unchecked.length > 0) {
      setShowCompleteDialog(true);
    } else {
      completeList();
    }
  };

  if (loading) return <ShoppingListSkeleton />;
  if (!list) return null;

  const uncheckedItems = items.filter((i) => !i.is_checked);
  const checkedItems = items.filter((i) => i.is_checked);
  const isReadOnly = list.status !== 'active';
  const progress = items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0;

  return (
    <div className="page-container pb-32">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
          {list.title || 'Lista zakupów'}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-surface-500 dark:text-surface-400 tabular-nums">
            {checkedItems.length}/{items.length}
          </span>
        </div>
      </div>

      {!isReadOnly && (
        <form onSubmit={addItem} className="card p-4 mb-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={newItemName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => newItemName.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="input-field pr-20"
              placeholder="Dodaj produkt..."
              autoComplete="off"
            />

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden z-10 shadow-xl">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={() => selectSuggestion(product)}
                    className="w-full text-left px-4 py-2.5 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm flex items-center justify-between transition-colors"
                  >
                    <span>{product.name}</span>
                    <span className="text-xs text-surface-400 dark:text-surface-500">
                      {product.category || product.default_unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="input-field w-20 text-center"
              min="0.1"
              step="0.1"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="input-field w-24"
            >
              <option value="szt">szt</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
              <option value="opak">opak</option>
            </select>
            <button type="submit" className="btn-primary flex-1">
              Dodaj
            </button>
          </div>
        </form>
      )}

      {uncheckedItems.length > 0 && (
        <section className="space-y-1 mb-6">
          {uncheckedItems.map((item) => (
            <SwipeableRow
              key={item.id}
              onSwipeLeft={() => deleteItem(item.id)}
              disabled={isReadOnly}
            >
              <ItemRow
                item={item}
                onToggle={() => toggleCheck(item)}
                onDelete={() => deleteItem(item.id)}
                readOnly={isReadOnly}
              />
            </SwipeableRow>
          ))}
        </section>
      )}

      {checkedItems.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">
            Odchaczone ({checkedItems.length})
          </h3>
          <div className="space-y-1">
            {checkedItems.map((item) => (
              <SwipeableRow
                key={item.id}
                onSwipeLeft={() => deleteItem(item.id)}
                disabled={isReadOnly}
              >
                <ItemRow
                  item={item}
                  onToggle={() => toggleCheck(item)}
                  onDelete={() => deleteItem(item.id)}
                  readOnly={isReadOnly}
                />
              </SwipeableRow>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📝</span>
          <p className="text-surface-500 dark:text-surface-400">
            Lista jest pusta. Dodaj pierwszy produkt!
          </p>
        </div>
      )}

      {!isReadOnly && items.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleComplete}
              className="btn-primary w-full bg-green-600 hover:bg-green-700 active:bg-green-800
                         flex items-center justify-center gap-2 shadow-lg shadow-green-900/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Zakończ zakupy
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showCompleteDialog}
        title="Zakończ zakupy"
        message={`Masz ${items.filter((i) => !i.is_checked).length} nieodchaczonych produktów. Zakończyć mimo to?`}
        confirmLabel="Zakończ"
        onConfirm={completeList}
        onCancel={() => setShowCompleteDialog(false)}
      />
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
  readOnly,
}: {
  item: ListItem;
  onToggle: () => void;
  onDelete: () => void;
  readOnly: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${item.is_checked
                    ? 'bg-surface-100/50 dark:bg-surface-800/20'
                    : 'bg-surface-100 dark:bg-surface-800/40 hover:bg-surface-200 dark:hover:bg-surface-800/60'}`}
    >
      <button
        onClick={onToggle}
        disabled={readOnly}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${item.is_checked
                      ? 'bg-brand-600 border-brand-600 animate-check'
                      : 'border-surface-300 dark:border-surface-600 hover:border-brand-500'
                    }`}
        aria-label={item.is_checked ? `Odznacz ${item.name}` : `Zaznacz ${item.name}`}
      >
        {item.is_checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm transition-all ${
            item.is_checked ? 'text-surface-400 dark:text-surface-500 line-through' : 'text-surface-800 dark:text-surface-100'
          }`}
        >
          {item.name}
        </span>
      </div>

      <span className="text-xs text-surface-500 dark:text-surface-400 flex-shrink-0 tabular-nums">
        {item.quantity} {item.unit}
      </span>

      {!readOnly && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-surface-400 dark:text-surface-500 hover:text-red-400
                     transition-all p-1 flex-shrink-0"
          aria-label={`Usuń ${item.name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
