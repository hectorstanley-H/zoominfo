"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import FilterPanel, { Filters } from "@/components/FilterPanel";
import ContactTable from "@/components/ContactTable";
import { MOCK_CONTACTS, Contact } from "@/lib/mockData";

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>({
    managementLevel: [],
    department: [],
    industry: [],
    companySize: [],
    location: [],
  });
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filtered: Contact[] = MOCK_CONTACTS.filter((c) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);

    const matchesLevel = filters.managementLevel.length === 0 || filters.managementLevel.includes(c.managementLevel);
    const matchesDept = filters.department.length === 0 || filters.department.includes(c.department);
    const matchesIndustry = filters.industry.length === 0 || filters.industry.includes(c.industry);
    const matchesSize = filters.companySize.length === 0 || filters.companySize.includes(c.companySize);
    const matchesLocation = filters.location.length === 0 || filters.location.includes(c.location);

    return matchesQuery && matchesLevel && matchesDept && matchesIndustry && matchesSize && matchesLocation;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    router.replace(`/search?q=${encodeURIComponent(inputValue)}`, { scroll: false });
  };

  useEffect(() => {
    setQuery(initialQuery);
    setInputValue(initialQuery);
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-[#0C0F1E] flex flex-col">
      <Header />

      {/* Sub-header / search bar */}
      <div className="bg-[#0F1221] border-b border-[#2D3154] px-6 py-3">
        <div className="flex items-center gap-4 max-w-[1400px] mx-auto">
          {/* Product tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {["Contacts", "Companies", "Intent"].map((tab, i) => (
              <button
                key={tab}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                  i === 0
                    ? "bg-[#1A1E35] text-white"
                    : "text-[#A8B0C8] hover:text-white hover:bg-[#1A1E35]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex items-center bg-[#1A1E35] border border-[#2D3154] rounded-lg px-3 py-2 gap-2 focus-within:border-[#FF6B00] transition-colors">
              <svg className="w-4 h-4 text-[#A8B0C8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search contacts..."
                className="flex-1 bg-transparent text-white placeholder-[#4B5280] text-sm focus:outline-none"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => { setInputValue(""); setQuery(""); }}
                  className="text-[#4B5280] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button type="submit" className="bg-[#FF6B00] hover:bg-[#FF8533] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* View toggles */}
          <div className="flex items-center gap-1 bg-[#1A1E35] border border-[#2D3154] rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-[#FF6B00] text-white" : "text-[#A8B0C8] hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 4v16M14 4v16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded transition-colors ${viewMode === "card" ? "bg-[#FF6B00] text-white" : "text-[#A8B0C8] hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden max-w-[1400px] mx-auto w-full">
        <FilterPanel filters={filters} onChange={setFilters} resultCount={filtered.length} />

        {viewMode === "table" ? (
          <ContactTable contacts={filtered} query={query} />
        ) : (
          <CardView contacts={filtered} query={query} />
        )}
      </div>
    </div>
  );
}

function CardView({ contacts, query }: { contacts: Contact[]; query: string }) {
  const AVATAR_COLORS = [
    "bg-[#6366F1]", "bg-[#8B5CF6]", "bg-[#EC4899]", "bg-[#14B8A6]",
    "bg-[#F59E0B]", "bg-[#3B82F6]", "bg-[#10B981]", "bg-[#F97316]",
    "bg-[#EF4444]", "bg-[#06B6D4]", "bg-[#84CC16]", "bg-[#A855F7]",
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-4 text-[#A8B0C8] text-sm">
        <span className="text-white font-semibold">{contacts.length}</span> contacts
        {query && <span> matching &quot;{query}&quot;</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c, i) => (
          <div key={c.id} className="bg-[#0F1221] border border-[#2D3154] rounded-xl p-5 hover:border-[#FF6B00]/50 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                {c.avatar}
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{c.firstName} {c.lastName}</h3>
                <p className="text-[#A8B0C8] text-xs truncate">{c.title}</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-[#A8B0C8]">
                <svg className="w-3 h-3 shrink-0 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-[#3B82F6]">{c.company}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A8B0C8]">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {c.location}
              </div>
              {c.emailRevealed ? (
                <div className="flex items-center gap-1.5 text-xs text-[#A8B0C8]">
                  <svg className="w-3 h-3 shrink-0 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{c.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs">
                  <svg className="w-3 h-3 shrink-0 text-[#A8B0C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="blur-sm select-none text-[#A8B0C8]">xxxxx@xxxxx.com</span>
                  <button className="text-[#FF6B00] text-xs font-semibold hover:text-[#FF8533] transition-colors ml-1">Reveal</button>
                </div>
              )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 text-xs bg-[#FF6B00] hover:bg-[#FF8533] text-white font-semibold py-1.5 rounded transition-colors">
                View Profile
              </button>
              <button className="text-xs bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white px-3 py-1.5 rounded transition-colors">
                + List
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
