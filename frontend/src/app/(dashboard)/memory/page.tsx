"use client"

import { useMemoryStats, useMemoryTimeline } from "@/hooks/useMemory"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { Badge } from "@/components/ui/Badge"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Brain, ThumbsUp, Layers, Zap, Calendar, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export default function MemoryTimelinePage() {
  const { data: stats, isLoading: statsLoading } = useMemoryStats()
  const { data: timelineData, isLoading: timelineLoading } = useMemoryTimeline()

  if (statsLoading || timelineLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>
    )
  }

  const entries = timelineData?.entries || []
  
  // Recharts colors for pie chart
  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
  const pieData = stats?.top_categories?.map((cat: any) => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    value: cat.count
  })) || []

  const statsCards = [
    { label: "Total Memories", val: stats?.total_memories || 0, icon: Brain, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    { label: "Acceptance Rate", val: stats?.acceptance_rate || 0, icon: ThumbsUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", suffix: "%" },
    { label: "Categories Learned", val: stats?.top_categories?.filter((c: any) => c.count > 0).length || 0, icon: Layers, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Learning Velocity", val: stats?.learning_velocity || 0, icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", suffix: "/rev", decimals: 1 }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Brain className="h-8 w-8 text-violet-400" />
          Memory Evolution
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Explore how CodePilot AI learns your team's custom preferences over time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i} className="border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <span className="block text-2xl font-bold text-white font-mono leading-none">
                    <AnimatedCounter value={card.val} suffix={card.suffix} decimals={card.decimals} />
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

      {/* Timeline & Category breakdown split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Memory Timeline */}
        <Card className="border-zinc-800 bg-zinc-900/30 lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Evolution Timeline</CardTitle>
            <CardDescription className="text-zinc-500">
              Chronological log of patterns retained from code reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-l-2 border-zinc-850 pl-6 ml-4 space-y-8">
              {entries.map((entry: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative"
                >
                  {/* Timeline Badge circle */}
                  <div className="absolute left-[-35px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-violet-600 font-mono text-[10px] font-bold text-white shadow-md">
                    {entry.review_number}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <Badge variant="outline" className="text-[9px] font-semibold border-zinc-800 text-zinc-400">
                        Review #{entry.review_id}
                      </Badge>
                    </div>

                    <div className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-4 space-y-2">
                      <span className="block text-xs font-semibold text-zinc-400">LEARNED PREFERENCES:</span>
                      <ul className="space-y-1.5 list-disc list-inside text-xs text-zinc-300">
                        {entry.learned.map((rule: string, rIdx: number) => (
                          <li key={rIdx} className="leading-relaxed">
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Pie Distribution Chart */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/30">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Memory Breakdown</CardTitle>
              <CardDescription className="text-zinc-500">Distribution of learned rules by category.</CardDescription>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                      itemStyle={{ fontSize: 11, color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-zinc-500 font-mono">No data collected yet</span>
              )}
            </CardContent>
          </Card>

          {/* Feedback ratio stats */}
          <Card className="border-zinc-800 bg-zinc-900/30">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Memory Accuracy Ratio</CardTitle>
              <CardDescription className="text-zinc-500">Comparing Accepted vs Rejected recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Accepted", count: stats?.accepted_count || 24, fill: "#10b981" },
                    { name: "Rejected", count: stats?.rejected_count || 4, fill: "#ef4444" },
                    { name: "Ignored", count: stats?.ignored_count || 2, fill: "#52525b" }
                  ]}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                    itemStyle={{ fontSize: 11, color: "#fff" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#52525b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
