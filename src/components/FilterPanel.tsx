"use client";
import { useState } from "react";

export interface Filters {
  managementLevel: string[];
  department: string[];
  industry: string[];
  companySize: string[];
  location: string[];
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}

const INDUSTRIES = [
  "Real Estate", "Software", "Financial Services", "Healthcare",
  "Manufacturing", "Retail", "Media", "Education", "Consulting",
];

export default function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [industryExpanded, setIndustryExpanded] = useState(true);
  const [industrySearch, setIndustrySearch] = useState("");
  const [industryMode, setIndustryMode] = useState<"any" | "primary">("any");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["Real Estate"]);
  const [industryKeyword, setIndustryKeyword] = useState("");

  const totalActive = Object.values(filters).flat().length + selectedIndustries.length;

  const toggleIndustry = (ind: string) => {
    const next = selectedIndustries.includes(ind)
      ? selectedIndustries.filter((i) => i !== ind)
      : [...selectedIndustries, ind];
    setSelectedIndustries(next);
    onChange({ ...filters, industry: next });
  };

  const clearAll = () => {
    setSelectedIndustries([]);
    onChange({ managementLevel: [], department: [], industry: [], companySize: [], location: [] });
  };

  if (collapsed) {
    return (
      <aside className="w-8 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col items-center pt-3">
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Expand filters"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    );
  }

  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <aside className="w-72 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-800">Filters</span>
        {totalActive > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
            {totalActive}
          </span>
        )}
        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800 ml-1 font-medium"
          >
            Clear All
          </button>
        )}
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search filters input */}
        <div className="px-3 py-2.5 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2.5 py-1.5 focus-within:border-blue-400">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search filters or values"
              className="flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Recent Searches */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer">Contact Tags</span>
        </div>

        {/* Companies section */}
        <div className="px-4 py-2 border-b border-gray-200">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Companies</span>
        </div>

        {/* Company Name */}
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 cursor-pointer">
          <span className="text-sm text-gray-700">Company Name</span>
          <button className="text-gray-400 hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Industry filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setIndustryExpanded(!industryExpanded)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-800">Industry</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${industryExpanded ? "" : "rotate-90"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {industryExpanded && (
            <div className="px-4 pb-3 space-y-3">
              {/* Company Industry label + Any/Primary toggle */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Company Industry</p>
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-100 w-fit">
                  <button
                    onClick={() => setIndustryMode("any")}
                    className={`text-xs px-5 py-1 font-medium transition-colors ${
                      industryMode === "any"
                        ? "bg-white text-gray-800 shadow-sm rounded-full"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setIndustryMode("primary")}
                    className={`text-xs px-5 py-1 font-medium transition-colors ${
                      industryMode === "primary"
                        ? "bg-white text-gray-800 shadow-sm rounded-full"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Primary
                  </button>
                </div>
              </div>

              {/* Industry search */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2.5 py-1.5 focus-within:border-blue-400">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  placeholder="Search for an industry"
                  className="flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Industry list */}
              {industrySearch && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredIndustries.map((ind) => (
                    <label key={ind} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <div
                        onClick={() => toggleIndustry(ind)}
                        className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          selectedIndustries.includes(ind)
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 group-hover:border-blue-400"
                        }`}
                      >
                        {selectedIndustries.includes(ind) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        onClick={() => toggleIndustry(ind)}
                        className="text-xs text-gray-700 group-hover:text-gray-900"
                      >
                        {ind}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Selected industry tags */}
              {selectedIndustries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedIndustries.map((ind) => (
                    <span
                      key={ind}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 font-medium"
                    >
                      {ind}
                      <button
                        onClick={() => toggleIndustry(ind)}
                        className="text-blue-400 hover:text-blue-700 leading-none font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Industry Keywords */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Industry Keywords</p>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2.5 py-1.5 focus-within:border-blue-400">
                  <input
                    type="text"
                    value={industryKeyword}
                    onChange={(e) => setIndustryKeyword(e.target.value)}
                    placeholder="e.g. 'Cybersecurity'"
                    className="flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Industry Classification Code */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Industry Classification Code</p>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded px-2.5 py-1.5 hover:border-blue-300 cursor-pointer">
                  <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium">NAICS</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Size */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Company Size</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Revenue */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Revenue</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Contacts section */}
        <div className="px-4 py-2 border-b border-gray-200 mt-1">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contacts</span>
        </div>

        {/* Job Title */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Job Title</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Management Level */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Management Level</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Department */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Department</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Location */}
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Location</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
