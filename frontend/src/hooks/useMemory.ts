import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAPI } from "@/lib/api"

export function useMemoryStats() {
  return useQuery({
    queryKey: ["memory-stats"],
    queryFn: () => fetchAPI("/api/memory/stats")
  })
}

export function useMemoryTimeline() {
  return useQuery({
    queryKey: ["memory-timeline"],
    queryFn: () => fetchAPI("/api/memory/timeline")
  })
}

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: () => fetchAPI("/api/repositories/")
  })
}

export function useRepositoryKnowledge(repoId: number) {
  return useQuery({
    queryKey: ["repo-knowledge", repoId],
    queryFn: () => fetchAPI(`/api/repositories/${repoId}/knowledge`),
    enabled: !!repoId
  })
}

export function useCreateRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      fetchAPI("/api/repositories/", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    }
  })
}
