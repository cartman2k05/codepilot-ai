import { useQuery } from "@tanstack/react-query"
import { fetchAPI } from "@/lib/api"

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchAPI("/api/dashboard/")
  })
}
