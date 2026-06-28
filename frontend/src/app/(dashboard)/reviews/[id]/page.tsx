"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReview, useReviewStatus, useSubmitFeedback } from "@/hooks/useReviews"
import { useReviewStore } from "@/stores/reviewStore"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ScoreRing } from "@/components/shared/ScoreRing"
import { EmptyState } from "@/components/shared/EmptyState"
import { useRepositories } from "@/hooks/useMemory"
import {
  FileCode,
  ShieldAlert,
  Zap,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  TrendingUp,
  Terminal,
  Activity,
  Award
} from "lucide-react"
import MonacoEditor from "@monaco-editor/react"
import { motion, AnimatePresence } from "framer-motion"

export default function ReviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reviewId = parseInt(params.id as string)

  const { selectedFileIndex, selectedCategory, selectedSeverity, setSelectedFile, setCategory, setSeverity, resetFilters } = useReviewStore()
  const [showFixes, setShowFixes] = useState<Record<number, boolean>>({})
  
  // local feedback animation status dictionary
  const [actionedIds, setActionedIds] = useState<Record<number, "accepted" | "rejected" | "ignored">>({})

  // 1. Fetch main review details
  const { data: review, isLoading, error, refetch } = useReview(reviewId)
  
  // 2. Poll status if review is pending or processing
  const isProcessing = review && (review.status === "pending" || review.status === "processing")
  const { data: statusData } = useReviewStatus(reviewId, !!isProcessing)

  // Trigger refetch if polling status changes to completed/failed
  useEffect(() => {
    if (statusData && (statusData.status === "completed" || statusData.status === "failed")) {
      refetch()
    }
  }, [statusData, refetch])

  // Reset filters on unmount
  useEffect(() => {
    return () => resetFilters()
  }, [resetFilters])

  const feedbackMutation = useSubmitFeedback()

  if (isLoading || (review && isProcessing)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-violet-500 animate-spin" />
          <BrainIconPulse className="absolute inset-0 m-auto h-6 w-6 text-violet-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-lg font-bold text-white">Analyzing Code...</h2>
          <p className="text-sm text-zinc-500">
            Running Tree-sitter parsing, static Semgrep analysis, and routing optimal Groq LLM reviewer.
          </p>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-12 w-12 text-rose-500" />}
        title="Review not found"
        description={error?.message || "Failed to load code review details."}
        action={
          <Button onClick={() => router.push("/reviews")}>Go to Reviews</Button>
        }
      />
    )
  }

  if (review.status === "failed") {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-12 w-12 text-rose-500" />}
        title="Analysis Failed"
        description="The code review pipeline failed to compile or generate a report. Verify your files and try again."
        action={
          <Button onClick={() => router.push("/reviews/new")}>Try Another Upload</Button>
        }
      />
    )
  }

  // Get active file
  const activeFile = review.files[selectedFileIndex]
  
  // Categories chips
  const categories = [
    { label: "All", value: null },
    { label: "Security", value: "security" },
    { label: "Performance", value: "performance" },
    { label: "Bugs", value: "bugs" },
    { label: "Architecture", value: "architecture" },
    { label: "Readability", value: "readability" },
    { label: "Maintainability", value: "maintainability" }
  ]

  // Severity chips
  const severities = [
    { label: "All", value: null },
    { label: "Critical", value: "critical" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" }
  ]

  // Filter issues list
  const filteredIssues = review.issues.filter((issue) => {
    if (selectedCategory && issue.category.toLowerCase() !== selectedCategory) return false
    if (selectedSeverity && issue.severity.toLowerCase() !== selectedSeverity) return false
    
    // Only show issues for the active file
    if (activeFile && issue.file_id !== activeFile.id) return false
    
    return true
  })

  const handleFeedback = async (issueId: number, action: "accepted" | "rejected" | "ignored") => {
    // Optimistic visual update
    setActionedIds((prev) => ({ ...prev, [issueId]: action }))
    
    try {
      await feedbackMutation.mutateAsync({
        review_id: reviewId,
        issue_id: issueId,
        action
      })
    } catch {
      // Revert on error
      setActionedIds((prev) => {
        const copy = { ...prev }
        delete copy[issueId]
        return copy
      })
    }
  }

  const toggleFix = (id: number) => {
    setShowFixes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      {/* Top Scored Header Banner */}
      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md justify-between items-center">
        <div className="flex items-center space-x-6">
          <ScoreRing score={review.overall_score || 0} size="lg" label="Overall Code Health" />
          
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Review Report #{review.id}</h1>
            <p className="text-xs text-zinc-400">
              Completed on {new Date(review.created_at).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="text-[10px] uppercase font-mono px-2">
                Security: {(review.security_score || 0).toFixed(0)}/100
              </Badge>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono px-2">
                Performance: {(review.performance_score || 0).toFixed(0)}/100
              </Badge>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono px-2">
                Architecture: {(review.architecture_score || 0).toFixed(0)}/100
              </Badge>
            </div>
          </div>
        </div>

        {/* Runtime routing info panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:border-l border-zinc-800 md:pl-6 text-xs font-mono text-zinc-400">
          <div className="space-y-1">
            <span className="block text-zinc-600 text-[9px] uppercase font-semibold">Model Selected</span>
            <span className="block text-zinc-300 font-bold truncate max-w-[120px]">
              {review.model_used || "Unknown"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-zinc-600 text-[9px] uppercase font-semibold">Latency</span>
            <span className="block text-zinc-300 font-bold">{(review.latency_ms / 1000).toFixed(1)}s</span>
          </div>
          <div className="space-y-1">
            <span className="block text-zinc-600 text-[9px] uppercase font-semibold">Cost</span>
            <span className="block text-zinc-300 font-bold">${review.cost.toFixed(4)}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-zinc-600 text-[9px] uppercase font-semibold">Escalated?</span>
            <span className={review.escalated ? "text-amber-500 font-bold" : "text-zinc-500"}>
              {review.escalated ? "Yes (70B)" : "No (8B)"}
            </span>
          </div>
        </div>
      </div>

      {/* Split Screen review area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: File tree and Monaco Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
            {/* File selection bar */}
            <div className="flex items-center space-x-1.5 p-3.5 bg-zinc-900 border-b border-zinc-850">
              <FileCode className="h-4.5 w-4.5 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-400 tracking-wider">FILES IN REVIEW</span>
            </div>
            
            <div className="flex border-b border-zinc-900 divide-x divide-zinc-900 overflow-x-auto">
              {review.files.map((file, idx) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(idx)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2",
                    idx === selectedFileIndex
                      ? "border-violet-500 bg-zinc-900/40 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                  )}
                >
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>

            {/* Monaco Editor Wrapper */}
            <div className="relative bg-[#1e1e1e] h-[480px]">
              {activeFile ? (
                <MonacoEditor
                  height="100%"
                  language={activeFile.language}
                  theme="vs-dark"
                  value={activeFile.content}
                  options={{
                    readOnly: true,
                    fontSize: 12,
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 12 }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                  Select a file from list above
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Issues list and filters */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Filters card */}
          <Card className="border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-all",
                      selectedCategory === cat.value
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity selection */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Severity</span>
              <div className="flex flex-wrap gap-1.5">
                {severities.map((sev) => (
                  <button
                    key={sev.label}
                    onClick={() => setSeverity(sev.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-all",
                      selectedSeverity === sev.value
                        ? "bg-zinc-800 border border-zinc-700 text-white"
                        : "bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Issues card listing */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredIssues.map((issue) => {
                const action = actionedIds[issue.id] || issue.feedback_status
                const showFix = showFixes[issue.id] || false
                
                return (
                  <motion.div
                    key={issue.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        "border-zinc-800 bg-zinc-900/30 overflow-hidden relative transition-colors duration-300",
                        action === "accepted" && "border-emerald-500/30 bg-emerald-500/5",
                        action === "rejected" && "border-rose-500/30 bg-rose-500/5",
                        action === "ignored" && "border-zinc-800 bg-zinc-900/10 opacity-70"
                      )}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                issue.severity === "critical" || issue.severity === "high"
                                  ? "error"
                                  : issue.severity === "medium"
                                  ? "warning"
                                  : "success"
                              }
                              className="uppercase text-[9px] px-2 py-0.5 rounded"
                            >
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-mono capitalize">
                              {issue.category.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          {/* Confidence rating bar */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {(issue.confidence * 100).toFixed(0)}% Match
                            </span>
                          </div>
                        </div>

                        {/* Issue description details */}
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-sm leading-snug">{issue.title}</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">{issue.explanation}</p>
                        </div>

                        {/* Fix details drawer */}
                        {issue.improved_code && (
                          <div className="pt-2">
                            <button
                              onClick={() => toggleFix(issue.id)}
                              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                            >
                              {showFix ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  <span>Hide Suggested Fix</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Show Suggested Fix</span>
                                </>
                              )}
                            </button>
                            
                            {showFix && (
                              <div className="mt-2.5 rounded-lg border border-zinc-850 overflow-hidden text-[10px] font-mono bg-black/40 max-h-40 overflow-y-auto">
                                <pre className="p-3 text-zinc-300 whitespace-pre-wrap">{issue.improved_code}</pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Feedback controls action bar */}
                        <div className="border-t border-zinc-900 pt-3 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Line {issue.line_start || 1}
                          </span>
                          
                          {action === "pending" ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs px-2.5 h-7"
                                onClick={() => handleFeedback(issue.id, "ignored")}
                              >
                                Ignore
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-800 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs px-2.5 h-7"
                                onClick={() => handleFeedback(issue.id, "rejected")}
                              >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 h-7"
                                onClick={() => handleFeedback(issue.id, "accepted")}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Accept
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
                              {action === "accepted" && <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />}
                              {action === "rejected" && <X className="h-3.5 w-3.5 text-rose-400 mr-1" />}
                              <span>{action}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
              
              {filteredIssues.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  No issues found matching selection.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrainIconPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 6v12" />
      <path d="M8 10h8" />
    </svg>
  )
}
