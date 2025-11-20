// api.ts
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");

// --- Refresh Access Token ---
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

// --- Main API Call ---
export async function apiCall(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
) {
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

  let res = await makeRequest(normalizedToken);

  // --- Handle 401 silently and retry ---
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error("Session expired. Please login again.");
    }

    localStorage.setItem("token", newToken);
    res = await makeRequest(newToken);
  }

  // --- Final validation ---
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
}
