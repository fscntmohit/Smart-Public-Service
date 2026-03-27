import { Trash2, Zap, Droplet, Map, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { id: 'Waste', label: 'Waste', icon: Trash2, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', active: 'ring-amber-500' },
  { id: 'Electricity', label: 'Electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200', active: 'ring-yellow-500' },
  { id: 'Water', label: 'Water', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', active: 'ring-blue-500' },
  { id: 'Road', label: 'Road', icon: Map, color: 'text-slate-600', bg: 'bg-slate-200', border: 'border-slate-300', active: 'ring-slate-500' },
  { id: 'Other', label: 'Other', icon: MoreHorizontal, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200', active: 'ring-indigo-500' },
];

export default function CategorySelector({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = value === cat.id;

        return (
          <button
            type="button"
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 ${isSelected
                ? `${cat.bg} border-${cat.border.split('-')[1]}-400 ring-2 ${cat.active} shadow-sm scale-[1.02]`
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isSelected ? 'bg-white shadow-sm' : cat.bg}`}>
              <Icon className={`w-5 h-5 ${cat.color}`} />
            </div>
            <span className={`text-xs font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
              {t(`category.${cat.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
