import { Shield, Zap, Eye, Wrench, LayoutGrid } from 'lucide-react';
import { Category, Finding } from '../../types/scan';

interface CategoryTabsProps {
  findings: Finding[];
  active: Category | 'all';
  onChange: (cat: Category | 'all') => void;
}

const TABS: { key: Category | 'all'; label: string; icon: typeof Shield }[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'performance', label: 'Performance', icon: Zap },
  { key: 'accessibility', label: 'Accessibility', icon: Eye },
  { key: 'functional', label: 'Functional', icon: Wrench }
];

export default function CategoryTabs({ findings, active, onChange }: CategoryTabsProps) {
  const count = (k: Category | 'all') =>
    k === 'all' ? findings.length : findings.filter(f => f.category === k).length;

  return (
    <div className="overflow-x-auto mb-4 -mx-1">
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-max min-w-full sm:w-fit mx-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={12} />
              <span className="hidden xs:inline sm:inline">{label}</span>
              <span className={`text-[10px] px-1 rounded font-semibold ${isActive ? 'bg-gray-100 text-gray-600' : 'text-gray-400'}`}>
                {count(key)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
