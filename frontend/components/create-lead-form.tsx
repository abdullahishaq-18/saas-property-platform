"use client";

import { FormEvent, useState } from "react";
import {
    apiFetch,
    Lead,
    LeadCreate
} from "@/lib/api";

type Props = {
    onCreated: (lead: Lead) => void;
};

export function CreateLeadForm({
    onCreated
}: Props) {
    const [error, setError] = useState("");

    async function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const formElement = event.currentTarget;

        const form = new FormData(
            formElement
        );

        try {
            const payload: LeadCreate = {
                name: String(form.get("name")),
                email: String(form.get("email")),
                source: String(form.get("source")),
                status: "new"
            };

            const lead = await apiFetch<Lead>(
                "/api/v1/leads",
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );

            onCreated(lead);

            formElement.reset();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create lead"
            );
        }
    }

    return (
        <form
            onSubmit={submit}
            className="mb-6 rounded-lg border bg-white p-4"
        >
            <div className="grid gap-3 md:grid-cols-3">
                <input
                    name="name"
                    placeholder="Name"
                    required
                    className="rounded border p-2"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="rounded border p-2"
                />

                <input
                    name="source"
                    placeholder="Source"
                    defaultValue="website"
                    className="rounded border p-2"
                />
            </div>

            {error && (
                <p className="mt-2 text-red-600">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="mt-3 rounded bg-brand-600 px-4 py-2 text-white"
            >
                Create Lead
            </button>
        </form>
    );
}