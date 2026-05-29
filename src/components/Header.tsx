"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      label: "Products",
      items: ["SalesOS", "MarketingOS", "TalentOS", "OperationsOS", "Data-as-a-Service"],
    },
    {
      label: "Solutions",
      items: ["By Role", "By Industry", "By Company Size", "By Use Case"],
    },
    {
      label: "Resources",
      items: ["Blog", "Webinars", "Case Studies", "Documentation", "API Reference"],
    },
  ];

  return (
    <header className="bg-[#0C0F1E] border-b border-[#1E2340] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#FF6B00] to-[#FF9500]">
            <span className="text-white font-black text-sm tracking-tight">ZI</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ZoomInfo</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 mx-8">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              <button
                className="flex items-center gap-1 text-[#A8B0C8] hover:text-white text-sm font-medium px-3 py-2 rounded transition-colors"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.label}
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === item.label && (
                <div
                  className="absolute top-full left-0 mt-1 bg-[#1A1E35] border border-[#2D3154] rounded-lg shadow-2xl py-2 w-52"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.items.map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      className="block px-4 py-2 text-sm text-[#A8B0C8] hover:text-white hover:bg-[#252946] transition-colors"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="#" className="text-[#A8B0C8] hover:text-white text-sm font-medium px-3 py-2 rounded transition-colors">
            Pricing
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <a href="#" className="text-[#A8B0C8] hover:text-white text-sm font-medium transition-colors hidden md:block">
            Log In
          </a>
          <Link
            href="/search"
            className="bg-[#FF6B00] hover:bg-[#FF8533] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}
