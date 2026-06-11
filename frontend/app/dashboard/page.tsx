"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { apiFetch } from "@/lib/api";

type DashboardStats = {
  total_listings: number;
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
};

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data =
          await apiFetch<DashboardStats>(
            "/api/v1/dashboard"
          );

        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-950">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          AI Commercial Property Intelligence Platform
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-6">
          Loading dashboard...
        </div>
      )}

      {!loading && stats && (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <StatCard
              label="Listings"
              value={String(
                stats.total_listings
              )}
              detail="Total properties"
            />

            <StatCard
              label="Leads"
              value={String(
                stats.total_leads
              )}
              detail="Total prospects"
            />

            <StatCard
              label="Hot Leads"
              value={String(
                stats.hot_leads
              )}
              detail="High priority"
            />

            <StatCard
              label="Warm Leads"
              value={String(
                stats.warm_leads
              )}
              detail="Needs follow-up"
            />

            <StatCard
              label="Cold Leads"
              value={String(
                stats.cold_leads
              )}
              detail="Low engagement"
            />
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="font-semibold text-lg">
                Lead Distribution
              </h3>

              <div className="mt-4 space-y-3">
                <p>🔥 Hot Leads: {stats.hot_leads}</p>
                <p>🟡 Warm Leads: {stats.warm_leads}</p>
                <p>❄️ Cold Leads: {stats.cold_leads}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="font-semibold text-lg">
                AI Capabilities
              </h3>

              <div className="mt-4 space-y-3">
                <p>✅ AI Property Description Generator</p>
                <p>✅ AI Investment Analysis</p>
                <p>✅ AI Lead Scoring</p>
                <p>✅ AI Follow-up Email Generator</p>
              </div>
            </div>

          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">

            <h3 className="text-lg font-semibold">
              Recent AI Activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Latest AI-generated insights and actions.
            </p>

            <div className="mt-6 divide-y divide-slate-100">

              <div className="flex items-center justify-between py-3">
                <p className="text-sm font-medium">
                  🤖 Generated property description
                </p>

                <span className="text-xs text-slate-500">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <p className="text-sm font-medium">
                  🔥 Lead scored as WARM
                </p>

                <span className="text-xs text-slate-500">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <p className="text-sm font-medium">
                  📧 Follow-up email generated
                </p>

                <span className="text-xs text-slate-500">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <p className="text-sm font-medium">
                  📈 Investment analysis completed
                </p>

                <span className="text-xs text-slate-500">
                  Today
                </span>
              </div>

            </div>

          </section>
        </>
      )}
    </AppShell>
  );
}