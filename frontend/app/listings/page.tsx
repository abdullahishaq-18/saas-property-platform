import { AppShell } from "@/components/app-shell";
import { Plus } from "lucide-react";

const listings = [
  { title: "Downtown office suite", status: "Active", price: "$4,500" },
  { title: "Warehouse bay 12", status: "Draft", price: "$7,200" },
  { title: "Retail corner unit", status: "Active", price: "$5,850" }
];

export default function ListingsPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Listings</h2>
          <p className="mt-1 text-sm text-slate-600">Manage inventory and publishing state.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New listing
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <tr key={listing.title}>
                <td className="px-4 py-4 text-sm font-medium text-slate-900">
                  {listing.title}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{listing.status}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{listing.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
