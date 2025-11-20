// api.ts
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.accessToken || null;
}

export async function apiCall(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string,                           // token may be undefined
  updateToken?: (newToken: string) => void // optional callback to sync AuthContext
) {
  // Normalize token to string | null
  const normalizedToken: string | null = token ?? null;

  const makeRequest = async (accessToken: string | null) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  };

  // 1) Initial request
  let res = await makeRequest(normalizedToken);

  // 2) If expired token, try refreshing
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error("Session expired. Please login again.");
    }

    // Update localStorage
    localStorage.setItem("token", newToken);

    // Update React state via optional callback
    updateToken?.(newToken);

    // Retry request with new token
    res = await makeRequest(newToken);
  }

  // 3) Final validation
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
}
