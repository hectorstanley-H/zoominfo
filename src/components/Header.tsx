"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_TABS = ["Advanced Search", "Lists", "WebSights", "Tools & Integrations"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = query.trim();
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-stretch h-12 px-4 gap-0">
        {/* Logo */}
        <Link href="/search" className="flex items-center gap-2 shrink-0 pr-4 mr-2">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 shrink-0">
            <span className="text-white font-black text-xs tracking-tight">ZI</span>
          </div>
          <span className="text-gray-800 font-bold text-sm tracking-tight">
            zoominfo<span className="text-orange-500">lite</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex items-center flex-1 max-w-xs mr-4">
          <div className="flex items-center w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 gap-2 focus-within:border-blue-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search for companies, contacts, industries, etc."
              className="flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-stretch gap-0">
          {NAV_TABS.map((tab) => {
            const isActive = tab === "Advanced Search" && pathname === "/search";
            return (
              <Link
                key={tab}
                href="/search"
                className={`flex items-center text-sm px-4 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-orange-500 text-gray-900 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {tab}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto pl-4 shrink-0">
          {/* Notification bell */}
          <button className="relative text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              25
            </span>
          </button>

          <button className="text-xs text-gray-600 hover:text-gray-900 whitespace-nowrap font-medium">
            Community Info
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors whitespace-nowrap">
            Pricing
          </button>

          {/* Graduation cap */}
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </button>

          {/* Avatar */}
          <button className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            HC
          </button>
        </div>
      </div>
    </header>
  );
}
