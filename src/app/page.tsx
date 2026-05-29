"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const STATS = [
  { value: "265M+", label: "Professional Profiles" },
  { value: "98M+", label: "Business Emails" },
  { value: "26M+", label: "Companies" },
  { value: "135M+", label: "Direct Dials" },
];

const TRUST_LOGOS = ["Salesforce", "HubSpot", "Adobe", "DocuSign", "LinkedIn", "Zendesk"];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#0C0F1E] flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#1A1E35] border border-[#2D3154] rounded-full px-4 py-1.5 text-xs text-[#A8B0C8] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Now with AI-powered search — try it free
          </div>

          <h1 className="text-white font-black text-5xl md:text-6xl leading-tight mb-4 tracking-tight">
            Find the right people.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9500]">
              Close more deals.
            </span>
          </h1>

          <p className="text-[#A8B0C8] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            The most accurate B2B database — 265M+ professional profiles with verified emails,
            direct dials, and real-time intent signals.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-4">
            <div className="flex items-center bg-[#1A1E35] border border-[#2D3154] rounded-xl px-4 py-3 gap-3 focus-within:border-[#FF6B00] transition-colors shadow-xl">
              <svg className="w-5 h-5 text-[#A8B0C8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, company, title, or email..."
                className="flex-1 bg-transparent text-white placeholder-[#4B5280] text-base focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#FF8533] text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          <p className="text-[#4B5280] text-xs mb-10">
            Try: &quot;VP Marketing San Francisco&quot; or &quot;Director Engineering SaaS&quot;
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {["VP Marketing", "Director of Engineering", "Chief Revenue Officer", "Head of Product", "SDR Manager"].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                className="bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] hover:border-[#FF6B00] text-[#A8B0C8] hover:text-white text-xs px-3 py-1.5 rounded-full transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[#1E2340] bg-[#0F1221] py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[#A8B0C8] text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-t border-[#1E2340] py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#4B5280] text-xs uppercase tracking-widest mb-6">
            Trusted by 35,000+ businesses worldwide
          </p>
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {TRUST_LOGOS.map((logo) => (
              <span key={logo} className="text-[#3D4270] font-bold text-lg hover:text-[#A8B0C8] transition-colors cursor-pointer">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#1E2340] bg-[#0F1221] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white font-black text-3xl text-center mb-12">
            Everything you need to find and engage your buyers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Contact Intelligence",
                desc: "Access 265M+ verified professional profiles with direct emails, phone numbers, and org charts.",
              },
              {
                iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Intent Signals",
                desc: "Identify companies actively researching your solution with real-time buying intent data.",
              },
              {
                iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Workflow Automation",
                desc: "Automate prospecting with triggers, sequences, and direct integrations with your CRM.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#0C0F1E] border border-[#2D3154] rounded-xl p-6 hover:border-[#FF6B00]/50 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#A8B0C8] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1E2340] py-16 px-4 text-center">
        <h2 className="text-white font-black text-3xl mb-4">Ready to find your next customer?</h2>
        <p className="text-[#A8B0C8] mb-8 max-w-md mx-auto">
          Join 35,000+ companies using ZoomInfo to accelerate growth.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/search")}
            className="bg-[#FF6B00] hover:bg-[#FF8533] text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Start Free Trial
          </button>
          <button className="bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E2340] bg-[#0C0F1E] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF6B00] to-[#FF9500] flex items-center justify-center">
              <span className="text-white font-black text-xs">ZI</span>
            </div>
            <span className="text-[#A8B0C8] text-sm">© 2025 ZoomInfo Technologies LLC.</span>
          </div>
          <div className="flex gap-6 text-[#4B5280] text-xs">
            {["Privacy Policy", "Terms of Service", "Cookie Settings", "Do Not Sell"].map((link) => (
              <a key={link} href="#" className="hover:text-[#A8B0C8] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
