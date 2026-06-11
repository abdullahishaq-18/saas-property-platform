"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CreateLeadForm } from "@/components/create-lead-form";
import { apiFetch, Lead } from "@/lib/api";
import { EditLeadStatus } from "@/components/edit-lead-status";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  async function deleteLead(id: number) {
    try {
      await apiFetch(
        `/api/v1/leads/${id}`,
        {
          method: "DELETE"
        }
      );

      setLeads((current) =>
        current.filter(
          (lead) => lead.id !== id
        )
      );
    } catch {
      alert("Failed to delete lead");
    }
  }

  async function generateEmail(
    id: number
  ) {
    try {
      const result = await apiFetch<{
        email: string;
      }>(
        `/api/v1/leads/${id}/followup`,
        {
          method: "POST"
        }
      );

      setGeneratedEmail(
        result.email
      );
    } catch {
      alert(
        "Failed to generate email"
      );
    }
  }

  function updateLead(updated: Lead) {
    setLeads(current =>
      current.map(item =>
        item.id === updated.id
          ? updated
          : item
      )
    );
  }

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await apiFetch<Lead[]>(
          "/api/v1/leads"
        );

        setLeads(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load leads"
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">
          Leads
        </h2>

        <p className="text-slate-600">
          Manage your prospects.
        </p>
      </div>

      <CreateLeadForm
        onCreated={(lead) =>
          setLeads((current) => [
            lead,
            ...current
          ])
        }
      />

      {loading && <p>Loading...</p>}

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-3 text-left">
                  Name
                </th>

                <th className="p-3 text-left">
                  Email
                </th>

                <th className="p-3 text-left">
                  Source
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Actions
                </th>
                <th className="p-3 text-left">
                  AI Score
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="p-3">
                    {lead.name}
                  </td>

                  <td className="p-3">
                    {lead.email}
                  </td>

                  <td className="p-3">
                    {lead.source}
                  </td>

                  <td className="p-3">
                    <EditLeadStatus
                      lead={lead}
                      onUpdated={updateLead}
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => generateEmail(lead.id)}
                        className="text-blue-600"
                      >
                        AI Email
                      </button>

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={
                        lead.lead_score === "HOT"
                          ? "rounded bg-red-100 px-2 py-1 text-red-700"
                          : lead.lead_score === "WARM"
                            ? "rounded bg-yellow-100 px-2 py-1 text-yellow-700"
                            : "rounded bg-blue-100 px-2 py-1 text-blue-700"
                      }
                    >
                      {lead.lead_score ?? "N/A"}
                    </span>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center"
                  >
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {generatedEmail && (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <h3 className="mb-2 font-semibold">
            AI Follow-up Email
          </h3>

          <pre className="whitespace-pre-wrap">
            {generatedEmail}
          </pre>
        </div>
      )}
    </AppShell>
  );
}