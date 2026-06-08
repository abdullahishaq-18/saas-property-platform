import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Portfolio health and latest account movement.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Listings" value="24" detail="8 active this week" />
        <StatCard label="New leads" value="148" detail="32 percent conversion" />
        <StatCard label="Pipeline" value="$42.8k" detail="Estimated monthly value" />
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Recent activity</h3>
            <p className="text-sm text-slate-600">Latest changes across the workspace.</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          {["Lead captured from website", "Listing marked active", "Demo scheduled"].map(
            (item) => (
              <div className="flex items-center justify-between py-3" key={item}>
                <p className="text-sm font-medium text-slate-800">{item}</p>
                <span className="text-xs text-slate-500">Today</span>
              </div>
            )
          )}
        </div>
      </section>
    </AppShell>
  );
}
