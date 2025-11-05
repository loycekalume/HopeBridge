export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiCall(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
}
