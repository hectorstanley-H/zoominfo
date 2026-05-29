"use client";
import { useState } from "react";
import { FILTER_OPTIONS } from "@/lib/mockData";

export interface Filters {
  managementLevel: string[];
  department: string[];
  industry: string[];
  companySize: string[];
  location: string[];
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}

function FilterSection({ title, options, selected, onToggle }: FilterSectionProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border-b border-[#2D3154] py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-white px-4 py-1"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 text-[#A8B0C8] transition-transform ${open ? "" : "-rotate-90"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 px-4">
          {options.length > 5 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-[#1A1E35] border border-[#2D3154] rounded text-xs text-[#A8B0C8] placeholder-[#4B5280] px-2 py-1.5 mb-2 focus:outline-none focus:border-[#FF6B00]"
            />
          )}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => onToggle(opt)}
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                    selected.includes(opt)
                      ? "bg-[#FF6B00] border-[#FF6B00]"
                      : "border-[#3D4270] group-hover:border-[#FF6B00]"
                  }`}
                >
                  {selected.includes(opt) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => onToggle(opt)}
                  className={`text-xs transition-colors ${selected.includes(opt) ? "text-white" : "text-[#A8B0C8] group-hover:text-white"}`}
                >
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

export default function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const toggle = (key: keyof Filters, val: string) => {
    const current = filters[key];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => {
    onChange({ managementLevel: [], department: [], industry: [], companySize: [], location: [] });
  };

  const totalActive = Object.values(filters).flat().length;

  return (
    <aside className="w-64 shrink-0 bg-[#0F1221] border-r border-[#2D3154] min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-[#2D3154]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-semibold text-sm">Filters</span>
          {totalActive > 0 && (
            <button onClick={clearAll} className="text-[#FF6B00] text-xs hover:text-[#FF8533] transition-colors">
              Clear all ({totalActive})
            </button>
          )}
        </div>
        <p className="text-[#A8B0C8] text-xs">
          <span className="text-white font-semibold">{resultCount.toLocaleString()}</span> results
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FilterSection
          title="Management Level"
          options={FILTER_OPTIONS.managementLevel}
          selected={filters.managementLevel}
          onToggle={(v) => toggle("managementLevel", v)}
        />
        <FilterSection
          title="Department"
          options={FILTER_OPTIONS.department}
          selected={filters.department}
          onToggle={(v) => toggle("department", v)}
        />
        <FilterSection
          title="Industry"
          options={FILTER_OPTIONS.industry}
          selected={filters.industry}
          onToggle={(v) => toggle("industry", v)}
        />
        <FilterSection
          title="Company Size"
          options={FILTER_OPTIONS.companySize}
          selected={filters.companySize}
          onToggle={(v) => toggle("companySize", v)}
        />
        <FilterSection
          title="Location"
          options={FILTER_OPTIONS.location}
          selected={filters.location}
          onToggle={(v) => toggle("location", v)}
        />
      </div>

      <div className="p-4 border-t border-[#2D3154]">
        <button className="w-full bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white text-xs font-medium py-2 rounded transition-colors">
          Save Search
        </button>
      </div>
    </aside>
  );
}
