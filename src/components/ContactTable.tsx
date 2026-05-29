"use client";
import { useState } from "react";
import { Contact } from "@/lib/mockData";
import ContactDetailModal from "./ContactDetailModal";

interface ContactTableProps {
  contacts: Contact[];
  query: string;
}

const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-teal-500",
  "bg-orange-500", "bg-indigo-500", "bg-green-500", "bg-red-500",
  "bg-cyan-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500",
];

function AccuracyBadge({ accuracy }: { accuracy: "A+" | "A" | "B+" }) {
  const colors = {
    "A+": "bg-green-500 text-white",
    "A": "bg-gray-400 text-white",
    "B+": "bg-yellow-500 text-white",
  };
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${colors[accuracy]}`}>
      {accuracy}
    </div>
  );
}

function QuickActions({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Phone icon */}
      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Phone">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
      {/* Mobile icon */}
      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Mobile">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}

export default function ContactTable({ contacts, query }: ContactTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "company" | "title" | "relevance">("relevance");
  const [activeTab, setActiveTab] = useState<"contacts" | "companies">("contacts");

  const allSelected = contacts.length > 0 && selected.length === contacts.length;
  const someSelected = selected.length > 0 && selected.length < contacts.length;

  const toggleAll = () => setSelected(allSelected ? [] : contacts.map((c) => c.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const sorted = [...contacts].sort((a, b) => {
    if (sortBy === "name") return a.lastName.localeCompare(b.lastName);
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const TOTAL_COUNT = 3205243;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Quick filters bar */}
      <div className="flex items-center gap-0 px-4 pt-3 pb-0 border-b border-gray-100">
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1">New</button>
        <span className="text-gray-300">|</span>
        <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Quick Filters</button>
        <span className="text-gray-300">|</span>
        <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Hide</button>

        {/* Likely to Engage chip */}
        <div className="ml-3 flex items-center gap-1.5 border border-red-200 bg-red-50 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
          <span className="text-xs font-medium text-red-700">Likely to Engage</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-end gap-0 px-4 border-b border-gray-200 mt-0">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex items-center gap-2 text-sm px-1 pb-2 pt-3 mr-4 border-b-2 font-medium transition-colors ${
            activeTab === "contacts"
              ? "border-blue-600 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Contacts
          <span className={`text-xs rounded px-1.5 py-0.5 font-semibold ${
            activeTab === "contacts" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          }`}>
            {TOTAL_COUNT.toLocaleString()}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`flex items-center gap-2 text-sm px-1 pb-2 pt-3 border-b-2 font-medium transition-colors ${
            activeTab === "companies"
              ? "border-blue-600 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Companies
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
        {/* Selected count with dropdown */}
        <div className="flex items-center gap-0.5 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer">
          <span className="text-xs font-medium text-gray-700">
            {selected.length > 0 ? `${selected.length} Selected` : "0 Selected"}
          </span>
          <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Reveal */}
        <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
          Reveal
        </button>

        <div className="h-4 w-px bg-gray-200" />

        {/* Export */}
        <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>

        <div className="h-4 w-px bg-gray-200" />

        {/* Tag Contacts */}
        <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
          Tag Contacts
        </button>

        {/* Link icon */}
        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {/* Share */}
        <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
          Share
        </button>

        {/* Sort by */}
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-600">
          <span className="font-medium text-gray-500">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name</option>
            <option value="company">Company</option>
            <option value="title">Job Title</option>
          </select>
        </div>

        {/* Settings icon */}
        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Bookmark icon */}
        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="w-10 px-4 py-3">
                <div
                  onClick={toggleAll}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all ${
                    allSelected
                      ? "bg-blue-600 border-blue-600"
                      : someSelected
                      ? "bg-blue-100 border-blue-400"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {allSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {someSelected && !allSelected && (
                    <div className="w-2 h-0.5 bg-blue-600 rounded" />
                  )}
                </div>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                <button className="flex items-center gap-1 hover:text-gray-800">
                  Contact Name
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                Email
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                <button className="flex items-center gap-1 hover:text-gray-800">
                  Job Title
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                <button className="flex items-center gap-1 hover:text-gray-800">
                  Company Name
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                Primary Industry
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">
                <button className="flex items-center gap-1 hover:text-gray-800">
                  Accuracy
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </th>
              <th className="w-8 px-3 py-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((contact, i) => (
              <tr
                key={contact.id}
                className={`group transition-colors ${
                  selected.includes(contact.id) ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <div
                    onClick={() => toggleOne(contact.id)}
                    className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all ${
                      selected.includes(contact.id)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {selected.includes(contact.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </td>

                {/* Contact Name */}
                <td className="px-3 py-3">
                  <button
                    onClick={() => setDetail(contact)}
                    className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {contact.avatar}
                    </div>
                    <span className="text-blue-700 hover:text-blue-900 font-medium text-sm whitespace-nowrap">
                      {contact.firstName} {contact.lastName}
                    </span>
                  </button>
                </td>

                {/* Email */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-blue-700 hover:text-blue-900 text-sm hover:underline whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {contact.email}
                    </a>
                    <QuickActions contact={contact} />
                  </div>
                </td>

                {/* Job Title */}
                <td className="px-3 py-3 max-w-[220px]">
                  <span className="text-gray-700 text-sm truncate block">{contact.title}</span>
                </td>

                {/* Company Name */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold text-gray-500">{contact.companyLogo}</span>
                    </div>
                    <button
                      onClick={() => setDetail(contact)}
                      className="text-blue-700 hover:text-blue-900 text-sm font-medium whitespace-nowrap hover:underline"
                    >
                      {contact.company}
                    </button>
                  </div>
                </td>

                {/* Primary Industry */}
                <td className="px-3 py-3 max-w-[160px]">
                  <span className="text-gray-600 text-sm truncate block">{contact.primaryIndustry}</span>
                </td>

                {/* Accuracy */}
                <td className="px-3 py-3">
                  <AccuracyBadge accuracy={contact.accuracy} />
                </td>

                {/* Bookmark */}
                <td className="px-3 py-3">
                  <button className="text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-1">No contacts found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {detail && (
        <ContactDetailModal
          contact={detail}
          onClose={() => setDetail(null)}
          colorIndex={sorted.indexOf(detail)}
        />
      )}
    </div>
  );
}
