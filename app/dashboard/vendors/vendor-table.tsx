"use client";

import { useState } from "react";

interface Vendor {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive" | "archived";
  complianceStatus: "compliant" | "non_compliant" | "pending_review" | "exempt";
}

const statusBadges: Record<Vendor["complianceStatus"], { label: string; className: string }> = {
  compliant: { label: "Compliant", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  non_compliant: { label: "Non-Compliant", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
  pending_review: { label: "Pending Review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  exempt: { label: "Exempt", className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
};

export function VendorTable({ initialVendors }: { initialVendors: Vendor[] }) {
  const [vendors] = useState<Vendor[]>(initialVendors);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
          <tr>
            <th className="p-4">Vendor Name</th>
            <th className="p-4">Primary Contact</th>
            <th className="p-4">Compliance</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500">No vendors found. Add your first vendor to start tracking compliance.</td>
            </tr>
          ) : (
            vendors.map((vendor) => {
              const badge = statusBadges[vendor.complianceStatus] || statusBadges.pending_review;
              return (
                <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{vendor.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {vendor.contactName
                      ? `${vendor.contactName}${vendor.email || vendor.phone ? ` (${vendor.email || vendor.phone})` : ""}`
                      : vendor.email || vendor.phone || "—"}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 capitalize">{vendor.status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}