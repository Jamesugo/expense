import { CATEGORY_ICONS } from '../../utils/categories.js';

export function CategoryBadge({ category, size = 'sm' }) {
  const icon = CATEGORY_ICONS[category] || '📌';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`badge cat-${category} ${sizeClass} font-medium`}>
      <span className="mr-1">{icon}</span>
      {category}
    </span>
  );
}

export function StatusBadge({ label, color }) {
  const colorMap = {
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`badge ${colorMap[color] || colorMap.blue} text-xs font-medium`}>
      {label}
    </span>
  );
}
