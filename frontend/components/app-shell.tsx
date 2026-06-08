"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Building2, LogOut, UsersRound } from "lucide-react";
import { useEffect } from "react";
import { clearToken, getToken } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/listings", label: "Listings", icon: Building2 },
  { href: "/leads", label: "Leads", icon: UsersRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 lg:block">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            SaaS Starter
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">Workspace</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Operations
            </p>
            <p className="text-sm text-slate-700">Listings, leads, and revenue</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={logout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <nav className="grid grid-cols-3 border-b border-slate-200 bg-white lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={`flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium ${
                  active ? "text-brand-700" : "text-slate-600"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
