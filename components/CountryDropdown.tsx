'use client';

import { originCountries } from '../lib/carData';

type CountryDropdownProps = {
  value: string;
  onChange: (slug: string) => void;
};

export default function CountryDropdown({ value, onChange }: CountryDropdownProps) {
  return (
    <div className="relative">
      <select
        id="country-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full sm:w-64 rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:border-neutral-400 transition-colors"
      >
        <option value="">Where from?</option>
        {originCountries.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
