"use client";

import { apiFetch, Lead } from "@/lib/api";

type Props = {
    lead: Lead;
    onUpdated: (lead: Lead) => void;
};

export function EditLeadStatus({
    lead,
    onUpdated
}: Props) {
    async function changeStatus(
        status: string
    ) {
        try {
            const updated =
                await apiFetch<Lead>(
                    `/api/v1/leads/${lead.id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            status
                        })
                    }
                );

            onUpdated(updated);
        } catch {
            alert("Failed to update status");
        }
    }

    return (
        <select
            value={lead.status}
            onChange={(e) =>
                changeStatus(e.target.value)
            }
            className="rounded border p-1"
        >
            <option value="new">New</option>
            <option value="contacted">
                Contacted
            </option>
            <option value="qualified">
                Qualified
            </option>
            <option value="closed">
                Closed
            </option>
        </select>
    );
}