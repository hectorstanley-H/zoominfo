"use client";
import { Contact } from "@/lib/mockData";

interface Props {
  contact: Contact;
  onClose: () => void;
  colorIndex: number;
}

const AVATAR_COLORS = [
  "bg-[#6366F1]", "bg-[#8B5CF6]", "bg-[#EC4899]", "bg-[#14B8A6]",
  "bg-[#F59E0B]", "bg-[#3B82F6]", "bg-[#10B981]", "bg-[#F97316]",
  "bg-[#EF4444]", "bg-[#06B6D4]", "bg-[#84CC16]", "bg-[#A855F7]",
];

function InfoRow({ label, value, blurred }: { label: string; value: string; blurred?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#2D3154] last:border-0">
      <span className="text-[#6B7280] text-xs w-28 shrink-0 pt-0.5">{label}</span>
      {blurred ? (
        <div className="flex items-center gap-2">
          <span className="blur-sm select-none text-[#A8B0C8] text-sm">{value}</span>
          <button className="text-[#FF6B00] text-xs font-semibold hover:text-[#FF8533] transition-colors">
            Reveal
          </button>
        </div>
      ) : (
        <span className="text-white text-sm">{value}</span>
      )}
    </div>
  );
}

export default function ContactDetailModal({ contact, onClose, colorIndex }: Props) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 bg-[#0F1221] border-l border-[#2D3154] h-full w-full max-w-md flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-[#1A1E35] to-[#0F1221] px-6 py-6 border-b border-[#2D3154]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white text-lg font-bold`}>
                {contact.avatar}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-[#A8B0C8] text-sm">{contact.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#A8B0C8] hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-[#FF6B00] hover:bg-[#FF8533] text-white text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to List
            </button>
            <button className="flex-1 bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white text-sm font-medium py-2 rounded transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Export
            </button>
            <button className="bg-[#1A1E35] hover:bg-[#252946] border border-[#2D3154] text-[#A8B0C8] hover:text-white p-2 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2D3154]">
          {["Overview", "History", "Connections"].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-medium py-3 transition-colors border-b-2 ${
                i === 0
                  ? "text-[#FF6B00] border-[#FF6B00]"
                  : "text-[#A8B0C8] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contact Info */}
        <div className="px-6 py-4">
          <h3 className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-2">Contact Information</h3>
          <div>
            <InfoRow
              label="Email"
              value={contact.email}
              blurred={!contact.emailRevealed}
            />
            <InfoRow
              label="Phone"
              value={contact.phone}
              blurred={!contact.phoneRevealed}
            />
            <InfoRow label="Location" value={contact.location} />
            <InfoRow label="LinkedIn" value="View Profile →" />
          </div>
        </div>

        {/* Company Info */}
        <div className="px-6 py-4 border-t border-[#2D3154]">
          <h3 className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-2">Company</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1A1E35] border border-[#2D3154] rounded flex items-center justify-center">
              <span className="text-xs font-bold text-[#A8B0C8]">{contact.companyLogo}</span>
            </div>
            <div>
              <a href="#" className="text-[#3B82F6] font-medium hover:text-[#60A5FA] transition-colors">
                {contact.company}
              </a>
              <p className="text-[#A8B0C8] text-xs">{contact.industry}</p>
            </div>
          </div>
          <div>
            <InfoRow label="Industry" value={contact.industry} />
            <InfoRow label="Company Size" value={contact.companySize + " employees"} />
            <InfoRow label="Revenue" value={contact.companyRevenue} />
          </div>
        </div>

        {/* Job Info */}
        <div className="px-6 py-4 border-t border-[#2D3154]">
          <h3 className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-2">Role</h3>
          <div>
            <InfoRow label="Title" value={contact.title} />
            <InfoRow label="Department" value={contact.department} />
            <InfoRow label="Mgmt Level" value={contact.managementLevel} />
          </div>
        </div>

        {/* Intent signals */}
        <div className="px-6 py-4 border-t border-[#2D3154]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Intent Signals</h3>
            <span className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-semibold px-2 py-0.5 rounded">High</span>
          </div>
          <div className="space-y-2">
            {["B2B Sales Intelligence", "CRM Software", "Marketing Automation"].map((topic) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-[#A8B0C8] text-xs">{topic}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-2 h-3 rounded-sm ${bar <= 4 ? "bg-[#FF6B00]" : "bg-[#2D3154]"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
