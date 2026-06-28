"use client"

import { useState } from "react"
import Link from "next/link"
import { useRepositories, useRepositoryKnowledge, useCreateRepository } from "@/hooks/useMemory"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/Dialog"
import { Progress } from "@/components/ui/Progress"
import { EmptyState } from "@/components/shared/EmptyState"
import { Network, PlusCircle, BookOpen, Layers, CheckSquare, ShieldX, Terminal, ArrowUpRight, HelpCircle } from "lucide-react"

export default function KnowledgeGraphPage() {
  const { data: repos = [], isLoading: reposLoading } = useRepositories()
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null)
  
  // Set default repo selection when repos list loads
  if (!selectedRepoId && repos.length > 0) {
    setSelectedRepoId(repos[0].id)
  }

  const { data: knowledge, isLoading: knowledgeLoading } = useRepositoryKnowledge(selectedRepoId || 0)
  
  // Dialog repository creation form state
  const [newRepoName, setNewRepoName] = useState("")
  const [newRepoDesc, setNewRepoDesc] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const createRepoMutation = useCreateRepository()

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRepoName.trim()) return
    try {
      const res = await createRepoMutation.mutateAsync({
        name: newRepoName.trim(),
        description: newRepoDesc.trim()
      })
      setSelectedRepoId(res.id)
      setNewRepoName("")
      setNewRepoDesc("")
      setDialogOpen(false)
    } catch {}
  }

  if (reposLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
        <div className="h-12 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          <div className="h-60 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    )
  }

  const categories = [
    { key: "frameworks", label: "Preferred Frameworks", icon: BookOpen, color: "border-violet-500/20 bg-violet-500/5 text-violet-400" },
    { key: "conventions", label: "Formatting & Style Conventions", icon: Terminal, color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
    { key: "patterns", label: "Architecture Patterns", icon: Layers, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
    { key: "testing", label: "Testing Preferences", icon: CheckSquare, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
    { key: "avoided", label: "Avoided Patterns & Libraries", icon: ShieldX, color: "border-rose-500/20 bg-rose-500/5 text-rose-400" }
  ]

  const hasAnyEntries = knowledge && (
    knowledge.frameworks.length > 0 ||
    knowledge.conventions.length > 0 ||
    knowledge.patterns.length > 0 ||
    knowledge.testing.length > 0 ||
    knowledge.avoided.length > 0
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Network className="h-8 w-8 text-violet-400" />
            Team Knowledge Graph
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Visual profiles representing architectural styles and patterns learned from code reviews.
          </p>
        </div>

        {/* Dialog triggered creation button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-semibold">
              <PlusCircle className="h-4 w-4" />
              Register Repository
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 max-w-sm">
            <DialogHeader>
              <DialogTitle>Register Repository</DialogTitle>
              <DialogDescription className="text-zinc-500">
                Setup repository mapping to start collecting team coding conventions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRepo} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="repo-name">Repository Name</Label>
                <Input
                  id="repo-name"
                  placeholder="acme-frontend"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="border-zinc-800"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repo-desc">Description (Optional)</Label>
                <Input
                  id="repo-desc"
                  placeholder="React web app with Tailwind"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  className="border-zinc-800"
                />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="border-zinc-800 text-zinc-400">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createRepoMutation.isPending}>
                  {createRepoMutation.isPending ? "Creating..." : "Create Repository"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {repos.length > 0 ? (
        <div className="space-y-6">
          {/* Repo selector trigger */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="repo-select" className="shrink-0">Active Profile:</Label>
            <Select
              value={selectedRepoId?.toString() || "none"}
              onValueChange={(val) => setSelectedRepoId(parseInt(val))}
            >
              <SelectTrigger id="repo-select" className="w-64 border-zinc-800">
                <SelectValue placeholder="Select Repository" />
              </SelectTrigger>
              <SelectContent>
                {repos.map((r: any) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {knowledgeLoading ? (
            <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-850 animate-pulse" />
          ) : hasAnyEntries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const entries = knowledge ? (knowledge as any)[cat.key] : []
                const Icon = cat.icon
                
                if (entries.length === 0) return null

                return (
                  <Card key={cat.key} className="border-zinc-800 bg-zinc-900/10">
                    <CardHeader className="flex flex-row items-center space-x-3 pb-4">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${cat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">{cat.label}</CardTitle>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 px-6 pb-6">
                      {entries.map((entry: any) => (
                        <div key={entry.id} className="rounded-lg border border-zinc-850 bg-zinc-900/30 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-white">{entry.key.toUpperCase()}</span>
                            {entry.source_review_id && (
                              <Link
                                href={`/reviews/${entry.source_review_id}`}
                                className="inline-flex items-center text-[10px] font-semibold text-violet-400 hover:underline"
                              >
                                Review #{entry.source_review_id}
                                <ArrowUpRight className="ml-0.5 h-3 w-3" />
                              </Link>
                            )}
                          </div>
                          
                          <p className="text-xs text-zinc-300 leading-relaxed">{entry.value}</p>
                          
                          {/* Confidence level tracker */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                              <span>Confidence level</span>
                              <span>{(entry.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={entry.confidence * 100} className="h-1 bg-zinc-950" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Network className="h-12 w-12" />}
              title="Knowledge Graph empty"
              description="This repository has no recorded style selections. Start submitting reviews and actioning suggestions to build its profile."
              action={
                <Link href="/reviews/new">
                  <Button>Submit review</Button>
                </Link>
              }
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No repositories registered"
          description="Register a code repository profile to track conventions and styling selections."
          action={
            <Button onClick={() => setDialogOpen(true)}>Create First Repository</Button>
          }
        />
      )}
    </div>
  )
}
