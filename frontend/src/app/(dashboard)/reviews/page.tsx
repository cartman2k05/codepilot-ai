"use client"

import { useState } from "react"
import Link from "next/link"
import { useReviews } from "@/hooks/useReviews"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { ScoreRing } from "@/components/shared/ScoreRing"
import { PlusCircle, FileCode, Clock, DollarSign, Terminal, Layers } from "lucide-react"

export default function ReviewsListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useReviews(page, 9)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="h-10 w-32 rounded bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-zinc-900 border border-zinc-850 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-400">
        <h3 className="font-bold mb-2">Error loading reviews</h3>
        <p className="text-sm">{error.message || "Failed to retrieve historic reviews."}</p>
      </div>
    )
  }

  const { items, total, size } = data
  const totalPages = Math.ceil(total / size)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Code Reviews</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse through your historic review reports and track learning progress.
          </p>
        </div>
        <Link href="/reviews/new">
          <Button className="gap-2 font-semibold">
            <PlusCircle className="h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((rev: any) => (
          <Link href={`/reviews/${rev.id}`} key={rev.id}>
            <Card className="hover:border-violet-500/40 relative overflow-hidden bg-zinc-900/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="block text-xs text-zinc-500 font-mono">Review #{rev.id}</span>
                    <span className="block font-bold text-white text-base">
                      {rev.file_count} {rev.file_count === 1 ? "File" : "Files"} submitted
                    </span>
                  </div>
                  {rev.status === "completed" && rev.overall_score !== null ? (
                    <ScoreRing score={rev.overall_score} size="sm" />
                  ) : (
                    <Badge
                      variant={rev.status === "failed" ? "error" : "warning"}
                      className="uppercase tracking-wider text-[8px]"
                    >
                      {rev.status}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-3 pt-2 text-xs text-zinc-400">
                  <div className="flex items-center space-x-1.5">
                    <Terminal className="h-4 w-4 text-zinc-500" />
                    <span className="truncate max-w-[120px]">{rev.model_used || "Pending"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span>{(rev.latency_ms / 1000).toFixed(1)}s run</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="h-4 w-4 text-zinc-500" />
                    <span>${rev.cost.toFixed(4)} cost</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Layers className="h-4 w-4 text-zinc-500" />
                    <span className="font-semibold text-zinc-400">
                      {rev.escalated ? "Escalated (70B)" : "Drafter (8B)"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  <span>{new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <EmptyState
          icon={<FileCode className="h-12 w-12" />}
          title="No reviews found"
          description="Submit code snippets or files to retrieve automated styling and security review analysis."
          action={
            <Link href="/reviews/new">
              <Button>Upload code now</Button>
            </Link>
          }
        />
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-zinc-500 font-mono">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
