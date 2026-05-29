"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import FilterPanel, { Filters } from "@/components/FilterPanel";
import ContactTable from "@/components/ContactTable";
import { MOCK_CONTACTS, Contact } from "@/lib/mockData";

function SearchInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState<Filters>({
    managementLevel: [],
    department: [],
    industry: ["Real Estate"],
    companySize: [],
    location: [],
  });

  const filtered: Contact[] = MOCK_CONTACTS.filter((c) => {
    const q = initialQuery.toLowerCase();
    const matchesQuery =
      !q ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);

    const matchesLevel =
      filters.managementLevel.length === 0 || filters.managementLevel.includes(c.managementLevel);
    const matchesDept =
      filters.department.length === 0 || filters.department.includes(c.department);
    const matchesIndustry =
      filters.industry.length === 0 || filters.industry.includes(c.industry);
    const matchesSize =
      filters.companySize.length === 0 || filters.companySize.includes(c.companySize);
    const matchesLocation =
      filters.location.length === 0 || filters.location.includes(c.location);

    return matchesQuery && matchesLevel && matchesDept && matchesIndustry && matchesSize && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <FilterPanel filters={filters} onChange={setFilters} resultCount={filtered.length} />
        <ContactTable contacts={filtered} query={initialQuery} />
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
