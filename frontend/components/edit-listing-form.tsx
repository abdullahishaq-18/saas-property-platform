"use client";

import { FormEvent, useState } from "react";
import {
    apiFetch,
    Listing,
    ListingUpdate
} from "@/lib/api";

type Props = {
    listing: Listing;
    onUpdated: (listing: Listing) => void;
};

export function EditListingForm({
    listing,
    onUpdated
}: Props) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    async function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        try {
            const payload: ListingUpdate = {
                title: String(form.get("title")),
                location: String(form.get("location")),
                price: Number(form.get("price")),
                size: Number(form.get("size")),
                description: String(
                    form.get("description") ?? ""
                )
            };

            const updated =
                await apiFetch<Listing>(
                    `/api/v1/listings/${listing.id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload)
                    }
                );

            onUpdated(updated);
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update listing"
            );
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="text-blue-600 hover:text-blue-800 mr-3"
            >
                Edit
            </button>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="rounded border p-3 bg-slate-50"
        >
            <input
                name="title"
                defaultValue={listing.title}
                className="border p-1 mr-2"
            />

            <input
                name="location"
                defaultValue={listing.location}
                className="border p-1 mr-2"
            />

            <input
                name="price"
                type="number"
                defaultValue={listing.price}
                className="border p-1 mr-2"
            />

            <input
                name="size"
                type="number"
                defaultValue={listing.size}
                className="border p-1 mr-2"
            />

            <button
                type="submit"
                className="bg-green-600 text-white px-2 py-1 rounded"
            >
                Save
            </button>

            <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-2"
            >
                Cancel
            </button>

            {error && (
                <p className="text-red-600 mt-2">
                    {error}
                </p>
            )}
        </form>
    );
}