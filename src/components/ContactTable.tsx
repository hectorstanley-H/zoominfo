"use client";
import { useState } from "react";
import { Contact } from "@/lib/mockData";
import ContactDetailModal from "./ContactDetailModal";

interface ContactTableProps {
  contacts: Contact[];
  query: string;
}

function AvatarCircle({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-[#6366F1]", "bg-[#8B5CF6]", "bg-[#EC4899]", "bg-[#14B8A6]",
  "bg-[#F59E0B]", "bg-[#3B82F6]", "bg-[#10B981]", "bg-[#F97316]",
  "bg-[#EF4444]", "bg-[#06B6D4]", "bg-[#84CC16]", "bg-[#A855F7]",
];

function BlurredEmail() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="blur-sm select-none text-[#A8B0C8] text-sm">
        xxxxxxxxxx@xxxxx.com
      </span>
      <button className="text-[#FF6B00] text-xs font-semibold hover:text-[#FF8533] whitespace-nowrap transition-colors">
        Reveal
      </button>
    </div>
  );
}

export default function ContactTable({ contacts, query }: ContactTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "company" | "title">("name");

  const allSelected = contacts.length > 0 && selected.length === contacts.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : contacts.map((c) => c.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sorted = [...contacts].sort((a, b) => {
    if (sortBy === "name") return a.lastName.localeCompare(b.lastName);
    if (sortBy === "company") return a.company.localeCompare(b.company);
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="bg-[#0F1221] border-b border-[#2D3154] px-6 py-3 flex items-center gap-3">
        <span className="text-[#A8B0C8] text-sm">
          {selected.length > 0 ? (
            <span className="text-white font-medium">{selected.length} selected</span>
          ) : (
            <>
              <span className="text-white font-semibold">{contacts.length.toLocaleString()}</span> contacts
              {query && <span className="text-[#A8B0C8]"> matching &quot;{query}&quot;</span>}
            </>
          )}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <button className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#FF8533] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to List
              </button>
              <button className="flex items-center gap-1.5 bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                Export
              </button>
            </>
          )}
          <button className="flex items-center gap-1.5 bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white text-xs font-medium px-3 py-1.5 rounded transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="sr-only"
          >
            <option value="name">Name</option>
            <option value="company">Company</option>
            <option value="title">Title</option>
          </select>
          <button className="flex items-center gap-1.5 bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white text-xs font-medium px-3 py-1.5 rounded transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#0F1221] border-b border-[#2D3154] sticky top-0">
            <tr>
              <th className="w-10 px-4 py-3">
                <div
                  onClick={toggleAll}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all ${
                    allSelected ? "bg-[#FF6B00] border-[#FF6B00]" : "border-[#3D4270] hover:border-[#FF6B00]"
                  }`}
                >
                  {allSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Title</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Location</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2340]">
            {sorted.map((contact, i) => (
              <tr
                key={contact.id}
                className={`group transition-colors ${
                  selected.includes(contact.id) ? "bg-[#1A1E35]" : "hover:bg-[#111427]"
                }`}
              >
                <td className="px-4 py-3.5">
                  <div
                    onClick={() => toggleOne(contact.id)}
                    className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all ${
                      selected.includes(contact.id) ? "bg-[#FF6B00] border-[#FF6B00]" : "border-[#3D4270] group-hover:border-[#FF6B00]"
                    }`}
                  >
                    {selected.includes(contact.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setDetail(contact)}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
                  >
                    <AvatarCircle initials={contact.avatar} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                    <div>
                      <span className="text-white text-sm font-medium hover:text-[#FF6B00] transition-colors">
                        {contact.firstName} {contact.lastName}
                      </span>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[#A8B0C8] text-sm">{contact.title}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#1A1E35] border border-[#2D3154] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#A8B0C8]">{contact.companyLogo}</span>
                    </div>
                    <a href="#" className="text-[#3B82F6] text-sm hover:text-[#60A5FA] transition-colors">
                      {contact.company}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 text-[#A8B0C8] text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {contact.location}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {contact.emailRevealed ? (
                    <a href={`mailto:${contact.email}`} className="text-[#A8B0C8] text-sm hover:text-white transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#10B981] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {contact.email}
                    </a>
                  ) : (
                    <BlurredEmail />
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDetail(contact)}
                      className="text-xs bg-[#1A1E35] hover:bg-[#FF6B00] border border-[#2D3154] hover:border-[#FF6B00] text-[#A8B0C8] hover:text-white px-2.5 py-1 rounded transition-all"
                    >
                      View
                    </button>
                    <button className="text-xs bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white px-2.5 py-1 rounded transition-all">
                      + List
                    </button>
                    <button className="p-1 rounded text-[#A8B0C8] hover:text-white hover:bg-[#252946] transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#1A1E35] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#3D4270]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">No contacts found</h3>
            <p className="text-[#A8B0C8] text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {contacts.length > 0 && (
        <div className="bg-[#0F1221] border-t border-[#2D3154] px-6 py-3 flex items-center justify-between">
          <span className="text-[#A8B0C8] text-xs">
            Showing <span className="text-white font-medium">1–{contacts.length}</span> of{" "}
            <span className="text-white font-medium">{contacts.length.toLocaleString()}</span> results
          </span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3154] text-[#A8B0C8] hover:text-white hover:border-[#FF6B00] transition-all disabled:opacity-40" disabled>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#FF6B00] text-white text-xs font-semibold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3154] text-[#A8B0C8] hover:text-white hover:border-[#FF6B00] transition-all text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3154] text-[#A8B0C8] hover:text-white hover:border-[#FF6B00] transition-all text-xs">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2D3154] text-[#A8B0C8] hover:text-white hover:border-[#FF6B00] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {detail && <ContactDetailModal contact={detail} onClose={() => setDetail(null)} colorIndex={sorted.indexOf(detail)} />}
    </div>
  );
}
