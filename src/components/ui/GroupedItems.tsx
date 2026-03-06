import { getCategoryById, guessCategory } from '../../lib/categories';
import type { ListItem } from '../../lib/database.types';
import type { ReactNode } from 'react';

interface GroupedItemsProps {
  items: ListItem[];
  renderItem: (item: ListItem) => ReactNode;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  items: ListItem[];
}

export default function GroupedItems({ items, renderItem }: GroupedItemsProps) {
  if (items.length < 4) {
    return <div className="space-y-1">{items.map(renderItem)}</div>;
  }

  const groups: CategoryGroup[] = [];
  const groupMap = new Map<string, CategoryGroup>();

  for (const item of items) {
    const catId = guessCategory(item.name);
    let group = groupMap.get(catId);
    if (!group) {
      const cat = getCategoryById(catId);
      group = { id: catId, name: cat.name, icon: cat.icon, items: [] };
      groupMap.set(catId, group);
      groups.push(group);
    }
    group.items.push(item);
  }

  if (groups.length <= 1) {
    return <div className="space-y-1">{items.map(renderItem)}</div>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-sm">{group.icon}</span>
            <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
              {group.name} ({group.items.length})
            </span>
          </div>
          <div className="space-y-1">
            {group.items.map(renderItem)}
          </div>
        </div>
      ))}
    </div>
  );
}
