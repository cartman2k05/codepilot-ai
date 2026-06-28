"use client"

import Link from "next/link"
import { useDashboard } from "@/hooks/useDashboard"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from "recharts"
import {
  Brain,
  BookOpen,
  Target,
  ThumbsUp,
  DollarSign,
  TrendingUp,
  Clock,
  Heart,
  PlusCircle,
  FileCode,
  ArrowRight
} from "lucide-react"

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
          <div className="h-10 w-32 rounded bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 md:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          <div className="h-80 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-400">
        <h3 className="font-bold mb-2">Error loading dashboard</h3>
        <p className="text-sm">{error.message || "Failed to load dashboard metrics."}</p>
      </div>
    )
  }

  const { stats, recent_reviews, cost_over_time, activity_feed } = data

  const statCards = [
    { label: "Learning Score", val: stats.learning_score, icon: Brain, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", suffix: "%" },
    { label: "Repository IQ", val: stats.repository_iq, icon: BookOpen, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", suffix: "%" },
    { label: "Memory Accuracy", val: stats.memory_accuracy, icon: Target, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", suffix: "%" },
    { label: "Acceptance Rate", val: stats.suggestion_acceptance_rate, icon: ThumbsUp, color: "text-green-400 bg-green-500/10 border-green-500/20", suffix: "%" },
    { label: "Model Savings", val: stats.model_savings, icon: DollarSign, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", prefix: "$" },
    { label: "Escalation Rate", val: stats.escalation_rate, icon: TrendingUp, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", suffix: "%" },
    { label: "Avg Review Time", val: stats.avg_review_time_ms / 1000, icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", suffix: "s", decimals: 1 },
    { label: "Code Health", val: stats.code_health_score, icon: Heart, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", suffix: "/100" }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Overview of team knowledge learning and model routing savings.
          </p>
        </div>
        <Link href="/reviews/new">
          <Button className="gap-2 font-semibold shadow-md shadow-violet-500/20">
            <PlusCircle className="h-4 w-4" />
            New Code Review
          </Button>
        </Link>
      </div>

      {/* 8 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i} className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <span className="block text-2xl font-bold text-white font-mono leading-none">
                    <AnimatedCounter
                      value={card.val}
                      prefix={card.prefix}
                      suffix={card.suffix}
                      decimals={card.decimals}
                    />
                  </span>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${card.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts & Feed split area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Savings Area Chart */}
        <Card className="border-zinc-800 bg-zinc-900/30 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Cost Savings Over Time</CardTitle>
            <CardDescription className="text-zinc-500">
              Comparing cascadeflow routing vs standard flagship Llama-70b reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cost_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                  itemStyle={{ fontSize: 12, color: "#fff" }}
                  labelStyle={{ fontSize: 10, color: "#a1a1aa" }}
                />
                <Area type="monotone" dataKey="cost" name="Actual Cost ($)" stroke="#9333ea" fillOpacity={1} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="savings" name="Money Saved ($)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Activity Feed</CardTitle>
            <CardDescription className="text-zinc-500">Timeline logs of latest reviewer updates.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="relative border-l border-zinc-850 pl-4 space-y-5">
              {activity_feed.map((act: any, i: number) => (
                <div key={i} className="relative group">
                  {/* Indicator bullet */}
                  <div className="absolute left-[-21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-violet-500 group-hover:scale-110 transition-transform" />
                  <span className="block text-[10px] text-zinc-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-0.5">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Listing section */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Reviews</CardTitle>
            <CardDescription className="text-zinc-500">Tracks status of recently submitted files.</CardDescription>
          </div>
          <Link href="/reviews">
            <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-white">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-semibold text-xs tracking-wider">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Files</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Overall Score</th>
                  <th className="py-3 px-6">Model</th>
                  <th className="py-3 px-6">Cost</th>
                  <th className="py-3 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {recent_reviews.map((rev: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 group transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-400 group-hover:text-white">
                      <Link href={`/reviews/${rev.id}`}>#{rev.id}</Link>
                    </td>
                    <td className="py-4 px-6 flex items-center space-x-2 text-zinc-300">
                      <FileCode className="h-4.5 w-4.5 text-zinc-500" />
                      <span>{rev.file_count} files</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          rev.status === "completed"
                            ? "success"
                            : rev.status === "processing" || rev.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        className="uppercase tracking-wide text-[9px] px-2 py-0.5 rounded"
                      >
                        {rev.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-mono text-white">
                      {rev.overall_score ? `${rev.overall_score.toFixed(0)}/100` : "-"}
                    </td>
                    <td className="py-4 px-6 text-zinc-400">
                      {rev.model_used || "-"}
                      {rev.escalated && (
                        <span className="ml-1.5 text-[9px] font-semibold text-amber-500 uppercase">
                          Escalated
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      ${rev.cost.toFixed(4)}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500 font-mono text-xs">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recent_reviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 text-sm">
                      No code reviews submitted yet. Click "New Code Review" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
