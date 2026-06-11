"use client";

import { useEffect } from "react";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch, AuthResponse } from "@/lib/api";
import { setToken } from "@/lib/auth";



export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (getToken()) {
      router.push("/dashboard");
    }
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    console.log("SUBMIT FIRED");
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await apiFetch<AuthResponse>("/api/v1/auth/register", {
        authenticated: false,
        body: JSON.stringify({
          email: form.get("email"),
          name: form.get("name"),
          password: form.get("password")
        }),
        method: "POST"
      });
      setToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={submit}>
        <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Create your workspace account.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          id="name"
          name="name"
          required
          type="text"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          id="email"
          name="email"
          required
          type="email"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">
          Create account
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-brand-700" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
