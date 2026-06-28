const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchAPI<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("codepilot_token") : null
  
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    let errorMsg = "An API error occurred"
    try {
      const errData = await res.json()
      errorMsg = errData.detail || errorMsg
    } catch {
      try {
        errorMsg = await res.text()
      } catch {}
    }
    throw new Error(errorMsg)
  }

  // Handle empty or 204 responses
  if (res.status === 204) {
    return {} as T
  }

  return res.json()
}
