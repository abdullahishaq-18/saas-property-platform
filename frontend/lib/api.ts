import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.authenticated !== false) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
};

export type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  size: number;
  description: string;
  generated_description: string | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: number;
  name: string;
  email: string;
  source: string;
  status: string;
};
