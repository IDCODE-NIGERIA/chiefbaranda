'use client';

import type { Condition } from '../lib/carData';

type TabOption = 'all' | Condition;

type ConditionTabsProps = {
  active: TabOption;
  onChange: (value: TabOption) => void;
};

const tabs: { value: TabOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'brand-new', label: 'Brand New' },
  { value: 'foreign-used', label: 'Foreign Used' },
  { value: 'nigerian-used', label: 'Nigerian Used' },
];

export default function ConditionTabs({ active, onChange }: ConditionTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'rounded-full px-5 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
