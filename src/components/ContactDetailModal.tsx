"use client";
import { Contact } from "@/lib/mockData";

interface Props {
  contact: Contact;
  onClose: () => void;
  colorIndex: number;
}

const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-teal-500",
  "bg-orange-500", "bg-indigo-500", "bg-green-500", "bg-red-500",
  "bg-cyan-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500",
];

function InfoRow({ label, value, blurred }: { label: string; value: string; blurred?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-xs w-28 shrink-0 pt-0.5">{label}</span>
      {blurred ? (
        <div className="flex items-center gap-2">
          <span className="blur-sm select-none text-gray-400 text-sm">{value}</span>
          <button className="text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors border border-blue-200 rounded px-1.5 py-0.5">
            Reveal
          </button>
        </div>
      ) : (
        <span className="text-gray-800 text-sm">{value}</span>
      )}
    </div>
  );
}

export default function ContactDetailModal({ contact, onClose, colorIndex }: Props) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 bg-white border-l border-gray-200 h-full w-full max-w-md flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white text-base font-bold shrink-0`}>
                {contact.avatar}
              </div>
              <div>
                <h2 className="text-gray-900 font-bold text-lg leading-tight">
                  {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-gray-500 text-sm">{contact.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to List
            </button>
            <button className="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button className="border border-gray-200 hover:bg-gray-100 text-gray-500 p-2 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {["Overview", "History", "Connections"].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-medium py-3 transition-colors border-b-2 ${
                i === 0
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contact Info */}
        <div className="px-6 py-4">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Contact Information</h3>
          <div>
            <InfoRow label="Email" value={contact.email} blurred={!contact.emailRevealed} />
            <InfoRow label="Phone" value={contact.phone} blurred={!contact.phoneRevealed} />
            <InfoRow label="Location" value={contact.location} />
            <InfoRow label="LinkedIn" value="View Profile →" />
          </div>
        </div>

        {/* Company Info */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Company</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <span className="text-[9px] font-bold text-gray-500">{contact.companyLogo}</span>
            </div>
            <div>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm">
                {contact.company}
              </a>
              <p className="text-gray-400 text-xs">{contact.industry}</p>
            </div>
          </div>
          <div>
            <InfoRow label="Industry" value={contact.industry} />
            <InfoRow label="Company Size" value={contact.companySize + " employees"} />
            <InfoRow label="Revenue" value={contact.companyRevenue} />
          </div>
        </div>

        {/* Job Info */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Role</h3>
          <div>
            <InfoRow label="Title" value={contact.title} />
            <InfoRow label="Department" value={contact.department} />
            <InfoRow label="Mgmt Level" value={contact.managementLevel} />
          </div>
        </div>

        {/* Accuracy */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Data Quality</h3>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
              contact.accuracy === "A+" ? "bg-green-500" : "bg-gray-400"
            }`}>
              {contact.accuracy}
            </div>
            <div>
              <p className="text-gray-800 text-sm font-medium">
                {contact.accuracy === "A+" ? "Excellent" : "Good"} Accuracy
              </p>
              <p className="text-gray-400 text-xs">Verified contact data</p>
            </div>
          </div>
        </div>

        {/* Intent signals */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Intent Signals</h3>
            <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded border border-orange-200">
              High
            </span>
          </div>
          <div className="space-y-2.5">
            {["B2B Sales Intelligence", "CRM Software", "Marketing Automation"].map((topic) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-gray-600 text-xs">{topic}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-2 h-3 rounded-sm ${bar <= 4 ? "bg-orange-400" : "bg-gray-100"}`}
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
