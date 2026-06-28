import { useQuery } from "@tanstack/react-query"
import { fetchAPI } from "@/lib/api"

export function useAuditLogs(page = 1, size = 20) {
  return useQuery({
    queryKey: ["audit-logs", page, size],
    queryFn: () => fetchAPI(`/api/audit/?page=${page}&size=${size}`)
  })
}

export function useAuditStats() {
  return useQuery({
    queryKey: ["audit-stats"],
    queryFn: () => fetchAPI("/api/audit/stats")
  })
}

export function useEscalations() {
  return useQuery({
    queryKey: ["audit-escalations"],
    queryFn: () => fetchAPI("/api/audit/escalations")
  })
}
