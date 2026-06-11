"use client";

import { FormEvent, useState } from "react";
import {
  apiFetch,
  Listing,
  ListingCreate
} from "@/lib/api";

type Props = {
  onCreated: (listing: Listing) => void;
};

export function CreateListingForm({
  onCreated
}: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const formElement = event.currentTarget;

    const form = new FormData(formElement);

    try {
      setLoading(true);

      const payload: ListingCreate = {
        title: String(form.get("title")),
        location: String(form.get("location")),
        price: Number(form.get("price")),
        size: Number(form.get("size")),
        description: String(
          form.get("description") ?? ""
        )
      };

      const listing = await apiFetch<Listing>(
        "/api/v1/listings",
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );

      formElement.reset();

      onCreated(listing);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create listing"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="mb-6 rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={submit}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="title"
          placeholder="Title"
          required
          className="rounded border p-2"
        />

        <input
          name="location"
          placeholder="Location"
          required
          className="rounded border p-2"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          required
          className="rounded border p-2"
        />

        <input
          name="size"
          type="number"
          placeholder="Size"
          required
          className="rounded border p-2"
        />
      </div>

      <textarea
        name="description"
        placeholder="Description (optional)"
        className="mt-3 w-full rounded border p-2"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}