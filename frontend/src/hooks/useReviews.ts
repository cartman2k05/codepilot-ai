import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAPI } from "@/lib/api"

export function useReviews(page = 1, size = 10) {
  return useQuery({
    queryKey: ["reviews", page, size],
    queryFn: () => fetchAPI(`/api/reviews/?page=${page}&size=${size}`)
  })
}

export function useReview(id: number) {
  return useQuery({
    queryKey: ["review", id],
    queryFn: () => fetchAPI(`/api/reviews/${id}`),
    enabled: !!id
  })
}

export function useReviewStatus(id: number, isProcessing = false) {
  return useQuery({
    queryKey: ["review-status", id],
    queryFn: () => fetchAPI(`/api/reviews/${id}/status`),
    refetchInterval: (query) => {
      // Poll every 2 seconds if still pending/processing
      const data = query.state.data as any
      if (data && (data.status === "pending" || data.status === "processing")) {
        return 2000
      }
      return false
    },
    enabled: !!id && isProcessing
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { repo_id?: number; files: Array<{ filename: string; content: string; language?: string }> }) =>
      fetchAPI("/api/reviews/", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { review_id: number; issue_id: number; action: string; comment?: string }) =>
      fetchAPI(`/api/feedback/reviews/${payload.review_id}/issues/${payload.issue_id}/feedback`, {
        method: "POST",
        body: JSON.stringify({ action: payload.action, comment: payload.comment })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["review", variables.review_id] })
      queryClient.invalidateQueries({ queryKey: ["memory-stats"] })
      queryClient.invalidateQueries({ queryKey: ["memory-timeline"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }
  })
}
