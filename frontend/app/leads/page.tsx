import { AppShell } from "@/components/app-shell";
import { Plus } from "lucide-react";

const leads = [
  { name: "Avery Stone", email: "avery@example.com", source: "Website", status: "New" },
  { name: "Jordan Lee", email: "jordan@example.com", source: "Referral", status: "Qualified" },
  { name: "Mina Patel", email: "mina@example.com", source: "Campaign", status: "Contacted" }
];

export default function LeadsPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Leads</h2>
          <p className="mt-1 text-sm text-slate-600">Track prospects through the sales funnel.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add lead
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {leads.map((lead) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" key={lead.email}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-950">{lead.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{lead.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {lead.status}
              </span>
            </div>
            <p className="mt-6 text-sm text-slate-500">Source</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{lead.source}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
