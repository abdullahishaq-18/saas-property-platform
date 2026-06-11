"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, Listing } from "@/lib/api";
import { CreateListingForm } from "@/components/create-listing-form";
import { EditListingForm } from "@/components/edit-listing-form";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] =
    useState<any>(null);

  const [selectedListing, setSelectedListing] =
    useState<string>("");

  async function deleteListing(id: number) {
    try {
      await apiFetch(`/api/v1/listings/${id}`, {
        method: "DELETE"
      });

      setListings((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch {
      alert("Failed to delete listing");
    }
  }

  async function analyzeInvestment(
    id: number,
    title: string
  ) {
    try {
      const result = await apiFetch<{
        analysis: {
          score: number;
          pros: string[];
          cons: string[];
          recommendation: string;
        };
      }>(
        `/api/v1/listings/${id}/investment-analysis`,
        {
          method: "POST"
        }
      );

      setAnalysis(result.analysis);
      setSelectedListing(title);
    } catch {
      alert(
        "Failed to generate investment analysis"
      );
    }
  }

  async function generateDescription(
    id: number
  ) {
    try {
      const updated =
        await apiFetch<Listing>(
          `/api/v1/listings/${id}/generate-description`,
          {
            method: "POST"
          }
        );

      setListings(current =>
        current.map(item =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    } catch {
      alert(
        "Failed to generate description"
      );
    }
  }

  function updateListing(updated: Listing) {
    setListings((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item
      )
    );
  }

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await apiFetch<Listing[]>(
          "/api/v1/listings"
        );

        setListings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load listings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-950">
          Listings
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Manage inventory and publishing state.
        </p>
      </div>

      <CreateListingForm
        onCreated={(listing) =>
          setListings((current) => [
            listing,
            ...current
          ])
        }
      />

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          Loading listings...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Size
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-4 py-4 text-sm text-slate-900">
                    <div className="font-medium">
                      {listing.title}
                    </div>

                    {listing.generated_description && (
                      <p className="mt-1 text-xs text-slate-500 max-w-md">
                        {listing.generated_description}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {listing.location}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    ${listing.price.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {listing.size}
                  </td>

                  <td className="px-4 py-4 space-x-3">
                    <button
                      onClick={() =>
                        generateDescription(listing.id)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      AI Description
                    </button>

                    <EditListingForm
                      listing={listing}
                      onUpdated={updateListing}
                    />

                    <button
                      onClick={() =>
                        analyzeInvestment(
                          listing.id,
                          listing.title
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Analyze Investment
                    </button>

                    <button
                      onClick={() =>
                        deleteListing(listing.id)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {listings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {analysis && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">

          <h3 className="mb-4 text-xl font-bold">
            AI Investment Analysis
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Property: {selectedListing}
          </p>

          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-slate-500">
              Investment Score
            </p>

            <p className="text-3xl font-bold text-blue-700">
              {analysis.score}/10
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <h4 className="mb-3 font-semibold text-green-700">
                Pros
              </h4>

              <ul className="space-y-2">
                {analysis.pros.map(
                  (item: string) => (
                    <li key={item}>
                      ✅ {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-red-700">
                Cons
              </h4>

              <ul className="space-y-2">
                {analysis.cons.map(
                  (item: string) => (
                    <li key={item}>
                      ⚠️ {item}
                    </li>
                  )
                )}
              </ul>
            </div>

          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-semibold">
              Recommendation
            </h4>

            <p>
              {analysis.recommendation}
            </p>
          </div>

        </div>
      )}
    </AppShell>
  );
}